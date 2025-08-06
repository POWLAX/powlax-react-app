#!/bin/bash

# POWLAX Old Version Reference Script  
# Easy access to original implementations during development
# Usage: ./reference_old_versions.sh <command> [page-name]

set -e

show_help() {
    echo "POWLAX Old Version Reference Tool"
    echo "================================="
    echo ""
    echo "Commands:"
    echo "  list                    - Show all available old pages"
    echo "  show <page-name>        - View old page implementation"
    echo "  compare <page-name>     - Compare old vs current implementation"
    echo "  backup-current          - Create backup of current development state"
    echo ""
    echo "Examples:"
    echo "  ./reference_old_versions.sh list"
    echo "  ./reference_old_versions.sh show practice-planner"
    echo "  ./reference_old_versions.sh compare skills-academy"
}

list_old_pages() {
    echo "📋 Available old page implementations:"
    echo ""
    echo "From main branch:"
    git show main:src/app/\(authenticated\) --name-only 2>/dev/null | grep -E "^[^/]+/$" | sed 's/\/$//' || echo "No pages found"
    
    echo ""
    echo "From legacy-bmad-a4cc branch:"
    git show legacy-bmad-a4cc:src/app/\(authenticated\) --name-only 2>/dev/null | grep -E "^[^/]+/$" | sed 's/\/$//' || echo "Branch not available"
}

show_old_page() {
    local page_name=$1
    
    if [[ -z "$page_name" ]]; then
        echo "❌ Please specify page name"
        echo "Usage: $0 show <page-name>"
        exit 1
    fi
    
    echo "📄 Old implementation of: $page_name"
    echo "========================================"
    
    echo ""
    echo "Main branch version:"
    git show main:src/app/\(authenticated\)/$page_name/page.tsx 2>/dev/null || echo "Not found in main"
    
    echo ""
    echo "Legacy BMad/A4CC version:"
    git show legacy-bmad-a4cc:src/app/\(authenticated\)/$page_name/page.tsx 2>/dev/null || echo "Not found in legacy branch"
}

compare_implementations() {
    local page_name=$1
    
    if [[ -z "$page_name" ]]; then
        echo "❌ Please specify page name"
        echo "Usage: $0 compare <page-name>"
        exit 1
    fi
    
    local current_file="src/app/(authenticated)/$page_name/page.tsx"
    local temp_old_file="/tmp/old-$page_name.tsx"
    
    if [[ ! -f "$current_file" ]]; then
        echo "❌ Current implementation not found: $current_file"
        exit 1
    fi
    
    # Get old version
    git show main:src/app/\(authenticated\)/$page_name/page.tsx > "$temp_old_file" 2>/dev/null || {
        echo "❌ Old implementation not found in main branch"
        exit 1
    }
    
    echo "🔍 Comparing: $page_name"
    echo "Old (main branch) vs Current (powlax-sub-agent-system branch)"
    echo "=============================================================="
    
    # Use diff or code if available
    if command -v code >/dev/null; then
        code --diff "$temp_old_file" "$current_file"
        echo "✅ Opened in VS Code diff view"
    elif command -v diff >/dev/null; then
        diff -u "$temp_old_file" "$current_file" | head -50
        echo ""
        echo "📝 Full diff available with: diff -u $temp_old_file $current_file"
    else
        echo "📝 Install 'code' or 'diff' for comparison view"
        echo "Old file saved to: $temp_old_file"
        echo "Current file: $current_file"
    fi
    
    # Clean up
    rm -f "$temp_old_file"
}

backup_current() {
    local backup_dir="backups/powlax-sub-agent-$(date +%Y%m%d-%H%M%S)"
    
    mkdir -p "$backup_dir"
    
    # Backup key development areas
    cp -r src/app/\(authenticated\) "$backup_dir/pages" 2>/dev/null || echo "No authenticated pages to backup"
    cp -r src/components "$backup_dir/components" 2>/dev/null || echo "No components to backup"
    cp -r docs/features "$backup_dir/features" 2>/dev/null || echo "No features documentation to backup"
    
    echo "✅ Backup created: $backup_dir"
    echo "📂 Contains: pages, components, feature documentation"
}

# Main execution
case "${1:-}" in
    "list")
        list_old_pages
        ;;
    "show")
        show_old_page "$2"
        ;;
    "compare")
        compare_implementations "$2"
        ;;
    "backup-current")
        backup_current
        ;;
    "help"|"--help"|"-h"|"")
        show_help
        ;;
    *)
        echo "❌ Unknown command: $1"
        echo ""
        show_help
        exit 1
        ;;
esac