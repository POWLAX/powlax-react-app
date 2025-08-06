# POWLAX Drills Manager - Mobile CSS Implementation Focus

## Current Priority: Mobile Shortcode CSS Completion

**SINGLE OBJECTIVE**: Complete the CSS implementation for `[powlax_practice_planner_mobile]` to make it fully functional and usable on mobile devices.

The mobile shortcode has been separated and needs CSS extraction from the original `planner.css` file to populate `planner-mobile.css` with all necessary mobile styles.

**Version**: 1.4.2  
**WordPress Compatibility**: 5.0+  
**PHP Version**: 7.4+  
**License**: GPL-2.0+

---

## Architecture Overview

```
POWLAX Plugin Architecture
├── Core PHP Backend
│   ├── Main Plugin File (powlax-drills.php)
│   ├── Custom Post Types (Drills & Practice Plans)
│   ├── REST API Endpoints
│   ├── AJAX Handlers
│   └── WordPress Integration
├── Security & Performance Modules
│   ├── Security (includes/security.php)
│   ├── Caching (includes/cache.php)
│   └── Error Handling (includes/error-handler.php)
├── Frontend Application
│   ├── Template System (templates/)
│   ├── JavaScript SPA (assets/js/)
│   └── Responsive CSS (assets/css/)
└── Admin Interface
    ├── Custom Meta Boxes
    ├── CSV Import System
    └── Media Management
```

---

## PHP Backend Components

### 1. Main Plugin File (`powlax-drills.php`)
**Size**: 2,193 lines  
**Role**: Core plugin orchestrator

#### Key Features:
- **Plugin Registration**: WordPress hooks, activation/deactivation
- **Custom Post Types**: 
  - `powlax_drill` - Individual drill library items
  - `powlax_practice` - Saved practice plans
- **Shortcode System**: `[powlax_practice_planner]`
- **Asset Management**: Conditional loading based on context
- **Database Optimization**: Custom indexes for performance

#### WordPress Integration:
```php
// Custom Post Type Registration
register_post_type('powlax_drill', [
    'public' => true,
    'show_in_rest' => true,
    'supports' => ['title', 'editor', 'author'],
    'menu_icon' => 'dashicons-clipboard'
]);

// REST API Endpoints
register_rest_route('powlax/v1', '/drills', [
    'methods' => 'GET',
    'callback' => 'powlax_rest_get_drills'
]);
```

#### Advanced Features:
- **URL Validation**: Multi-domain support (YouTube, Vimeo, Hudl, Lacrosse Lab)
- **Media Integration**: Up to 5 images per drill with drag-and-drop reordering
- **Lacrosse Lab Integration**: Automatic iframe embed generation
- **Game State Taxonomy**: Meta-based categorization system

### 2. Security Module (`includes/security.php`)
**Size**: 435 lines  
**Role**: Comprehensive security framework

#### Security Features:
- **Rate Limiting**: Transient-based with configurable limits
  ```php
  private static $rate_limits = [
      'ajax_save_practice' => ['requests' => 10, 'window' => 300],
      'rest_api' => ['requests' => 100, 'window' => 300]
  ];
  ```
- **IP-Based Blocking**: Automatic suspicious activity detection
- **Input Sanitization**: WordPress-native sanitization functions
- **Nonce Verification**: CSRF protection with testing bypasses
- **Content Security Policy**: Dynamic CSP headers

#### Rate Limiting Implementation:
- Uses WordPress transients for persistence
- Per-user and per-IP tracking
- Configurable windows and thresholds
- Integration with error handling system

### 3. Caching System (`includes/cache.php`)
**Size**: 342 lines  
**Role**: Performance optimization

#### Caching Strategy:
- **Drill Data Caching**: Full drill dataset with user favorites
- **WordPress Transients**: Native WordPress caching API
- **Cache Invalidation**: Automatic on drill updates
- **Conditional Caching**: Toggleable via `POWLAX_CACHE_ENABLED`

#### Cache Implementation:
```php
public static function get_drills() {
    if (!self::is_enabled()) return false;
    return get_transient(self::$cache_keys['drills']);
}

public static function set_drills($data) {
    if (!self::is_enabled()) return false;
    return set_transient(self::$cache_keys['drills'], $data, self::$cache_duration);
}
```

### 4. Error Handling (`includes/error-handler.php`)
**Size**: 541 lines  
**Role**: Comprehensive error management

