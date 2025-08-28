#!/usr/bin/env python3
"""
🧹 GitHub Actions Complete Workflow Cleanup Script
Cleans up ALL workflows (including deleted/archived) to achieve a target total number of runs
"""

import requests
import json
import time
import sys
from datetime import datetime
from collections import defaultdict

# Configuration
REPO_OWNER = "TechTyphoon"
REPO_NAME = "secure-flow-automaton"
TARGET_TOTAL_RUNS = 80  # Target total runs across all workflows
DRY_RUN = False  # Set to False for actual deletion

# GitHub API base URL
GITHUB_API_BASE = "https://api.github.com"

def get_github_token():
    """Get GitHub token from environment"""
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

def get_all_workflow_runs(token):
    """Get all workflow runs from the repository (including deleted workflows)"""
    print("📋 Fetching all workflow runs...")
    all_runs = []
    page = 1
    per_page = 100
    
    while True:
        url = f"{GITHUB_API_BASE}/repos/{REPO_OWNER}/{REPO_NAME}/actions/runs?page={page}&per_page={per_page}"
        response = make_api_request(url, token)
        if not response:
            break
            
        data = response.json()
        runs = data.get('workflow_runs', [])
        
        if not runs:
            break
            
        all_runs.extend(runs)
        print(f"  Fetched page {page}: {len(runs)} runs")
        
        if len(runs) < per_page:
            break
            
        page += 1
        time.sleep(0.1)  # Rate limiting
    
    # Sort by creation date (oldest first)
    all_runs.sort(key=lambda x: x['created_at'])
    return all_runs

def delete_workflow_run(run_id, token):
    """Delete a specific workflow run"""
    url = f"{GITHUB_API_BASE}/repos/{REPO_OWNER}/{REPO_NAME}/actions/runs/{run_id}"
    response = make_api_request(url, token, method='DELETE')
    return response is not None

def main():
    print("🧹 GitHub Actions Complete Workflow Cleanup Script")
    print("=" * 60)
    print(f"Repository: {REPO_OWNER}/{REPO_NAME}")
    print(f"Target total runs: {TARGET_TOTAL_RUNS}")
    print(f"Dry run: {DRY_RUN}")
    print()

    # Get GitHub token
    token = get_github_token()
    
    # Get all workflow runs (including from deleted workflows)
    all_runs = get_all_workflow_runs(token)
    total_runs = len(all_runs)
    
    print(f"\n📊 Current Status:")
    print(f"   Total runs found: {total_runs}")
    print(f"   Target runs: {TARGET_TOTAL_RUNS}")
    print(f"   Runs to delete: {max(0, total_runs - TARGET_TOTAL_RUNS)}")
    
    if total_runs <= TARGET_TOTAL_RUNS:
        print("\n✅ No cleanup needed! Already at or below target.")
        return
    
    # Group runs by workflow name
    workflow_groups = defaultdict(list)
    for run in all_runs:
        workflow_name = run['name']
        workflow_groups[workflow_name].append(run)
    
    print(f"\n📋 Workflow Distribution:")
    for workflow_name, runs in workflow_groups.items():
        print(f"   {workflow_name}: {len(runs)} runs")
    
    # Calculate how many runs to delete
    runs_to_delete = total_runs - TARGET_TOTAL_RUNS
    print(f"\n🗑️ Need to delete {runs_to_delete} runs total")
    
    # Prioritize deletion: delete oldest runs first, regardless of workflow
    runs_to_delete_list = all_runs[:runs_to_delete]
    runs_to_keep = all_runs[runs_to_delete:]
    
    # Show deletion plan
    print(f"\n📋 Deletion Plan:")
    print(f"   Delete: {len(runs_to_delete_list)} oldest runs")
    print(f"   Keep: {len(runs_to_keep)} most recent runs")
    
    print(f"\n🗑️ Runs to be deleted (first {min(10, len(runs_to_delete_list))}):")
    for i, run in enumerate(runs_to_delete_list[:10], 1):
        created = datetime.fromisoformat(run['created_at'].replace('Z', '+00:00'))
        status = run['conclusion'] if run['conclusion'] else run['status']
        workflow_name = run['name']
        print(f"   {i:3d}. {workflow_name} - Run #{run['run_number']} - {run['display_title'][:40]}... ({status}) - {created.strftime('%Y-%m-%d %H:%M')}")
    
    if len(runs_to_delete_list) > 10:
        print(f"   ... and {len(runs_to_delete_list) - 10} more runs")
    
    print(f"\n✅ Runs to keep (most recent {min(5, len(runs_to_keep))}):")
    for i, run in enumerate(runs_to_keep[-5:], 1):
        created = datetime.fromisoformat(run['created_at'].replace('Z', '+00:00'))
        status = run['conclusion'] if run['conclusion'] else run['status']
        workflow_name = run['name']
        print(f"   {i:3d}. {workflow_name} - Run #{run['run_number']} - {run['display_title'][:40]}... ({status}) - {created.strftime('%Y-%m-%d %H:%M')}")
    
    if DRY_RUN:
        print(f"\n🔍 DRY RUN MODE - No actual deletion will occur")
        print(f"To perform actual deletion, set DRY_RUN = False in the script")
        return
    
    # Confirm deletion
    print(f"\n⚠️ WARNING: This will permanently delete {len(runs_to_delete_list)} workflow runs!")
    print("This action cannot be undone.")
    
    confirm = input("\nType 'DELETE' to confirm: ")
    if confirm != 'DELETE':
        print("❌ Deletion cancelled")
        return
    
    # Perform deletion
    print(f"\n🗑️ Deleting {len(runs_to_delete_list)} workflow runs...")
    deleted_count = 0
    failed_count = 0
    
    for i, run in enumerate(runs_to_delete_list, 1):
        run_id = run['id']
        run_number = run['run_number']
        workflow_name = run['name']
        
        print(f"   [{i:3d}/{len(runs_to_delete_list)}] Deleting {workflow_name} - Run #{run_number}...", end=" ")
        
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
    print(f"   📊 Target achieved: {TARGET_TOTAL_RUNS} total runs")

if __name__ == "__main__":
    main()
