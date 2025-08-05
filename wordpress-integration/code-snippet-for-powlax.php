<?php
/**
 * POWLAX App Integration
 * Add this to Code Snippets plugin on powlax.com
 * This creates menu items and buttons to link to the React app
 */

// 1. Add Practice Planner to Main Menu for Coaches
add_filter('wp_nav_menu_items', 'add_powlax_app_links', 10, 2);
function add_powlax_app_links($items, $args) {
    // Only add to primary menu for logged-in users
    if ($args->theme_location == 'primary' && is_user_logged_in()) {
        $current_user = wp_get_current_user();
        $roles = $current_user->roles;
        
        // Check if user is coach or admin
        $is_coach = in_array('administrator', $roles) || 
                    in_array('team_coach', $roles) || 
                    in_array('subscriber', $roles); // Adjust based on your roles
        
        if ($is_coach) {
            // Add Practice Planner link
            $items .= '<li class="menu-item menu-powlax-practice">';
            $items .= '<a href="https://app.powlax.com/teams" style="font-weight: bold; color: #FF6600;">';
            $items .= '📋 Practice Planner</a></li>';
        }
        
        // Add App Dashboard for all logged-in users
        $items .= '<li class="menu-item menu-powlax-app">';
        $items .= '<a href="https://app.powlax.com/dashboard" style="font-weight: bold; color: #003366;">';
        $items .= '🚀 POWLAX App</a></li>';
    }
    
    return $items;
}

// 2. Add Widget/Button for Practice Planner
add_shortcode('practice_planner_button', 'render_practice_planner_button');
function render_practice_planner_button($atts) {
    // Check if user is logged in
    if (!is_user_logged_in()) {
        return '<div class="powlax-app-cta">
            <p>Please <a href="/wp-login.php">login</a> to access the Practice Planner</p>
        </div>';
    }
    
    $atts = shortcode_atts(array(
        'text' => 'Open Practice Planner',
        'style' => 'large' // large, medium, small
    ), $atts);
    
    $button_class = 'powlax-button powlax-button-' . $atts['style'];
    
    return '<a href="https://app.powlax.com/teams" class="' . $button_class . '" target="_blank">' 
           . esc_html($atts['text']) . ' →</a>';
}

// 3. Add App Dashboard Button
add_shortcode('powlax_app_button', 'render_powlax_app_button');
function render_powlax_app_button($atts) {
    if (!is_user_logged_in()) {
        return '<div class="powlax-app-cta">
            <p>Please <a href="/wp-login.php">login</a> to access POWLAX App</p>
        </div>';
    }
    
    $atts = shortcode_atts(array(
        'page' => 'dashboard', // dashboard, teams, academy, resources
        'text' => 'Open POWLAX App',
        'style' => 'large'
    ), $atts);
    
    $url = 'https://app.powlax.com/' . $atts['page'];
    $button_class = 'powlax-button powlax-button-' . $atts['style'];
    
    return '<a href="' . esc_url($url) . '" class="' . $button_class . '" target="_blank">' 
           . esc_html($atts['text']) . ' →</a>';
}

// 4. Add CSS for buttons
add_action('wp_head', 'powlax_app_styles');
function powlax_app_styles() {
    ?>
    <style>
        .powlax-button {
            display: inline-block;
            text-decoration: none !important;
            font-weight: bold;
            border-radius: 5px;
            transition: all 0.3s ease;
            text-align: center;
            box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .powlax-button-large {
            padding: 15px 30px;
            font-size: 18px;
            background: linear-gradient(135deg, #003366 0%, #FF6600 100%);
            color: white !important;
        }
        
        .powlax-button-medium {
            padding: 10px 20px;
            font-size: 16px;
            background: #003366;
            color: white !important;
        }
        
        .powlax-button-small {
            padding: 8px 15px;
            font-size: 14px;
            background: #FF6600;
            color: white !important;
        }
        
        .powlax-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        }
        
        .powlax-app-cta {
            padding: 20px;
            background: #f5f5f5;
            border-left: 4px solid #003366;
            margin: 20px 0;
        }
        
        /* Menu item styling */
        .menu-powlax-practice a,
        .menu-powlax-app a {
            position: relative;
            padding-left: 25px !important;
        }
        
        .menu-powlax-practice a:before {
            content: "NEW";
            position: absolute;
            top: -5px;
            right: -20px;
            background: #FF6600;
            color: white;
            font-size: 10px;
            padding: 2px 5px;
            border-radius: 3px;
        }
    </style>
    <?php
}

// 5. Add Admin Bar Links (top bar when logged in)
add_action('admin_bar_menu', 'add_powlax_admin_bar_links', 999);
function add_powlax_admin_bar_links($wp_admin_bar) {
    if (!is_user_logged_in()) return;
    
    // Main POWLAX App node
    $wp_admin_bar->add_node(array(
        'id' => 'powlax-app',
        'title' => '🚀 POWLAX App',
        'href' => 'https://app.powlax.com/dashboard',
        'meta' => array(
            'target' => '_blank',
            'title' => 'Open POWLAX App Dashboard'
        )
    ));
    
    // Practice Planner submenu
    $wp_admin_bar->add_node(array(
        'id' => 'powlax-practice',
        'parent' => 'powlax-app',
        'title' => '📋 Practice Planner',
        'href' => 'https://app.powlax.com/teams',
        'meta' => array('target' => '_blank')
    ));
    
    // Academy submenu
    $wp_admin_bar->add_node(array(
        'id' => 'powlax-academy',
        'parent' => 'powlax-app',
        'title' => '🎓 Skills Academy',
        'href' => 'https://app.powlax.com/academy',
        'meta' => array('target' => '_blank')
    ));
}

// 6. Auto-login link generator (for seamless transition)
add_shortcode('powlax_app_link', 'generate_powlax_app_link');
function generate_powlax_app_link($atts) {
    if (!is_user_logged_in()) {
        return '';
    }
    
    $atts = shortcode_atts(array(
        'page' => 'dashboard'
    ), $atts);
    
    $current_user = wp_get_current_user();
    
    // Since JWT is already configured, user just needs to click
    // The React app will validate their existing session
    $app_url = 'https://app.powlax.com/' . $atts['page'];
    
    return $app_url;
}
?>