#### Error Handling Features:
- **Structured Logging**: Category-based error classification
- **AJAX Error Responses**: Standardized JSON error responses
- **Exception Handling**: Try-catch blocks throughout codebase
- **Debug Integration**: Integration with frontend debug system
- **WordPress Logging**: Native WordPress error logging

---

## JavaScript Frontend Application

### 1. Main Application (`assets/js/planner.js`)
**Size**: 10,777 lines  
**Role**: Single-page application core

#### Architecture Pattern:
- **Module Pattern**: Self-contained functional modules
- **Event Delegation**: Centralized event handling
- **State Management**: `currentPracticeData` global state object
- **Component System**: Reusable UI components

#### Key Components:

##### Drag & Drop System:
```javascript
// SortableJS Integration
new Sortable(practiceRowsContainer, {
    group: 'drills',
    animation: 150,
    onEnd: function(evt) {
        updatePracticeOrder();
        calculateTotalTime();
    }
});
```

##### Modal Management:
```javascript
const modalSystem = {
    stack: [],
    open: function(modalId) { /* Implementation */ },
    close: function() { /* Implementation */ },
    closeAll: function() { /* Implementation */ }
};
```

##### Mobile Responsiveness:
- **Responsive Breakpoints**: CSS-based media queries
- **Touch Optimization**: Touch-friendly interactions
- **Modal Adaptation**: Fullscreen modals on mobile
- **Swipe Gestures**: Native touch support

#### State Management:
```javascript
let currentPracticeData = {
    info: { name: '', date: '', startTime: '', field: 'Turf' },
    goals: { coaching: '', offensive: '', defensive: '', goalie: '', faceOff: '' },
    drills: [], // Array of drill objects
    totalMinutes: 0
};
```

### 2. Enhancement Module (`assets/js/enhancements.js`)
**Size**: 522 lines  
**Role**: Progressive enhancements

#### Features:
- **Lazy Loading**: Image and content lazy loading
- **Accessibility**: ARIA labels, keyboard navigation
- **Performance**: Debounced event handlers
- **User Experience**: Smooth animations, transitions

### 3. Safety Patches (`assets/js/safety-patches.js`)
**Size**: 85 lines  
**Role**: Error prevention and fallbacks

#### Safety Features:
- **Undefined Function Guards**: Prevents undefined errors
- **Polyfills**: Browser compatibility fixes
- **Graceful Degradation**: Fallback behaviors

### 4. Custom Elements Guard (`assets/js/custom-elements-guard.js`)
**Size**: 41 lines  
**Role**: Prevents duplicate registration errors

---

## CSS Styling System

### 1. Main Stylesheet (`assets/css/planner.css`)
**Size**: 6,749 lines  
**Role**: Complete responsive styling

#### CSS Architecture:

##### CSS Custom Properties:
```css
:root {
    --powlax-blue: #3B4AA8;
    --powlax-gray: #383535;
    --spacing-md: 10px;
    --icon-large: 32px;
    --border-radius: 8px;
    --shadow-default: 0 4px 12px rgba(0,0,0,0.08);
}
```

##### Z-Index Hierarchy:
```css
/* Documented z-index system */
Layer 1: Base Content (1-99)
Layer 2: Drill Selection Modal (5000-5299)
Layer 2.5: Action Icons (5800)
Layer 2.9: Drill Library (5900)
Layer 3: Video/Lab Modals (6000-6199)
Layer 4: Gallery Modal (7000-7099)
```

##### Responsive Design:
- **Mobile-First Approach**: Progressive enhancement
- **Breakpoint System**: Consistent breakpoints across components
- **Touch Optimization**: Larger touch targets, swipe gestures
- **Viewport Units**: Flexible sizing with viewport units

##### Category Color System:
```css
--category-skill-dev: #90EE90;
--category-competition: #FFA500;
--category-gameplay: #87CEEB;
--category-team: #FFE4B5;
--category-live-play: #FFB6C1;
--category-admin: #E6E6FA;
```

### 2. Admin Stylesheet (`assets/css/admin.css`)
**Size**: 324 lines  
**Role**: WordPress admin interface styling

#### Admin Features:
- **Meta Box Styling**: Custom drill metadata interface
- **Image Management**: Drag-and-drop image ordering
- **Form Styling**: Consistent with WordPress admin
- **Media Integration**: WordPress media library integration

