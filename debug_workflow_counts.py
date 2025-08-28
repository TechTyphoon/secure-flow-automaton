#!/usr/bin/env python3
"""
🔍 Debug script to investigate workflow run count discrepancy
"""

import requests
import json
import sys

# Configuration
REPO_OWNER = "TechTyphoon"
REPO_NAME = "secure-flow-automaton"
GITHUB_API_BASE = "https://api.github.com"

def get_github_token():
    import os
    token = os.getenv('GITHUB_TOKEN')
    if not token:
        print("❌ Error: GITHUB_TOKEN environment variable not set")
        sys.exit(1)
    return token

def make_api_request(url, token):
    headers = {
        'Authorization': f'token {token}',
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'Debug-Script'
    }
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"❌ API request failed: {e}")
        return None

def main():
    print("🔍 Debug: Workflow Run Count Investigation")
    print("=" * 50)
    
    token = get_github_token()
    
    # 1. Get total workflow runs count
    print("1. Checking total workflow runs...")
    total_runs_url = f"{GITHUB_API_BASE}/repos/{REPO_OWNER}/{REPO_NAME}/actions/runs?per_page=1"
    total_data = make_api_request(total_runs_url, token)
    if total_data:
        total_count = total_data.get('total_count', 0)
        print(f"   Total workflow runs reported by API: {total_count}")
    
    # 2. Get all workflows
    print("\n2. Checking all workflows...")
    workflows_url = f"{GITHUB_API_BASE}/repos/{REPO_OWNER}/{REPO_NAME}/actions/workflows"
    workflows_data = make_api_request(workflows_url, token)
    if workflows_data:
        workflows = workflows_data.get('workflows', [])
        print(f"   Total workflows found: {len(workflows)}")
        
        for workflow in workflows:
            workflow_id = workflow['id']
            workflow_name = workflow['name']
            workflow_path = workflow['path']
            workflow_state = workflow['state']
            print(f"   - {workflow_name} ({workflow_path}) - State: {workflow_state}")
            
            # 3. Get runs for each workflow
            runs_url = f"{GITHUB_API_BASE}/repos/{REPO_OWNER}/{REPO_NAME}/actions/workflows/{workflow_id}/runs?per_page=1"
            runs_data = make_api_request(runs_url, token)
            if runs_data:
                workflow_total = runs_data.get('total_count', 0)
                print(f"     Runs for this workflow: {workflow_total}")
                
                # 4. Get detailed runs info
                if workflow_total > 0:
                    detailed_runs_url = f"{GITHUB_API_BASE}/repos/{REPO_OWNER}/{REPO_NAME}/actions/workflows/{workflow_id}/runs?per_page=100"
                    detailed_runs_data = make_api_request(detailed_runs_url, token)
                    if detailed_runs_data:
                        actual_runs = len(detailed_runs_data.get('workflow_runs', []))
                        print(f"     Actual runs fetched (first 100): {actual_runs}")
                        
                        # Show first few runs
                        runs = detailed_runs_data.get('workflow_runs', [])[:5]
                        for run in runs:
                            print(f"       - Run #{run['run_number']}: {run['display_title'][:50]}... ({run['conclusion'] or run['status']})")
    
    # 5. Check if there are any disabled workflows
    print("\n3. Checking for disabled workflows...")
    all_workflows_url = f"{GITHUB_API_BASE}/repos/{REPO_OWNER}/{REPO_NAME}/actions/workflows?per_page=100"
    all_workflows_data = make_api_request(all_workflows_url, token)
    if all_workflows_data:
        all_workflows = all_workflows_data.get('workflows', [])
        print(f"   Total workflows (including disabled): {len(all_workflows)}")
        
        for workflow in all_workflows:
            if workflow['state'] != 'active':
                print(f"   - DISABLED: {workflow['name']} ({workflow['path']}) - State: {workflow['state']}")
                
                # Check runs for disabled workflows
                workflow_id = workflow['id']
                disabled_runs_url = f"{GITHUB_API_BASE}/repos/{REPO_OWNER}/{REPO_NAME}/actions/workflows/{workflow_id}/runs?per_page=1"
                disabled_runs_data = make_api_request(disabled_runs_url, token)
                if disabled_runs_data:
                    disabled_total = disabled_runs_data.get('total_count', 0)
                    print(f"     Runs for disabled workflow: {disabled_total}")

if __name__ == "__main__":
    main()
