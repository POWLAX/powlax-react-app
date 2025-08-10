<?php
/**
 * Plugin Name: POWLAX GamiPress Sync
 * Plugin URI: https://powlax.com
 * Description: Bi-directional sync between WordPress GamiPress and Supabase for POWLAX platform
 * Version: 1.0.0
 * Author: POWLAX Development Team
 * Author URI: https://powlax.com
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * 
 * Agent 4 - WordPress API and Sync Implementation
 * Contract: POWLAX-GAM-001
 * 
 * This plugin provides REST API endpoints for exporting GamiPress data
 * and receiving sync updates from the Supabase-powered React app.
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class POWLAX_GamiPress_Sync {
    
    private $version = '1.0.0';
    private $plugin_name = 'powlax-gamipress-sync';
    
    public function __construct() {
        add_action('init', array($this, 'init'));
        add_action('rest_api_init', array($this, 'register_rest_routes'));
        
        // Add admin menu
        add_action('admin_menu', array($this, 'add_admin_menu'));
        
        // Add cron job for automatic sync
        add_action('wp', array($this, 'schedule_sync'));
        add_action('powlax_gamipress_sync', array($this, 'run_scheduled_sync'));
    }
    
    public function init() {
        // Check if GamiPress is active
        if (!class_exists('GamiPress')) {
            add_action('admin_notices', array($this, 'gamipress_missing_notice'));
            return;
        }
        
        // Initialize plugin
        $this->define_constants();
        $this->includes();
    }
    
    private function define_constants() {
        define('POWLAX_GAMIPRESS_SYNC_VERSION', $this->version);
        define('POWLAX_GAMIPRESS_SYNC_PLUGIN_DIR', plugin_dir_path(__FILE__));
        define('POWLAX_GAMIPRESS_SYNC_PLUGIN_URL', plugin_dir_url(__FILE__));
    }
    
    private function includes() {
        // Include additional files if needed
    }
    
    /**
     * Register REST API routes
     */
    public function register_rest_routes() {
        // Export endpoint
        register_rest_route('powlax/v1', '/gamipress-export', array(
            'methods' => 'GET',
            'callback' => array($this, 'export_gamipress_data'),
            'args' => array(
                'since' => array(
                    'required' => false,
                    'type' => 'string',
                    'description' => 'Export data since this timestamp',
                    'sanitize_callback' => 'sanitize_text_field'
                ),
                'user_ids' => array(
                    'required' => false,
                    'type' => 'string',
                    'description' => 'Comma-separated user IDs to sync',
                    'sanitize_callback' => 'sanitize_text_field'
                )
            ),
            'permission_callback' => array($this, 'check_permission')
        ));
        
        // Import/update endpoint
        register_rest_route('powlax/v1', '/gamipress-import', array(
            'methods' => 'POST',
            'callback' => array($this, 'import_gamipress_data'),
            'permission_callback' => array($this, 'check_permission')
        ));
        
        // Sync status endpoint
        register_rest_route('powlax/v1', '/gamipress-status', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_sync_status'),
            'permission_callback' => array($this, 'check_permission')
        ));
    }
    
    /**
     * Check API permissions
     */
    public function check_permission($request) {
        // Check for API key in headers
        $api_key = $request->get_header('x-api-key');
        $expected_key = get_option('powlax_gamipress_api_key');
        
        if (empty($expected_key)) {
            // If no API key is set, require user to be logged in with manage_options capability
            return current_user_can('manage_options');
        }
        
        return $api_key === $expected_key;
    }
    
    /**
     * Export GamiPress data
     */
    public function export_gamipress_data($request) {
        try {
            $since = $request->get_param('since');
            $user_ids_param = $request->get_param('user_ids');
            
            // Parse user IDs
            $user_ids = array();
            if (!empty($user_ids_param)) {
                $user_ids = array_map('intval', explode(',', $user_ids_param));
                $user_ids = array_filter($user_ids, function($id) {
                    return $id > 0;
                });
            }
            
            // If no specific users requested, get all users with GamiPress data
            if (empty($user_ids)) {
                $user_ids = $this->get_users_with_gamipress_data($since);
            }
            
            $export_data = array(
                'users' => array(),
                'point_types' => $this->get_point_types(),
                'badges' => $this->get_badges(),
                'ranks' => $this->get_ranks(),
                'exported_at' => current_time('c'),
                'since' => $since
            );
            
            // Get user data
            foreach ($user_ids as $user_id) {
                $user_data = $this->get_user_gamipress_data($user_id, $since);
                if (!empty($user_data)) {
                    $export_data['users'][] = $user_data;
                }
            }
            
            return rest_ensure_response($export_data);
            
        } catch (Exception $e) {
            return new WP_Error('export_error', $e->getMessage(), array('status' => 500));
        }
    }
    
    /**
     * Get users with GamiPress data
     */
    private function get_users_with_gamipress_data($since = null) {
        global $wpdb;
        
        $since_clause = '';
        if ($since) {
            $since_timestamp = strtotime($since);
            if ($since_timestamp) {
                $since_clause = $wpdb->prepare(" AND date >= %s", date('Y-m-d H:i:s', $since_timestamp));
            }
        }
        
        // Get users with recent point transactions or badge earnings
        $sql = "
            SELECT DISTINCT user_id
            FROM {$wpdb->prefix}gamipress_logs
            WHERE type IN ('points_award', 'points_deduct', 'points_expend', 'badge_earn', 'rank_earn')
            {$since_clause}
            ORDER BY user_id
        ";
        
        $user_ids = $wpdb->get_col($sql);
        return array_map('intval', $user_ids);
    }
    
    /**
     * Get GamiPress data for a specific user
     */
    private function get_user_gamipress_data($user_id, $since = null) {
        $user = get_user_by('ID', $user_id);
        if (!$user) {
            return null;
        }
        
        $user_data = array(
            'id' => $user_id,
            'username' => $user->user_login,
            'email' => $user->user_email,
            'points' => array(),
            'badges' => array(),
            'ranks' => array()
        );
        
        // Get point balances
        $point_types = gamipress_get_points_types();
        foreach ($point_types as $point_type => $point_data) {
            $balance = gamipress_get_user_points($user_id, $point_type);
            if ($balance > 0) {
                $user_data['points'][$point_type] = $balance;
            }
        }
        
        // Get earned badges
        $badges = gamipress_get_user_achievements(array(
            'user_id' => $user_id,
            'achievement_type' => gamipress_get_achievement_types_slugs()
        ));
        
        foreach ($badges as $badge) {
            $user_data['badges'][] = array(
                'id' => $badge->ID,
                'earned_date' => $badge->date_earned,
                'badge_type' => get_post_type($badge->ID)
            );
        }
        
        // Get current ranks
        $rank_types = gamipress_get_rank_types();
        foreach ($rank_types as $rank_type => $rank_data) {
            $user_rank = gamipress_get_user_rank($user_id, $rank_type);
            if ($user_rank) {
                $user_data['ranks'][] = array(
                    'id' => $user_rank->ID,
                    'rank' => get_the_title($user_rank->ID),
                    'earned_date' => gamipress_get_user_rank_earned_date($user_id, $user_rank->ID)
                );
            }
        }
        
        return $user_data;
    }
    
    /**
     * Get all point types
     */
    private function get_point_types() {
        $point_types = gamipress_get_points_types();
        $export_data = array();
        
        foreach ($point_types as $slug => $data) {
            $export_data[] = array(
                'id' => $data['ID'],
                'slug' => $slug,
                'name' => $data['singular_name'],
                'plural_name' => $data['plural_name'],
                'icon_url' => !empty($data['image']) ? wp_get_attachment_url($data['image']) : null
            );
        }
        
        return $export_data;
    }
    
    /**
     * Get all badges
     */
    private function get_badges() {
        $badges = array();
        $achievement_types = gamipress_get_achievement_types_slugs();
        
        foreach ($achievement_types as $achievement_type) {
            $posts = get_posts(array(
                'post_type' => $achievement_type,
                'post_status' => 'publish',
                'posts_per_page' => -1
            ));
            
            foreach ($posts as $post) {
                $requirements = gamipress_get_achievement_requirements($post->ID);
                $icon_id = get_post_thumbnail_id($post->ID);
                
                $badges[] = array(
                    'id' => $post->ID,
                    'slug' => $post->post_name,
                    'title' => $post->post_title,
                    'requirements' => $requirements,
                    'icon_url' => $icon_id ? wp_get_attachment_url($icon_id) : null
                );
            }
        }
        
        return $badges;
    }
    
    /**
     * Get all ranks
     */
    private function get_ranks() {
        $ranks = array();
        $rank_types = gamipress_get_rank_types();
        
        foreach ($rank_types as $rank_type => $data) {
            $posts = get_posts(array(
                'post_type' => $rank_type,
                'post_status' => 'publish',
                'posts_per_page' => -1,
                'orderby' => 'menu_order',
                'order' => 'ASC'
            ));
            
            foreach ($posts as $post) {
                $requirements = gamipress_get_rank_requirements($post->ID);
                
                $ranks[] = array(
                    'id' => $post->ID,
                    'slug' => $post->post_name,
                    'title' => $post->post_title,
                    'requirements' => $requirements,
                    'rank_type' => $rank_type
                );
            }
        }
        
        return $ranks;
    }
    
    /**
     * Import/update GamiPress data from Supabase
     */
    public function import_gamipress_data($request) {
        try {
            $data = $request->get_json_params();
            
            if (empty($data)) {
                return new WP_Error('no_data', 'No data provided', array('status' => 400));
            }
            
            $imported = array(
                'users_updated' => 0,
                'points_awarded' => 0,
                'badges_awarded' => 0,
                'ranks_updated' => 0,
                'errors' => array()
            );
            
            // Process user updates
            if (!empty($data['users'])) {
                foreach ($data['users'] as $user_data) {
                    try {
                        $this->update_user_gamipress_data($user_data);
                        $imported['users_updated']++;
                    } catch (Exception $e) {
                        $imported['errors'][] = "User {$user_data['id']}: " . $e->getMessage();
                    }
                }
            }
            
            return rest_ensure_response($imported);
            
        } catch (Exception $e) {
            return new WP_Error('import_error', $e->getMessage(), array('status' => 500));
        }
    }
    
    /**
     * Update user GamiPress data
     */
    private function update_user_gamipress_data($user_data) {
        $user_id = $user_data['id'];
        
        // Award points
        if (!empty($user_data['points'])) {
            foreach ($user_data['points'] as $point_type => $amount) {
                if ($amount > 0) {
                    gamipress_award_points_to_user($user_id, $amount, $point_type, array(
                        'reason' => 'Supabase sync update',
                        'log_type' => 'points_award'
                    ));
                }
            }
        }
        
        // Award badges
        if (!empty($user_data['badges'])) {
            foreach ($user_data['badges'] as $badge) {
                $achievement_id = $badge['id'];
                if (!gamipress_get_user_achievements(array(
                    'user_id' => $user_id,
                    'achievement_id' => $achievement_id
                ))) {
                    gamipress_award_achievement_to_user($achievement_id, $user_id, array(
                        'reason' => 'Supabase sync update'
                    ));
                }
            }
        }
        
        // Update ranks
        if (!empty($user_data['ranks'])) {
            foreach ($user_data['ranks'] as $rank) {
                $rank_id = $rank['id'];
                gamipress_update_user_rank($user_id, $rank_id, array(
                    'reason' => 'Supabase sync update'
                ));
            }
        }
    }
    
    /**
     * Get sync status
     */
    public function get_sync_status($request) {
        $status = array(
            'last_sync' => get_option('powlax_gamipress_last_sync'),
            'next_sync' => wp_next_scheduled('powlax_gamipress_sync'),
            'sync_enabled' => get_option('powlax_gamipress_sync_enabled', false),
            'api_key_set' => !empty(get_option('powlax_gamipress_api_key')),
            'gamipress_active' => class_exists('GamiPress')
        );
        
        return rest_ensure_response($status);
    }
    
    /**
     * Schedule sync cron job
     */
    public function schedule_sync() {
        if (!wp_next_scheduled('powlax_gamipress_sync')) {
            wp_schedule_event(time(), 'hourly', 'powlax_gamipress_sync');
        }
    }
    
    /**
     * Run scheduled sync
     */
    public function run_scheduled_sync() {
        if (!get_option('powlax_gamipress_sync_enabled', false)) {
            return;
        }
        
        $supabase_endpoint = get_option('powlax_gamipress_supabase_endpoint');
        if (empty($supabase_endpoint)) {
            return;
        }
        
        // Trigger sync with Supabase
        $response = wp_remote_post($supabase_endpoint, array(
            'headers' => array(
                'Content-Type' => 'application/json',
                'Authorization' => 'Bearer ' . get_option('powlax_gamipress_api_key')
            ),
            'body' => json_encode(array(
                'source' => 'wordpress_cron',
                'timestamp' => current_time('c')
            ))
        ));
        
        if (is_wp_error($response)) {
            error_log('POWLAX GamiPress Sync Error: ' . $response->get_error_message());
        } else {
            update_option('powlax_gamipress_last_sync', current_time('c'));
        }
    }
    
    /**
     * Add admin menu
     */
    public function add_admin_menu() {
        add_options_page(
            'POWLAX GamiPress Sync',
            'POWLAX Sync',
            'manage_options',
            'powlax-gamipress-sync',
            array($this, 'admin_page')
        );
    }
    
    /**
     * Admin page
     */
    public function admin_page() {
        if (isset($_POST['save_settings'])) {
            update_option('powlax_gamipress_api_key', sanitize_text_field($_POST['api_key']));
            update_option('powlax_gamipress_supabase_endpoint', esc_url_raw($_POST['supabase_endpoint']));
            update_option('powlax_gamipress_sync_enabled', isset($_POST['sync_enabled']));
            echo '<div class="notice notice-success"><p>Settings saved!</p></div>';
        }
        
        $api_key = get_option('powlax_gamipress_api_key', '');
        $supabase_endpoint = get_option('powlax_gamipress_supabase_endpoint', '');
        $sync_enabled = get_option('powlax_gamipress_sync_enabled', false);
        ?>
        <div class="wrap">
            <h1>POWLAX GamiPress Sync Settings</h1>
            
            <form method="post" action="">
                <table class="form-table">
                    <tr>
                        <th scope="row">API Key</th>
                        <td>
                            <input type="text" name="api_key" value="<?php echo esc_attr($api_key); ?>" class="regular-text" />
                            <p class="description">API key for authentication with Supabase</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Supabase Endpoint</th>
                        <td>
                            <input type="url" name="supabase_endpoint" value="<?php echo esc_attr($supabase_endpoint); ?>" class="regular-text" />
                            <p class="description">Full URL to your Supabase sync endpoint</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Enable Automatic Sync</th>
                        <td>
                            <label>
                                <input type="checkbox" name="sync_enabled" <?php checked($sync_enabled); ?> />
                                Enable hourly sync with Supabase
                            </label>
                        </td>
                    </tr>
                </table>
                
                <?php submit_button('Save Settings', 'primary', 'save_settings'); ?>
            </form>
            
            <h2>API Endpoints</h2>
            <p>Use these endpoints to sync data:</p>
            <ul>
                <li><strong>Export:</strong> <code><?php echo home_url('/wp-json/powlax/v1/gamipress-export'); ?></code></li>
                <li><strong>Import:</strong> <code><?php echo home_url('/wp-json/powlax/v1/gamipress-import'); ?></code></li>
                <li><strong>Status:</strong> <code><?php echo home_url('/wp-json/powlax/v1/gamipress-status'); ?></code></li>
            </ul>
        </div>
        <?php
    }
    
    /**
     * Admin notice if GamiPress is missing
     */
    public function gamipress_missing_notice() {
        ?>
        <div class="notice notice-error">
            <p><?php _e('POWLAX GamiPress Sync requires the GamiPress plugin to be installed and activated.', 'powlax-gamipress-sync'); ?></p>
        </div>
        <?php
    }
}

// Initialize the plugin
new POWLAX_GamiPress_Sync();