### 3. Practice Info Accordion (`assets/css/practice-info-accordion.css`)
**Size**: 63 lines  
**Role**: Collapsible practice information styling

---

## Template System

### 1. Practice Planner Template (`templates/practice-planner-template.php`)
**Size**: 570 lines  
**Role**: Main frontend template

#### Template Features:
- **Security Checks**: User authentication and capability verification
- **Testing Bypasses**: Automated testing support
- **Content Security Policy**: Dynamic CSP headers
- **Semantic HTML**: Accessible markup structure

#### Template Structure:
```html
<div class="powlax-planner-wrapper">
    <div class="planner-header"><!-- Header --></div>
    <div class="planner-container">
        <div class="practice-canvas"><!-- Main Canvas --></div>
        <div class="drill-library"><!-- Drill Library --></div>
    </div>
    <!-- Multiple Modal Definitions -->
</div>
```

#### Modal System:
- **Custom Drill Modal**: Create new drills
- **Notes Modal**: Edit drill notes
- **My Plans Modal**: Load saved plans
- **Gallery Modal**: Image carousel
- **Video Modal**: Video playback
- **Lacrosse Lab Modal**: Diagram viewing
- **Game State Filter Modal**: Drill filtering
- **Print Options Modal**: Print customization

---

## Database Architecture

### Custom Post Types

#### 1. `powlax_drill`
```sql
-- Core drill data stored in wp_posts
-- Metadata stored in wp_postmeta
```

**Meta Fields**:
- `_drill_category`: Skill Drills, 1v1 Drills, etc.
- `_drill_duration`: Integer (1-60 minutes)
- `_drill_video_url`: YouTube/Vimeo/Hudl URLs
- `_drill_lab_url_1` through `_drill_lab_url_5`: Lacrosse Lab URLs
- `_drill_lab_embeds`: Array of embed codes
- `_drill_custom_url`: Additional resource URLs
- `_drill_notes`: Default drill notes
- `_drill_images`: Array of attachment IDs
- `_drill_game_states`: Array of game state slugs

#### 2. `powlax_practice`
```sql
-- Practice plans stored in wp_posts
-- Full practice data in wp_postmeta
```

**Meta Fields**:
- `_practice_plan_data`: Complete practice data (JSON)
- `_powlax_created_ip`: Creator IP for security
- `_powlax_created_time`: Creation timestamp

### Database Optimization

#### Custom Indexes:
```sql
CREATE INDEX powlax_drill_category 
ON wp_postmeta (post_id, meta_key(20), meta_value(50))
WHERE meta_key = '_drill_category';

CREATE INDEX powlax_drill_duration 
ON wp_postmeta (post_id, meta_key(20), meta_value(10))
WHERE meta_key = '_drill_duration';

CREATE INDEX powlax_post_type_status 
ON wp_posts (post_type(20), post_status(20), post_title)
WHERE post_type = 'powlax_drill';
```

---

## API Architecture

### REST API Endpoints

#### 1. GET `/wp-json/powlax/v1/drills`
**Purpose**: Retrieve all drills with user favorites
**Security**: Public endpoint with rate limiting
**Response**: JSON array of drill objects

#### 2. POST `/wp-json/powlax/v1/favorites/toggle`
**Purpose**: Toggle drill favorite status
**Security**: Requires authentication
**Parameters**: `drill_id` (integer)

### AJAX Handlers

#### 1. `save_practice_plan`
**Purpose**: Save practice plan to database
**Security**: Nonce verification, capability checks, rate limiting
**Data**: JSON practice plan data

#### 2. `load_practice_plans`
**Purpose**: Load user's saved practice plans
**Security**: User authentication, rate limiting
**Response**: Array of practice plan objects

---

## Security Implementation

### Multi-Layer Security:

1. **Input Validation**:
   - WordPress sanitization functions
   - URL validation by domain
   - File type validation for uploads

2. **Authentication & Authorization**:
   - WordPress user capabilities
   - Nonce verification
   - Session management

3. **Rate Limiting**:
   - Per-user limits
   - Per-IP limits
   - Configurable windows

4. **Content Security Policy**:
   - Dynamic CSP headers
   - Nonce-based script execution
   - Restricted external domains

5. **Data Protection**:
   - SQL injection prevention
   - XSS protection
   - CSRF protection

---

## Performance Optimization

