# 🔑 Fresh API Tokens Guide

## Required Tokens for 100% Real Data

### 1. 📊 SonarQube Token
**URL**: https://sonarcloud.io/account/security
**Steps**:
1. Login to SonarCloud
2. Go to Account → Security
3. Generate new token with name "SecureFlow-Production"
4. Copy the token (starts with `squ_...`)

### 2. 🔒 Snyk Token  
**URL**: https://app.snyk.io/account/tokens
**Steps**:
1. Login to Snyk
2. Go to Account Settings → API Tokens
3. Generate new token with name "SecureFlow-Production"
4. Copy the token (UUID format)

### 3. 🐙 GitHub Personal Access Token
**URL**: https://github.com/settings/tokens
**Steps**:
1. Go to Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. Select scopes: `repo`, `security_events`, `read:org`
4. Copy the token (starts with `ghp_...`)

### 4. 🐳 Docker Hub Access Token
**URL**: https://hub.docker.com/settings/security
**Steps**:
1. Login to Docker Hub
2. Go to Account Settings → Security
3. Generate new access token with "Read & Write" permissions
4. Copy the token (starts with `dckr_pat_...`)

### 5. 💬 Slack Webhook (if needed refresh)
**URL**: Your Slack workspace → Apps → Incoming Webhooks
**Steps**:
1. Go to your Slack workspace
2. Add "Incoming Webhooks" app
3. Create new webhook for #security-alerts channel
4. Copy webhook URL

## Quick Token Verification

Once you have the tokens, I'll verify them with:

```bash
# Test each token
curl -H "Authorization: Bearer YOUR_SONAR_TOKEN" https://sonarcloud.io/api/projects/search
curl -H "Authorization: Bearer YOUR_SNYK_TOKEN" https://api.snyk.io/rest/orgs/YOUR_ORG/projects  
curl -H "Authorization: Bearer YOUR_GITHUB_TOKEN" https://api.github.com/user
curl -H "Authorization: Bearer YOUR_DOCKER_TOKEN" https://hub.docker.com/v2/repositories/
```

## What I Need From You

Please provide:
1. **New SonarQube token**
2. **New Snyk token** 
3. **New GitHub token**
4. **New Docker Hub token**
5. **Confirm if Slack webhook needs refresh**

I'll then update the configuration and test all integrations!