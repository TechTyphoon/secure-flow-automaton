# 🧹 GitHub Actions Workflow Cleanup Guide

## Overview

This guide provides multiple methods to clean up old GitHub Actions workflow runs to free up space and maintain a clean repository history.

## 📊 Current Status

Your repository currently has **39 workflow runs** for the `reliable-ci.yml` workflow. This guide will help you clean up old runs while keeping the most recent ones.

## 🛠️ Available Tools

### 1. Python Script (Recommended)
**File**: `cleanup_workflows.py`

**Features**:
- ✅ Easy to use and configure
- ✅ Shows detailed analysis before deletion
- ✅ Confirms before deleting
- ✅ Handles rate limiting
- ✅ Dry run mode available

**Setup**:
```bash
# Install required Python package
pip install requests

# Set your GitHub token
export GITHUB_TOKEN=your_github_token_here

# Make script executable (already done)
chmod +x cleanup_workflows.py
```

**Usage**:
```bash
# Preview what would be deleted (dry run)
python3 cleanup_workflows.py

# Edit the script to set DRY_RUN = False for actual deletion
# Then run:
python3 cleanup_workflows.py
```

### 2. Bash Script (Alternative)
**File**: `cleanup-old-workflows.sh`

**Features**:
- ✅ Uses GitHub CLI
- ✅ JSON processing with jq
- ✅ Comprehensive error handling

**Setup**:
```bash
# Install GitHub CLI
sudo apt install gh  # Ubuntu/Debian
# or visit: https://cli.github.com/

# Authenticate with GitHub
gh auth login

# Make script executable (already done)
chmod +x cleanup-old-workflows.sh
```

**Usage**:
```bash
# Run the cleanup script
./cleanup-old-workflows.sh
```

## 🔧 Configuration Options

### Python Script Configuration
Edit `cleanup_workflows.py`:

```python
# Configuration
REPO_OWNER = "TechTyphoon"
REPO_NAME = "secure-flow-automaton"
WORKFLOW_NAME = "reliable-ci.yml"
MAX_RUNS_TO_KEEP = 10  # Keep only the 10 most recent runs
DRY_RUN = False  # Set to True to preview what would be deleted
```

### Bash Script Configuration
Edit `cleanup-old-workflows.sh`:

```bash
# Configuration
REPO_OWNER="TechTyphoon"
REPO_NAME="secure-flow-automaton"
WORKFLOW_NAME="reliable-ci.yml"
MAX_RUNS_TO_KEEP=10  # Keep only the 10 most recent runs
DRY_RUN=false  # Set to true to preview what would be deleted
```

## 🚀 Quick Start

### Method 1: Using Python Script (Recommended)

1. **Get GitHub Token**:
   - Go to https://github.com/settings/tokens
   - Create a new token with `repo` permissions
   - Copy the token

2. **Set Environment Variable**:
   ```bash
   export GITHUB_TOKEN=your_github_token_here
   ```

3. **Run Dry Run First**:
   ```bash
   # Edit the script to set DRY_RUN = True
   python3 cleanup_workflows.py
   ```

4. **Perform Actual Cleanup**:
   ```bash
   # Edit the script to set DRY_RUN = False
   python3 cleanup_workflows.py
   ```

### Method 2: Using GitHub CLI

1. **Install and Authenticate**:
   ```bash
   sudo apt install gh
   gh auth login
   ```

2. **Run Cleanup**:
   ```bash
   ./cleanup-old-workflows.sh
   ```

## 📋 Manual Cleanup via GitHub Web Interface

If you prefer to clean up manually:

1. Go to your repository: https://github.com/TechTyphoon/secure-flow-automaton
2. Click on "Actions" tab
3. Click on "reliable-ci.yml" workflow
4. For each old run you want to delete:
   - Click on the run number
   - Click the "..." menu (three dots)
   - Select "Delete workflow run"
   - Confirm deletion

## 🔍 Understanding What Gets Deleted

The scripts will:
- ✅ Keep the **10 most recent** workflow runs
- ✅ Delete all older runs
- ✅ Show you exactly what will be deleted before proceeding
- ✅ Ask for confirmation before actual deletion

## 📊 Expected Results

With your current 39 workflow runs:
- **Keep**: 10 most recent runs
- **Delete**: 29 older runs
- **Space Saved**: Significant storage and cleaner history

## ⚠️ Important Notes

### Before Running Cleanup:
- ✅ **Backup**: Your code is safe, but workflow history will be lost
- ✅ **Dry Run**: Always run in dry run mode first to preview changes
- ✅ **Recent Runs**: Make sure you're not deleting important recent runs
- ✅ **Permissions**: Ensure your GitHub token has `repo` permissions

### After Cleanup:
- ✅ **History**: Old workflow runs will be permanently deleted
- ✅ **Logs**: Associated logs and artifacts will also be deleted
- ✅ **No Recovery**: Deleted runs cannot be recovered

## 🔄 Automation Options

### 1. GitHub Actions Auto-Cleanup
Add this to your workflow to automatically clean up old runs:

```yaml
# Add to your .github/workflows/reliable-ci.yml
- name: Cleanup old workflow runs
  if: github.ref == 'refs/heads/main'
  run: |
    # Keep only the last 10 runs
    gh api repos/${{ github.repository }}/actions/runs \
      --paginate \
      --jq '.workflow_runs[10:].id' \
      | xargs -I {} gh api repos/${{ github.repository }}/actions/runs/{} \
      --method DELETE
```

### 2. Scheduled Cleanup
Create a new workflow file `.github/workflows/cleanup.yml`:

```yaml
name: Cleanup Old Workflows

on:
  schedule:
    - cron: '0 2 * * 0'  # Run every Sunday at 2 AM

jobs:
  cleanup:
    runs-on: ubuntu-latest
    steps:
      - name: Cleanup old workflow runs
        run: |
          # Your cleanup script here
          python3 cleanup_workflows.py
```

## 🛡️ Safety Measures

### Built-in Safeguards:
- ✅ **Dry Run Mode**: Preview changes without deleting
- ✅ **Confirmation**: Manual confirmation required
- ✅ **Recent Protection**: Always keeps recent runs
- ✅ **Error Handling**: Graceful error handling and rollback

### Best Practices:
- ✅ **Test First**: Always run dry run mode first
- ✅ **Backup**: Consider backing up important workflow data
- ✅ **Monitor**: Check results after cleanup
- ✅ **Document**: Keep track of what was deleted

## 📞 Support

If you encounter issues:

1. **Check Permissions**: Ensure your GitHub token has proper permissions
2. **Rate Limits**: GitHub API has rate limits, scripts handle this automatically
3. **Network Issues**: Retry if network connectivity is poor
4. **Token Expiry**: GitHub tokens can expire, create a new one if needed

## 🎯 Recommended Cleanup Strategy

For your repository with 39 workflow runs:

1. **Immediate**: Keep 10 most recent runs
2. **Ongoing**: Set up automatic cleanup to maintain this number
3. **Monitoring**: Check monthly to ensure cleanup is working
4. **Adjustment**: Modify `MAX_RUNS_TO_KEEP` based on your needs

## 📈 Benefits of Cleanup

- **Storage**: Free up GitHub Actions storage space
- **Performance**: Faster workflow history loading
- **Clarity**: Cleaner repository with focused recent history
- **Cost**: Reduced storage costs (if applicable)
- **Maintenance**: Easier repository maintenance

---

**Ready to clean up? Start with the Python script in dry run mode!** 🚀