### Caching Strategy:
- **Drill Data**: Cached for 1 hour
- **User Favorites**: Real-time updates
- **Database Queries**: Optimized with custom indexes
- **Asset Loading**: Conditional loading based on context

### Asset Optimization:
- **Minification**: Production builds available
- **CDN Integration**: External libraries from CDN
- **Lazy Loading**: Images and modals
- **Code Splitting**: Modular JavaScript architecture

---

## Mobile Optimization

### Responsive Design:
- **Mobile-First CSS**: Progressive enhancement approach
- **Touch Interactions**: Optimized for touch devices
- **Viewport Management**: Prevents zoom issues
- **Performance**: Optimized for mobile networks

### Mobile-Specific Features:
- **Fullscreen Modals**: Better mobile experience
- **Touch Gestures**: Swipe and tap optimizations
- **Mobile Timeline**: Horizontal timeline view
- **Add Drills Button**: Mobile-specific UI element

---

## Integration Capabilities

### External Services:
- **YouTube**: Video embedding with validation
- **Vimeo**: Video embedding with validation
- **Hudl**: Sports video platform integration
- **Lacrosse Lab**: Diagram embedding system

### WordPress Ecosystem:
- **BuddyPress**: User profile integration
- **Media Library**: Native WordPress media integration
- **User Management**: WordPress user system
- **Admin Interface**: Native WordPress admin styling

---

## Development Tools

### Debug System:
```javascript
const POWLAX_DEBUG = {
    enabled: true,
    saveLoadTrace: true,
    dataValidation: true,
    log: function(level, category, message, data) { /* ... */ }
};
```

### Testing Support:
- **Automated Testing**: Playwright integration
- **Debug Mode**: Comprehensive debug console
- **Testing Bypasses**: Security bypasses for automated tests
- **Error Logging**: Structured error logging system

---

## File Structure Summary

```
powlax-drills/
├── powlax-drills.php           # Main plugin file (2,193 lines)
├── includes/                   # Core modules
│   ├── security.php           # Security framework (435 lines)
│   ├── cache.php              # Caching system (342 lines)
│   └── error-handler.php      # Error management (541 lines)
├── templates/                  # Template files
│   └── practice-planner-template.php  # Main template (570 lines)
├── assets/                     # Frontend assets
│   ├── css/                   # Stylesheets
│   │   ├── planner.css        # Main styles (6,749 lines)
│   │   ├── admin.css          # Admin styles (324 lines)
│   │   └── practice-info-accordion.css  # Component styles (63 lines)
│   └── js/                    # JavaScript files
│       ├── planner.js         # Main application (10,777 lines)
│       ├── admin.js           # Admin interface (209 lines)
│       ├── enhancements.js    # Progressive enhancements (522 lines)
│       ├── safety-patches.js  # Error prevention (85 lines)
│       └── custom-elements-guard.js  # Registration guard (41 lines)
└── claude-code-tasks/         # AI development documentation
    ├── architecture/          # Architecture documents
    ├── bug-fixes/            # Bug fix documentation
    └── ux-enhancements/      # UX enhancement docs
```

**Total Lines of Code**: ~23,000+ lines
**Core PHP**: ~3,500 lines
**JavaScript**: ~11,500 lines  
**CSS**: ~7,100 lines
**Templates**: ~570 lines

---

## Technology Dependencies

### Required:
- **WordPress**: 5.0+
- **PHP**: 7.4+
- **MySQL**: 5.6+

### JavaScript Libraries:
- **SortableJS**: Drag-and-drop functionality (CDN)
- **jQuery**: WordPress core dependency

### WordPress APIs:
- **REST API**: Data exchange
- **AJAX API**: Real-time interactions
- **Media API**: Image management
- **Transients API**: Caching
- **Custom Post Types**: Data structure
- **Meta API**: Metadata management

---

## Deployment Considerations

### Production Requirements:
- **SSL Certificate**: Required for secure operation
- **PHP Memory**: 256MB+ recommended
- **Database**: Optimized MySQL configuration
- **Caching**: Object caching recommended
- **CDN**: For optimal asset delivery

### Development Setup:
- **Docker**: Development environment support
- **WP-CLI**: Command-line management
- **Debug Mode**: Comprehensive debugging tools
- **Version Control**: Git-based workflow

---

This documentation represents the complete technical stack of the POWLAX Drills Manager plugin as of version 1.4.2. The plugin demonstrates advanced WordPress development practices with comprehensive security, performance optimization, and user experience considerations.