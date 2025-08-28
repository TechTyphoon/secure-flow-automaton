#!/bin/bash

# 🧹 GitHub Actions Workflow Cleanup Script
# Automatically deletes old workflow runs to free up space and clean history

set -e

# Configuration
REPO_OWNER="TechTyphoon"
REPO_NAME="secure-flow-automaton"
WORKFLOW_NAME="reliable-ci.yml"
DELETE_FIRST_N_RUNS=250  # Delete the first 250 workflow runs
DRY_RUN=true  # Set to false to perform actual deletion

echo "🧹 GitHub Actions Workflow Cleanup Script"
echo "=========================================="
echo "Repository: $REPO_OWNER/$REPO_NAME"
echo "Workflow: $WORKFLOW_NAME"
echo "Delete first: $DELETE_FIRST_N_RUNS runs"
echo "Dry run: $DRY_RUN"
echo ""

# Function to check if gh CLI is installed
check_gh_cli() {
    if ! command -v gh &> /dev/null; then
        echo "❌ Error: GitHub CLI (gh) is not installed."
        echo "Please install it first:"
        echo "  Ubuntu/Debian: sudo apt install gh"
        echo "  macOS: brew install gh"
        echo "  Or visit: https://cli.github.com/"
        exit 1
    fi
}

# Function to check if jq is installed
check_jq() {
    if ! command -v jq &> /dev/null; then
        echo "❌ Error: jq is not installed."
        echo "Please install it first:"
        echo "  Ubuntu/Debian: sudo apt install jq"
        echo "  macOS: brew install jq"
        exit 1
    fi
}

# Function to check authentication
check_auth() {
    if ! gh auth status &> /dev/null; then
        echo "❌ Error: Not authenticated with GitHub CLI."
        echo "Please authenticate first:"
        echo "  gh auth login"
        exit 1
    fi
}

# Function to get all workflow runs
get_all_workflow_runs() {
    echo "📋 Fetching all workflow runs..."
    
    local all_runs_file=$(mktemp)
    local page=1
    local per_page=100
    
    while true; do
        echo "  Fetching page $page..."
        
        # Get workflow runs for current page
        local response=$(gh api repos/$REPO_OWNER/$REPO_NAME/actions/workflows/$WORKFLOW_NAME/runs \
            --paginate \
            --page $page \
            --limit $per_page \
            --jq '.workflow_runs[] | {id: .id, run_number: .run_number, created_at: .created_at, status: .conclusion // .status, title: .display_title}' \
            2>/dev/null)
        
        if [ -z "$response" ]; then
            break
        fi
        
        echo "$response" >> "$all_runs_file"
        
        # Check if we got a full page (if not, we're done)
        local count=$(echo "$response" | wc -l)
        if [ "$count" -lt "$per_page" ]; then
            break
        fi
        
        ((page++))
        sleep 0.1  # Rate limiting
    done
    
    echo "$all_runs_file"
}

# Function to sort runs by creation date (oldest first)
sort_runs_by_date() {
    local input_file="$1"
    local output_file="$2"
    
    # Sort by created_at field (oldest first)
    jq -s 'sort_by(.created_at)' "$input_file" > "$output_file"
}

# Function to delete workflow run
delete_workflow_run() {
    local run_id="$1"
    
    if [ "$DRY_RUN" = "true" ]; then
        echo "  [DRY RUN] Would delete run ID: $run_id"
        return 0
    fi
    
    if gh api repos/$REPO_OWNER/$REPO_NAME/actions/runs/$run_id --method DELETE &>/dev/null; then
        echo "  ✅ Deleted run ID: $run_id"
        return 0
    else
        echo "  ❌ Failed to delete run ID: $run_id"
        return 1
    fi
}

