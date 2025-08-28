#!/usr/bin/env python3
"""
🧹 GitHub Actions Workflow Cleanup Script
Automatically deletes old workflow runs to free up space and clean history
"""

import requests
import json
import time
import sys
from datetime import datetime

# Configuration
REPO_OWNER = "TechTyphoon"
REPO_NAME = "secure-flow-automaton"
WORKFLOW_NAME = "reliable-ci.yml"
MAX_RUNS_TO_KEEP = 10  # Keep only the 10 most recent runs
DRY_RUN = False  # Set to True to preview what would be deleted

# GitHub API base URL
GITHUB_API_BASE = "https://api.github.com"

def get_github_token():
    """Get GitHub token from environment or prompt user"""
    import os
    token = os.getenv('GITHUB_TOKEN')
    if not token:
        print("❌ Error: GITHUB_TOKEN environment variable not set")
        print("Please set your GitHub token:")
        print("export GITHUB_TOKEN=your_github_token_here")
        print("Or create a personal access token at: https://github.com/settings/tokens")
        sys.exit(1)
    return token

def make_github_request(url, method="GET", data=None):
    """Make authenticated request to GitHub API"""
    token = get_github_token()
    headers = {
        "Authorization": f"token {token}",
        "Accept": "application/vnd.github.v3+json",
        "User-Agent": "WorkflowCleanupScript/1.0"
    }
    
    response = requests.request(method, url, headers=headers, json=data)
    
    if response.status_code == 401:
        print("❌ Error: Invalid GitHub token")
        sys.exit(1)
    elif response.status_code == 403:
        print("❌ Error: Rate limit exceeded or insufficient permissions")
        sys.exit(1)
    
    return response

def get_workflow_runs():
    """Get all workflow runs"""
    print("📋 Fetching workflow runs...")
    
    url = f"{GITHUB_API_BASE}/repos/{REPO_OWNER}/{REPO_NAME}/actions/workflows/{WORKFLOW_NAME}/runs"
    params = {"per_page": 100}
    
    all_runs = []
    page = 1
    
    while True:
        params["page"] = page
        response = make_github_request(f"{url}?per_page=100&page={page}")
        
        if response.status_code != 200:
            print(f"❌ Error fetching workflow runs: {response.status_code}")
            sys.exit(1)
        
        data = response.json()
        runs = data.get("workflow_runs", [])
        
        if not runs:
            break
            
        all_runs.extend(runs)
        page += 1
        
        # Check if we've got all runs
        if len(runs) < 100:
            break
    
    print(f"✅ Found {len(all_runs)} workflow runs")
    return all_runs

def analyze_and_cleanup(runs):
    """Analyze runs and delete old ones"""
    print("🔍 Analyzing workflow runs...")
    
    # Sort by run number (descending)
    runs.sort(key=lambda x: x["run_number"], reverse=True)
    
    total_runs = len(runs)
    print(f"📊 Total workflow runs: {total_runs}")
    print(f"📊 Runs to keep: {MAX_RUNS_TO_KEEP}")
    
    if total_runs <= MAX_RUNS_TO_KEEP:
        print("✅ No cleanup needed. Only {total_runs} runs found (keeping up to {MAX_RUNS_TO_KEEP})")
        return
    
    # Get runs to delete (everything after the first MAX_RUNS_TO_KEEP)
    runs_to_delete = runs[MAX_RUNS_TO_KEEP:]
    delete_count = len(runs_to_delete)
    
    print(f"🗑️  Runs to delete: {delete_count}")
    
    # Show what will be deleted
    print("\n📋 Runs that will be deleted:")
    for run in runs_to_delete:
        status = run.get("conclusion", run.get("status", "unknown"))
        print(f"   - Run #{run['run_number']}: {status} - {run.get('display_title', 'No title')}")
    
    if DRY_RUN:
        print("\n🔍 DRY RUN MODE: No runs were actually deleted")
        print("Set DRY_RUN = False to perform actual deletion")
        return
    
    # Confirm deletion
    print(f"\n⚠️  About to delete {delete_count} workflow runs")
    confirm = input("Do you want to continue? (y/N): ").strip().lower()
    
    if confirm not in ['y', 'yes']:
        print("❌ Deletion cancelled")
        return
    
    # Delete old runs
    print("\n🗑️  Deleting old workflow runs...")
    deleted_count = 0
    
    for run in runs_to_delete:
        run_id = run["id"]
        run_number = run["run_number"]
        
        print(f"   Deleting Run #{run_number} (ID: {run_id})")
        
        url = f"{GITHUB_API_BASE}/repos/{REPO_OWNER}/{REPO_NAME}/actions/runs/{run_id}"
        response = make_github_request(url, method="DELETE")
        
        if response.status_code == 204:
            print(f"   ✅ Deleted Run #{run_number}")
            deleted_count += 1
        else:
            print(f"   ❌ Failed to delete Run #{run_number}: {response.status_code}")
        
        # Small delay to avoid rate limiting
        time.sleep(1)
    
    print(f"\n✅ Cleanup completed! Deleted {deleted_count} old workflow runs")

def show_current_status():
    """Show current workflow status"""
    print("\n📊 Current Workflow Status:")
    print("=" * 30)
    
    # Get current workflow runs count
    url = f"{GITHUB_API_BASE}/repos/{REPO_OWNER}/{REPO_NAME}/actions/workflows/{WORKFLOW_NAME}/runs"
    response = make_github_request(f"{url}?per_page=1")
    
    if response.status_code == 200:
        data = response.json()
        total_count = data.get("total_count", 0)
        print(f"Total workflow runs: {total_count}")
        print(f"Runs to keep: {MAX_RUNS_TO_KEEP}")
        print(f"Runs that would be deleted: {max(0, total_count - MAX_RUNS_TO_KEEP)}")
        
        # Show recent runs
        print("\n📋 Recent workflow runs:")
        recent_runs = data.get("workflow_runs", [])[:5]
        for run in recent_runs:
            status = run.get("conclusion", run.get("status", "unknown"))
            print(f"  {run['run_number']}: {status} - {run.get('display_title', 'No title')}")
    else:
        print("❌ Unable to fetch workflow status")

def main():
    """Main function"""
    print("🧹 GitHub Actions Workflow Cleanup Script")
    print("=" * 50)
    print(f"Repository: {REPO_OWNER}/{REPO_NAME}")
    print(f"Workflow: {WORKFLOW_NAME}")
    print(f"Keep latest: {MAX_RUNS_TO_KEEP} runs")
    print(f"Dry run: {DRY_RUN}")
    print()
    
    try:
        # Show current status
        show_current_status()
        
        # Get workflow runs
        runs = get_workflow_runs()
        
        # Analyze and cleanup
        analyze_and_cleanup(runs)
        
        print("\n🎉 Workflow cleanup process completed!")
        print("\n💡 Tips:")
        print("  - Run this script periodically to keep your workflow history clean")
        print("  - Adjust MAX_RUNS_TO_KEEP to keep more or fewer runs")
        print("  - Set DRY_RUN = True to preview changes without deleting")
        print("  - Check GitHub Actions settings for automatic cleanup options")
        
    except KeyboardInterrupt:
        print("\n❌ Process interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()
