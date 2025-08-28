#!/bin/bash

# 🧹 GitHub Actions Workflow Cleanup Script
# Automatically deletes old workflow runs to free up space and clean history

set -e

# Configuration
REPO_OWNER="TechTyphoon"
REPO_NAME="secure-flow-automaton"
WORKFLOW_NAME="reliable-ci.yml"
MAX_RUNS_TO_KEEP=10  # Keep only the 10 most recent runs
DRY_RUN=false  # Set to true to preview what would be deleted

echo "🧹 GitHub Actions Workflow Cleanup Script"
echo "=========================================="
echo "Repository: $REPO_OWNER/$REPO_NAME"
echo "Workflow: $WORKFLOW_NAME"
echo "Keep latest: $MAX_RUNS_TO_KEEP runs"
echo "Dry run: $DRY_RUN"
echo ""

# Function to check if gh CLI is installed
check_gh_cli() {
    if ! command -v gh &> /dev/null; then
        echo "❌ Error: GitHub CLI (gh) is not installed."
        echo "Please install it from: https://cli.github.com/"
        echo "Or run: sudo apt install gh (Ubuntu/Debian)"
        exit 1
    fi
    
    # Check if authenticated
    if ! gh auth status &> /dev/null; then
        echo "❌ Error: Not authenticated with GitHub CLI."
        echo "Please run: gh auth login"
        exit 1
    fi
    
    echo "✅ GitHub CLI is installed and authenticated"
}

# Function to get workflow runs
get_workflow_runs() {
    echo "📋 Fetching workflow runs..."
    
    # Get workflow runs in JSON format
    gh api repos/$REPO_OWNER/$REPO_NAME/actions/workflows/$WORKFLOW_NAME/runs \
        --paginate \
        --jq '.workflow_runs[] | {id: .id, run_number: .run_number, status: .status, conclusion: .conclusion, created_at: .created_at, head_branch: .head_branch, display_title: .display_title}' \
        > /tmp/workflow_runs.json
    
    echo "✅ Found workflow runs data"
}

# Function to analyze and delete old runs
cleanup_old_runs() {
    echo "🔍 Analyzing workflow runs..."
    
    # Count total runs
    total_runs=$(jq length /tmp/workflow_runs.json 2>/dev/null || echo "0")
    echo "📊 Total workflow runs found: $total_runs"
    
    if [ "$total_runs" -le "$MAX_RUNS_TO_KEEP" ]; then
        echo "✅ No cleanup needed. Only $total_runs runs found (keeping up to $MAX_RUNS_TO_KEEP)"
        return
    fi
    
    # Sort by run number (descending) and get runs to delete
    runs_to_delete=$(jq -r "sort_by(.run_number) | reverse | .[$MAX_RUNS_TO_KEEP:] | .[] | .id" /tmp/workflow_runs.json 2>/dev/null)
    
    if [ -z "$runs_to_delete" ]; then
        echo "✅ No runs to delete"
        return
    fi
    
    echo "🗑️  Runs to delete:"
    echo "$runs_to_delete" | while read run_id; do
        if [ -n "$run_id" ]; then
            run_info=$(jq -r ".[] | select(.id == $run_id) | \"Run #\(.run_number) (\(.head_branch)) - \(.display_title)\"" /tmp/workflow_runs.json 2>/dev/null)
            echo "   - $run_info"
        fi
    done
    
    if [ "$DRY_RUN" = true ]; then
        echo ""
        echo "🔍 DRY RUN MODE: No runs were actually deleted"
        echo "Set DRY_RUN=false to perform actual deletion"
        return
    fi
    
    echo ""
    echo "🗑️  Deleting old workflow runs..."
    
    deleted_count=0
    echo "$runs_to_delete" | while read run_id; do
        if [ -n "$run_id" ]; then
            echo "   Deleting run ID: $run_id"
            
            # Delete the workflow run
            if gh api repos/$REPO_OWNER/$REPO_NAME/actions/runs/$run_id \
                --method DELETE \
                --silent; then
                echo "   ✅ Deleted run ID: $run_id"
                deleted_count=$((deleted_count + 1))
            else
                echo "   ❌ Failed to delete run ID: $run_id"
            fi
            
            # Small delay to avoid rate limiting
            sleep 1
        fi
    done
    
    echo ""
    echo "✅ Cleanup completed! Deleted $deleted_count old workflow runs"
}

# Function to show current status
show_status() {
    echo ""
    echo "📊 Current Workflow Status:"
    echo "=========================="
    
    # Get current workflow runs count
    current_runs=$(gh api repos/$REPO_OWNER/$REPO_NAME/actions/workflows/$WORKFLOW_NAME/runs \
        --jq '.total_count' 2>/dev/null || echo "0")
    
    echo "Total workflow runs: $current_runs"
    echo "Runs to keep: $MAX_RUNS_TO_KEEP"
    echo "Runs that would be deleted: $((current_runs - MAX_RUNS_TO_KEEP))"
    
    # Show recent runs
    echo ""
    echo "📋 Recent workflow runs:"
    gh api repos/$REPO_OWNER/$REPO_NAME/actions/workflows/$WORKFLOW_NAME/runs \
        --jq '.workflow_runs[0:5][] | "  \(.run_number): \(.conclusion // .status) - \(.display_title)"' 2>/dev/null || echo "  Unable to fetch recent runs"
}

# Main execution
main() {
    echo "🚀 Starting workflow cleanup process..."
    echo ""
    
    # Check prerequisites
    check_gh_cli
    
    # Get workflow runs
    get_workflow_runs
    
    # Show current status
    show_status
    
    # Perform cleanup
    cleanup_old_runs
    
    # Cleanup temporary files
    rm -f /tmp/workflow_runs.json
    
    echo ""
    echo "🎉 Workflow cleanup process completed!"
    echo ""
    echo "💡 Tips:"
    echo "  - Run this script periodically to keep your workflow history clean"
    echo "  - Adjust MAX_RUNS_TO_KEEP to keep more or fewer runs"
    echo "  - Set DRY_RUN=true to preview changes without deleting"
    echo "  - Check GitHub Actions settings for automatic cleanup options"
}

# Run main function
main "$@"