# Main execution
main() {
    # Check prerequisites
    check_gh_cli
    check_jq
    check_auth
    
    # Get all workflow runs
    local all_runs_file=$(get_all_workflow_runs)
    local sorted_runs_file=$(mktemp)
    
    # Sort runs by creation date
    sort_runs_by_date "$all_runs_file" "$sorted_runs_file"
    
    # Count total runs
    local total_runs=$(jq length "$sorted_runs_file")
    echo "✅ Found $total_runs total workflow runs"
    
    if [ "$total_runs" -eq 0 ]; then
        echo "ℹ️ No workflow runs found to clean up"
        rm -f "$all_runs_file" "$sorted_runs_file"
        exit 0
    fi
    
    # Get runs to delete (first N runs)
    local runs_to_delete_file=$(mktemp)
    jq ".[0:$DELETE_FIRST_N_RUNS]" "$sorted_runs_file" > "$runs_to_delete_file"
    
    # Get runs to keep (remaining runs)
    local runs_to_keep_file=$(mktemp)
    jq ".[$DELETE_FIRST_N_RUNS:]" "$sorted_runs_file" > "$runs_to_keep_file"
    
    local delete_count=$(jq length "$runs_to_delete_file")
    local keep_count=$(jq length "$runs_to_keep_file")
    
    echo ""
    echo "📊 Analysis:"
    echo "   Total runs: $total_runs"
    echo "   Runs to delete: $delete_count"
    echo "   Runs to keep: $keep_count"
    
    if [ "$delete_count" -eq 0 ]; then
        echo "ℹ️ No runs to delete"
        rm -f "$all_runs_file" "$sorted_runs_file" "$runs_to_delete_file" "$runs_to_keep_file"
        exit 0
    fi
    
    # Show runs to be deleted
    echo ""
    echo "🗑️ Runs to be deleted (first $DELETE_FIRST_N_RUNS):"
    jq -r '.[0:10][] | "   \(.run_number | tostring | lpad(3)): Run #\(.run_number) - \(.title | .[0:50])... (\(.status))"' "$runs_to_delete_file"
    
    if [ "$delete_count" -gt 10 ]; then
        echo "   ... and $((delete_count - 10)) more runs"
    fi
    
    # Show runs to keep
    echo ""
    echo "✅ Runs to keep (most recent $keep_count):"
    jq -r '.[-5:][] | "   \(.run_number | tostring | lpad(3)): Run #\(.run_number) - \(.title | .[0:50])... (\(.status))"' "$runs_to_keep_file"
    
    if [ "$DRY_RUN" = "true" ]; then
        echo ""
        echo "🔍 DRY RUN MODE - No actual deletion will occur"
        echo "To perform actual deletion, set DRY_RUN=false in the script"
        rm -f "$all_runs_file" "$sorted_runs_file" "$runs_to_delete_file" "$runs_to_keep_file"
        exit 0
    fi
    
    # Confirm deletion
    echo ""
    echo "⚠️ WARNING: This will permanently delete $delete_count workflow runs!"
    echo "This action cannot be undone."
    echo ""
    read -p "Type 'DELETE' to confirm: " confirm
    
    if [ "$confirm" != "DELETE" ]; then
        echo "❌ Deletion cancelled"
        rm -f "$all_runs_file" "$sorted_runs_file" "$runs_to_delete_file" "$runs_to_keep_file"
        exit 0
    fi
    
    # Perform deletion
    echo ""
    echo "🗑️ Deleting $delete_count workflow runs..."
    local deleted_count=0
    local failed_count=0
    
    jq -r '.[].id' "$runs_to_delete_file" | while read -r run_id; do
        if delete_workflow_run "$run_id"; then
            ((deleted_count++))
        else
            ((failed_count++))
        fi
        sleep 0.5  # Rate limiting
    done
    
    echo ""
    echo "🎉 Cleanup completed!"
    echo "   ✅ Successfully deleted: $deleted_count runs"
    echo "   ❌ Failed to delete: $failed_count runs"
    echo "   📊 Remaining runs: $keep_count"
    
    # Cleanup temporary files
    rm -f "$all_runs_file" "$sorted_runs_file" "$runs_to_delete_file" "$runs_to_keep_file"
}

# Run main function
main "$@"
