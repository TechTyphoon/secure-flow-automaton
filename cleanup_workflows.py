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
DELETE_FIRST_N_RUNS = 25  # Delete the first 25 workflow runs
DRY_RUN = False  # Set to False for actual deletion

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
        sys.exit(1)
    return token

def make_api_request(url, token, method='GET'):
    """Make API request with proper headers and error handling"""
    headers = {
        'Authorization': f'token {token}',
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'GitHub-Workflow-Cleanup-Script'
    }
    
    try:
        if method == 'DELETE':
            response = requests.delete(url, headers=headers)
        else:
            response = requests.get(url, headers=headers)
        
        response.raise_for_status()
        return response
    except requests.exceptions.RequestException as e:
        print(f"❌ API request failed: {e}")
        return None

def get_workflow_runs(token, page=1, per_page=100):
    """Get workflow runs with pagination"""
    url = f"{GITHUB_API_BASE}/repos/{REPO_OWNER}/{REPO_NAME}/actions/workflows/{WORKFLOW_NAME}/runs"
    params = {'page': page, 'per_page': per_page}
    
    response = make_api_request(f"{url}?page={page}&per_page={per_page}", token)
    if response:
        return response.json()
    return None

def delete_workflow_run(run_id, token):
    """Delete a specific workflow run"""
    url = f"{GITHUB_API_BASE}/repos/{REPO_OWNER}/{REPO_NAME}/actions/runs/{run_id}"
    response = make_api_request(url, token, method='DELETE')
    return response is not None

def main():
    print("🧹 GitHub Actions Workflow Cleanup Script")
    print("=" * 50)
    print(f"Repository: {REPO_OWNER}/{REPO_NAME}")
    print(f"Workflow: {WORKFLOW_NAME}")
    print(f"Delete first: {DELETE_FIRST_N_RUNS} runs")
    print(f"Dry run: {DRY_RUN}")
    print()

    # Get GitHub token
    token = get_github_token()
    
    # Get all workflow runs
    print("📋 Fetching workflow runs...")
    all_runs = []
    page = 1
    
    while True:
        data = get_workflow_runs(token, page)
        if not data or not data.get('workflow_runs'):
            break
            
        runs = data['workflow_runs']
        all_runs.extend(runs)
        
        if len(runs) < 100:  # Last page
            break
            
        page += 1
        time.sleep(0.1)  # Rate limiting
    
    total_runs = len(all_runs)
    print(f"✅ Found {total_runs} total workflow runs")
    
    if total_runs == 0:
        print("ℹ️ No workflow runs found to clean up")
        return
    
    # Sort runs by creation date (oldest first)
    all_runs.sort(key=lambda x: x['created_at'])
    
    # Get the first N runs to delete
    runs_to_delete = all_runs[:DELETE_FIRST_N_RUNS]
    runs_to_keep = all_runs[DELETE_FIRST_N_RUNS:]
    
    print(f"\n📊 Analysis:")
    print(f"   Total runs: {total_runs}")
    print(f"   Runs to delete: {len(runs_to_delete)}")
    print(f"   Runs to keep: {len(runs_to_keep)}")
    
    if len(runs_to_delete) == 0:
        print("ℹ️ No runs to delete")
        return
    
    print(f"\n🗑️ Runs to be deleted (first {DELETE_FIRST_N_RUNS}):")
    for i, run in enumerate(runs_to_delete[:10], 1):  # Show first 10
        created = datetime.fromisoformat(run['created_at'].replace('Z', '+00:00'))
        status = run['conclusion'] if run['conclusion'] else run['status']
        print(f"   {i:3d}. Run #{run['run_number']:3d} - {run['display_title'][:50]}... ({status}) - {created.strftime('%Y-%m-%d %H:%M')}")
    
    if len(runs_to_delete) > 10:
        print(f"   ... and {len(runs_to_delete) - 10} more runs")
    
    print(f"\n✅ Runs to keep (most recent {len(runs_to_keep)}):")
    for i, run in enumerate(runs_to_keep[-5:], 1):  # Show last 5
        created = datetime.fromisoformat(run['created_at'].replace('Z', '+00:00'))
        status = run['conclusion'] if run['conclusion'] else run['status']
        print(f"   {i:3d}. Run #{run['run_number']:3d} - {run['display_title'][:50]}... ({status}) - {created.strftime('%Y-%m-%d %H:%M')}")
    
    if DRY_RUN:
        print(f"\n🔍 DRY RUN MODE - No actual deletion will occur")
        print(f"To perform actual deletion, set DRY_RUN = False in the script")
        return
    
    # Confirm deletion
    print(f"\n⚠️ WARNING: This will permanently delete {len(runs_to_delete)} workflow runs!")
    print("This action cannot be undone.")
    
    confirm = input("\nType 'DELETE' to confirm: ")
    if confirm != 'DELETE':
        print("❌ Deletion cancelled")
        return
    
    # Perform deletion
    print(f"\n🗑️ Deleting {len(runs_to_delete)} workflow runs...")
    deleted_count = 0
    failed_count = 0
    
    for i, run in enumerate(runs_to_delete, 1):
        run_id = run['id']
        run_number = run['run_number']
        
        print(f"   [{i:3d}/{len(runs_to_delete)}] Deleting Run #{run_number}...", end=" ")
        
        if delete_workflow_run(run_id, token):
            print("✅ Deleted")
            deleted_count += 1
        else:
            print("❌ Failed")
            failed_count += 1
        
        # Rate limiting
        time.sleep(0.5)
    
    print(f"\n🎉 Cleanup completed!")
    print(f"   ✅ Successfully deleted: {deleted_count} runs")
    print(f"   ❌ Failed to delete: {failed_count} runs")
    print(f"   📊 Remaining runs: {len(runs_to_keep)}")

if __name__ == "__main__":
    main()
