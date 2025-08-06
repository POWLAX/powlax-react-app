#!/bin/bash

# POWLAX Folder Context Creator
# Creates claude.md files in specified directories with local context
# Usage: ./create_folder_context.sh <directory> <purpose>

set -e

create_claude_context() {
    local dir=$1
    local purpose=$2
    
    if [[ -z "$dir" || -z "$purpose" ]]; then
        echo "Usage: create_claude_context <directory> <purpose>"
        echo "Example: create_claude_context 'src/components/skills-academy' 'Skills Academy educational components'"
        exit 1
    fi
    
    if [[ ! -d "$dir" ]]; then
        echo "❌ Directory $dir does not exist"
        exit 1
    fi
    
    cat > "$dir/claude.md" << EOF
# Claude Context: $(basename "$dir")

*Created: $(date)*
*Purpose: $purpose*

## 🎯 **What This Area Does**
[DESCRIBE: Purpose of this folder/feature in POWLAX lacrosse coaching platform]

## 🔧 **Key Components**
**Primary Files:**
$(find "$dir" -maxdepth 1 -name "*.tsx" -o -name "*.ts" | head -5 | while read file; do
    echo "- \`$(basename "$file")\` - [Purpose and main functionality]"
done)

$(if [[ $(find "$dir" -maxdepth 1 -type d | wc -l) -gt 1 ]]; then
    echo "**Subdirectories:**"
    find "$dir" -maxdepth 1 -type d ! -path "$dir" | while read subdir; do
        echo "- \`$(basename "$subdir")/\` - [Subdirectory purpose]"
    done
fi)

**Dependencies:**
- [External dependencies specific to this area]
- [Internal POWLAX components this relies on]

## 📱 **Mobile & Age Band Considerations**
**Mobile Responsiveness:**
- Screen sizes: 375px (mobile), 768px (tablet), 1024px (desktop)
- Touch targets: 44px+ for field usage with gloves
- High contrast for outdoor sunlight visibility
- Performance: <3 seconds load on 3G networks
- Battery efficiency for extended practice sessions

**Age Band Appropriateness:**
- **Do it (8-10):** Simple, guided interfaces with large visual elements
- **Coach it (11-14):** Scaffolded learning interfaces with helpful prompts
- **Own it (15+):** Advanced functionality with full customization options

## 🔗 **Integration Points**
**This area connects to:**
- [POWLAX components this depends on]
- [Database tables/API endpoints used]
- [Shared state/contexts accessed]
- [Authentication and role-based access requirements]

**When you modify this area, check:**
- [Related components that might be affected]
- [Integration tests to run]
- [Documentation files to update]
- [Mobile responsiveness across all breakpoints]
- [Age-appropriate interface validation]

## 🧪 **Testing Strategy**
**Essential Tests:**
- Unit tests for core functionality
- Mobile responsiveness on 375px, 768px, 1024px breakpoints
- Age-appropriate interface usability testing
- Integration with existing POWLAX features
- Performance impact measurement
- Touch target accessibility (44px+ minimum)

**Quality Gates:**
- \`npm run lint\` - Code quality validation
- \`npm run build\` - Build verification
- \`npm run typecheck\` - TypeScript validation
- Mobile device testing with gloves/outdoor conditions
- Age-band user testing with target demographics

## ⚠️ **Common Issues & Gotchas**
**Known Problems:**
- [Performance bottlenecks specific to this area]
- [Mobile compatibility issues to watch for]
- [Age band interface challenges]
- [Integration complexities with other POWLAX components]

**Before Making Changes:**
1. Run quality gates: \`npm run lint && npm run build\`
2. Test mobile responsiveness on all breakpoints
3. Validate age-appropriate interface design
4. Check integration with related POWLAX components
5. Verify authentication and role-based access works
6. Test performance impact on lower-end devices

**POWLAX Brand Standards:**
- Colors: #003366 (blue), #FF6600 (orange), #4A4A4A (gray)
- Mobile-first responsive design approach
- 15-minute practice planning workflow target
- Field usage optimization (weather, gloves, sunlight)

---
*Auto-update this file when structural changes are made to ensure context accuracy*
EOF

    echo "✅ Created claude.md in $dir"
    echo "📝 Please customize the template content for your specific area"
}

# Main execution
if [[ $# -eq 2 ]]; then
    create_claude_context "$1" "$2"
else
    echo "POWLAX Folder Context Creator"
    echo "=============================="
    echo ""
    echo "Usage: $0 <directory> <purpose>"
    echo ""
    echo "Examples:"
    echo "  $0 'src/components/skills-academy' 'Skills Academy educational components'"
    echo "  $0 'src/components/team-dashboard' 'Team management and roster components'"
    echo "  $0 'src/app/(authenticated)/admin' 'Admin interface and content management'"
    echo "  $0 'docs/features/mobile-optimization' 'Mobile optimization feature documentation'"
    echo ""
    echo "This script creates a claude.md file in the specified directory with:"
    echo "  • Local context for Claude when working in that area"
    echo "  • Mobile and age-band requirements specific to the area"
    echo "  • Integration points and testing strategies"
    echo "  • Common issues and gotchas to avoid"
    echo ""
    exit 1
fi