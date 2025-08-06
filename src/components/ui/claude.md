# Claude Context: UI Components (Shadcn/UI)

*Auto-updated: 2025-01-16*  
*Purpose: Local context for Claude when working with Shadcn/UI components in POWLAX*

## 🎯 **What This Area Does**
Complete Shadcn/UI component library (17 components) customized for POWLAX brand colors and mobile-first lacrosse coaching workflows, providing consistent design system across the entire application.

## 🔧 **Key Components**
**Core UI Components:**
- `button.tsx` - Primary and secondary actions with POWLAX branding
- `card.tsx` - Content containers for drills, practices, and information
- `input.tsx` - Form inputs optimized for mobile field usage
- `textarea.tsx` - Multi-line text input for practice notes and feedback
- `label.tsx` - Accessible form labels with proper contrast

**Navigation & Layout:**
- `tabs.tsx` - Section navigation within pages
- `dialog.tsx` - Modal dialogs for confirmations and forms
- `scroll-area.tsx` - Custom scrolling areas for mobile optimization
- `accordion.tsx` - Collapsible content sections

**Data Display:**
- `table.tsx` - Data tables for team rosters and statistics
- `progress.tsx` - Progress bars for skill development and achievements
- `badge.tsx` - Status indicators and achievement badges
- `avatar.tsx` - User profile images and team member identification
- `alert.tsx` - Important notifications and system messages

**Form Controls:**
- `select.tsx` - Dropdown selections for categories and filters
- `checkbox.tsx` - Multiple selection inputs
- `slider.tsx` - Range inputs for difficulty levels and preferences

## 📱 **Mobile & Age Band Considerations**
**Mobile Responsiveness:**
- All components optimized for 375px+ screens
- Touch targets minimum 44px for field usage with gloves
- High contrast colors for outdoor sunlight visibility
- Simplified interactions for mobile-first approach
- Battery-efficient animations and transitions

**Age Band Appropriateness:**
- **Do it (8-10):** Large buttons, bright colors, simple interactions
- **Coach it (11-14):** Medium complexity, helpful feedback, guided workflows
- **Own it (15+):** Full feature access, advanced controls, customization

**Field Usage Optimization:**
- Weather-resistant design principles
- Quick loading and minimal data usage
- Emergency accessibility during practice situations
- Consistent interaction patterns across all components

## 🔗 **Integration Points**
**This area connects to:**
- Tailwind CSS configuration with POWLAX brand colors
- Next.js App Router pages and layouts
- React Hook Form for form validation and management
- Framer Motion for smooth animations and transitions
- Custom POWLAX components that compose these UI elements

**Brand Integration:**
```css
POWLAX Colors:
- Primary Blue: #003366 (main actions, branding)
- Accent Orange: #FF6600 (highlights, CTAs, progress)
- Neutral Gray: #4A4A4A (text, secondary elements)
```

**When you modify this area, also check:**
- Brand color consistency across all components
- Mobile touch target accessibility (44px+ minimum)
- High contrast ratios for outdoor field usage
- Integration with existing POWLAX component patterns
- TypeScript prop types and interface definitions

## 🧪 **Testing Strategy**
**Essential Tests:**
- Component rendering across all breakpoints (375px, 768px, 1024px)
- Touch target accessibility on mobile devices
- Color contrast ratios for accessibility compliance
- Keyboard navigation for form components
- Animation performance on lower-end devices

**Brand Validation:**
- POWLAX color usage consistency
- Typography scaling across screen sizes
- Icon usage and accessibility
- Loading states and error handling

## ⚠️ **Common Issues & Gotchas**
**Known Problems:**
- Touch targets can be too small for field usage with gloves
- High contrast requirements may conflict with Shadcn defaults
- Mobile animations may drain battery during extended practice sessions
- Complex components may confuse younger age band users

**Before Making Changes:**
1. Verify POWLAX brand color integration
2. Test mobile touch targets (44px+ minimum)
3. Check high contrast ratios for outdoor usage
4. Validate age-appropriate complexity levels
5. Test performance on lower-end mobile devices
6. Ensure consistent styling with existing components

**Shadcn/UI Configuration:**
- Style: "new-york" (clean, modern aesthetic)
- CSS Variables: Customized for POWLAX brand colors
- Components: Installed via CLI and customized for lacrosse workflows
- Accessibility: WCAG compliance for inclusive design

**Customization Patterns:**
- Use CSS variables for brand color integration
- Extend base components rather than modifying core files
- Maintain consistent spacing using Tailwind utilities
- Follow mobile-first responsive design principles
- Implement age-appropriate interface variations

---
*This file auto-updates when structural changes are made to ensure context accuracy*