# POWLAX Icon Reference Documentation

## Overview
This document outlines all the icon changes made to the POWLAX React App to maintain brand consistency and functionality throughout the build process.

## Icon Updates

### 1. Practice Planner Header
- **Location**: `/src/app/(authenticated)/teams/[teamId]/practice-plans/page.tsx`
- **URL**: `https://powlax.com/wp-content/uploads/2025/07/POWLAX-Practice-Planner-Header.png`
- **Implementation**: Replaced text header with branded image
- **Size**: `h-16 object-contain`

### 2. Sidebar Logo
- **Location**: `/src/components/navigation/SidebarNavigation.tsx`
- **URL**: `https://powlax.com/wp-content/uploads/2024/12/POWLAX-Logo-and-Text-White-Border-1.png`
- **Implementation**: Replaced "POWLAX" text with logo image
- **Size**: `h-10 w-auto`

### 3. Video Icon
- **Locations**: 
  - `/src/components/practice-planner/DrillCard.tsx`
  - `/src/components/practice-planner/DrillLibrary.tsx`
- **URL**: `https://powlax.com/wp-content/uploads/2025/06/Video-1.svg`
- **Implementation**: Replaced `<Video>` Lucide icon with SVG image
- **Size**: `h-4 w-4` (DrillCard), `h-3 w-3` (DrillLibrary)
- **Notes**: Added opacity-40 class when video is not available

### 4. Lacrosse Lab Icon
- **Locations**: 
  - `/src/components/practice-planner/DrillCard.tsx`
  - `/src/components/practice-planner/DrillLibrary.tsx`
- **URL**: `https://powlax.com/wp-content/uploads/2025/06/Lacrosse-Lab-Link-1.svg`
- **Implementation**: Replaced `<Beaker>` Lucide icon with SVG image
- **Size**: `h-4 w-4` (DrillCard), `h-3 w-3` (DrillLibrary)

### 5. Notes/Edit Icon
- **Location**: `/src/components/practice-planner/DrillCard.tsx`
- **URL**: `https://powlax.com/wp-content/uploads/2025/06/Pencil-1.svg`
- **Implementation**: Replaced `<Edit3>` Lucide icon with SVG image
- **Size**: `h-4 w-4`

## Icons Not Changed
- **Info Icon**: Kept existing circle-i icon as requested
- **Link Icon**: Kept existing `<Link>` icon for external links modal
- **X/O Icon**: Kept existing text "X/O" for strategies modal

## Maintenance Notes

### Image Loading
- All images are loaded from external POWLAX CDN URLs
- Ensure URLs remain accessible and valid
- Consider downloading and hosting locally for production if needed

### Styling Consistency
- All icon buttons maintain hover states with `hover:bg-gray-100`
- Disabled states use `opacity-40` for consistency
- Icon sizes are consistent within each context

### Future Updates
- If icons need updating, replace the URL in the src attribute
- Maintain size classes for consistency
- Test on both mobile and desktop views

## Desktop vs Mobile Considerations
- Icons display at same sizes on both desktop and mobile
- Hover states only apply on desktop (touch devices don't have hover)
- All icons are clickable/tappable with appropriate padding for touch targets

## Troubleshooting
If icons don't display:
1. Check if the image URLs are still valid
2. Verify network connectivity to powlax.com
3. Check browser console for 404 errors
4. Consider implementing fallback icons using conditional rendering