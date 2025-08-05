<?php
/**
 * WordPress Menu Integration for POWLAX React App
 * Add this to your theme's functions.php or Code Snippets plugin
 */

// Add menu items for logged-in users
add_filter('wp_nav_menu_items', 'add_powlax_app_menu_items', 10, 2);
function add_powlax_app_menu_items($items, $args) {
    // Only add to main menu
    if ($args->theme_location == 'primary' && is_user_logged_in()) {
        $current_user = wp_get_current_user();
        $app_url = 'https://app.powlax.com'; // Change this to your deployed URL
        
        // Generate JWT token for seamless login
        $token = ''; // JWT token will be handled by the app
        
        // Check user role
        $user_roles = $current_user->roles;
        
        // For Coaches - Add Practice Planner link
        if (in_array('team_coach', $user_roles) || in_array('administrator', $user_roles)) {
            $items .= '<li class="menu-item menu-item-practice-planner">';
            $items .= '<a href="' . $app_url . '/teams" target="_blank">';
            $items .= '<i class="fas fa-clipboard-list"></i> Practice Planner</a>';
            $items .= '</li>';
        }
        
        // For All Users - Add Dashboard link
        $items .= '<li class="menu-item menu-item-app-dashboard">';
        $items .= '<a href="' . $app_url . '/dashboard" target="_blank">';
        $items .= '<i class="fas fa-rocket"></i> POWLAX App</a>';
        $items .= '</li>';
    }
    
    return $items;
}

// Add custom button in WordPress admin bar
add_action('admin_bar_menu', 'add_powlax_app_admin_bar_link', 100);
function add_powlax_app_admin_bar_link($admin_bar) {
    if (!is_user_logged_in()) return;
    
    $app_url = 'https://app.powlax.com';
    
    $admin_bar->add_menu(array(
        'id'    => 'powlax-app',
        'title' => '🚀 POWLAX App',
        'href'  => $app_url . '/dashboard',
        'meta'  => array(
            'title' => 'Open POWLAX App',
            'target' => '_blank'
        )
    ));
    
    // Add submenu for Practice Planner
    if (current_user_can('edit_posts')) {
        $admin_bar->add_menu(array(
            'id'    => 'powlax-practice-planner',
            'parent' => 'powlax-app',
            'title' => '📋 Practice Planner',
            'href'  => $app_url . '/teams',
            'meta'  => array(
                'title' => 'Open Practice Planner',
                'target' => '_blank'
            )
        ));
    }
}

// Add shortcode for embedding app links
add_shortcode('powlax_app_button', 'powlax_app_button_shortcode');
function powlax_app_button_shortcode($atts) {
    $atts = shortcode_atts(array(
        'page' => 'dashboard',
        'text' => 'Open POWLAX App',
        'class' => 'powlax-app-button',
        'target' => '_blank'
    ), $atts);
    
    if (!is_user_logged_in()) {
        return '<a href="/wp-login.php" class="' . esc_attr($atts['class']) . '">Login to Access App</a>';
    }
    
    $app_url = 'https://app.powlax.com';
    $full_url = $app_url . '/' . ltrim($atts['page'], '/');
    
    return sprintf(
        '<a href="%s" class="%s" target="%s">%s</a>',
        esc_url($full_url),
        esc_attr($atts['class']),
        esc_attr($atts['target']),
        esc_html($atts['text'])
    );
}

// CSS for styling the buttons
add_action('wp_head', 'powlax_app_button_styles');
function powlax_app_button_styles() {
    ?>
    <style>
        .powlax-app-button {
            display: inline-block;
            padding: 12px 24px;
            background: linear-gradient(135deg, #003366 0%, #FF6600 100%);
            color: white !important;
            text-decoration: none;
            border-radius: 5px;
            font-weight: bold;
            transition: transform 0.2s;
        }
        .powlax-app-button:hover {
            transform: scale(1.05);
        }
        .menu-item-practice-planner a,
        .menu-item-app-dashboard a {
            font-weight: bold;
        }
    </style>
    <?php
}
?>