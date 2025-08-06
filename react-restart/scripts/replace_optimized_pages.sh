#!/bin/bash

# POWLAX Page Replacement System
# Safely replaces old pages with optimized "new-" versions
# Usage: ./replace_optimized_pages.sh <page-name> [--dry-run]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"
BACKUP_DIR="$PROJECT_ROOT/backups/replaced-pages"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

show_usage() {
    echo "POWLAX Page Replacement System"
    echo "=============================="
    echo ""
    echo "Usage: $0 <page-name> [--dry-run]"
    echo ""
    echo "Examples:"
    echo "  $0 practice-planner"
    echo "  $0 skills-academy --dry-run"
    echo "  $0 team-dashboard"
    echo ""
    echo "Options:"
    echo "  --dry-run    Show what would be replaced without making changes"
    echo "  --list       List all available new- pages ready for replacement"
    echo "  --rollback   Rollback the last replacement (restores from backup)"
    echo ""
}

list_available_pages() {
    log_info "Available optimized pages ready for replacement:"
    echo ""
    
    find "$PROJECT_ROOT/src" -type d -name "new-*" | while read -r new_page; do
        page_name=$(basename "$new_page" | sed 's/^new-//')
        old_page=$(dirname "$new_page")/"$page_name"
        
        if [[ -d "$old_page" ]]; then
            echo "  📄 $page_name (old exists, ready for replacement)"
        else
            echo "  📄 $page_name (new page, no old version to replace)"
        fi
    done
    
    echo ""
}

create_backup() {
    local old_path=$1
    local page_name=$2
    
    mkdir -p "$BACKUP_DIR"
    local backup_name="old-$page_name-$(date +%Y%m%d-%H%M%S)"
    local backup_path="$BACKUP_DIR/$backup_name"
    
    log_info "Creating backup: $backup_name"
    cp -r "$old_path" "$backup_path"
    
    echo "$backup_path" > "$BACKUP_DIR/last-backup.txt"
    log_success "Backup created: $backup_path"
}

validate_replacement() {
    local new_path=$1
    local page_name=$2
    
    log_info "Validating optimized page: $page_name"
    
    # Check for required files
    if [[ -f "$new_path/page.tsx" ]]; then
        log_success "page.tsx found"
    else
        log_error "page.tsx not found in new version"
        return 1
    fi
    
    # Check for TypeScript errors (basic syntax check)
    if command -v npx &> /dev/null; then
        log_info "Running TypeScript validation..."
        if npx tsc --noEmit --project "$PROJECT_ROOT" 2>/dev/null; then
            log_success "TypeScript validation passed"
        else
            log_warning "TypeScript validation found issues (continuing anyway)"
        fi
    fi
    
    return 0
}

replace_page() {
    local page_name=$1
    local dry_run=$2
    
    # Find old and new page paths
    local old_path=$(find "$PROJECT_ROOT/src" -type d -name "$page_name" ! -name "new-*" | head -1)
    local new_path=$(find "$PROJECT_ROOT/src" -type d -name "new-$page_name" | head -1)
    
    if [[ -z "$new_path" ]]; then
        log_error "Optimized version 'new-$page_name' not found"
        return 1
    fi
    
    log_info "Found optimized version: $new_path"
    
    if [[ -z "$old_path" ]]; then
        log_warning "Original version '$page_name' not found - this will be a new page"
        old_path=$(dirname "$new_path")/"$page_name"
    else
        log_info "Found original version: $old_path"
    fi
    
    # Validate the new version
    if ! validate_replacement "$new_path" "$page_name"; then
        log_error "Validation failed for new-$page_name"
        return 1
    fi
    
    if [[ "$dry_run" == "true" ]]; then
        log_info "DRY RUN - Would perform these actions:"
        echo "  1. Backup: $old_path → $BACKUP_DIR/old-$page_name-$(date +%Y%m%d-%H%M%S)"
        echo "  2. Replace: $new_path → $old_path"
        echo "  3. Remove: $new_path"
        return 0
    fi
    
    # Create backup if old version exists
    if [[ -d "$old_path" ]]; then
        create_backup "$old_path" "$page_name"
        rm -rf "$old_path"
    fi
    
    # Replace with optimized version (remove "new-" prefix)
    log_info "Replacing $page_name with optimized version..."
    mv "$new_path" "$old_path"
    
    log_success "Page replacement completed: $page_name"
    
    # Verify the replacement
    if [[ -d "$old_path" && ! -d "$new_path" ]]; then
        log_success "Verification passed: $page_name is now using optimized implementation"
        
        # Update git if in git repository
        if git rev-parse --git-dir > /dev/null 2>&1; then
            git add "$old_path" 2>/dev/null || true
            log_info "Changes staged in git (remember to commit)"
        fi
    else
        log_error "Verification failed: replacement may not have completed correctly"
        return 1
    fi
}

rollback_last_replacement() {
    local backup_file="$BACKUP_DIR/last-backup.txt"
    
    if [[ ! -f "$backup_file" ]]; then
        log_error "No backup record found - cannot rollback"
        return 1
    fi
    
    local backup_path=$(cat "$backup_file")
    
    if [[ ! -d "$backup_path" ]]; then
        log_error "Backup directory not found: $backup_path"
        return 1
    fi
    
    local page_name=$(basename "$backup_path" | sed 's/^old-//' | sed 's/-[0-9]*-[0-9]*$//')
    local current_path=$(find "$PROJECT_ROOT/src" -type d -name "$page_name" ! -name "new-*" | head -1)
    
    if [[ -z "$current_path" ]]; then
        log_error "Current page path not found for rollback: $page_name"
        return 1
    fi
    
    log_info "Rolling back $page_name from backup: $backup_path"
    
    # Remove current version and restore backup
    rm -rf "$current_path"
    cp -r "$backup_path" "$current_path"
    
    log_success "Rollback completed: $page_name restored from backup"
}

# Main execution
if [[ $# -eq 0 ]]; then
    show_usage
    exit 1
fi

case "$1" in
    --help|-h)
        show_usage
        exit 0
        ;;
    --list)
        list_available_pages
        exit 0
        ;;
    --rollback)
        rollback_last_replacement
        exit $?
        ;;
    *)
        page_name=$1
        dry_run="false"
        
        if [[ "$2" == "--dry-run" ]]; then
            dry_run="true"
        fi
        
        log_info "POWLAX Page Replacement: $page_name"
        
        if [[ "$dry_run" == "true" ]]; then
            log_warning "DRY RUN MODE - No changes will be made"
        fi
        
        replace_page "$page_name" "$dry_run"
        exit $?
        ;;
esac