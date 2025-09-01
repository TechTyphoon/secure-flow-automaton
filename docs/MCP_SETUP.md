# MCP Server Setup Documentation

## GitHub MCP Server Configuration

### Overview
The GitHub MCP server is configured and working with your personal access token.

### Configuration Files
- **MCP Config**: `/home/reddy/.cursor/mcp.json`
- **Startup Script**: `/home/reddy/.cursor/start-github-mcp.sh`
- **Environment**: `/home/reddy/.cursor/.env.mcp` (backup)
- **Load Script**: `/home/reddy/.cursor/load-mcp-env.sh` (backup)

### Current Configuration
The GitHub MCP server now uses a **startup script approach** that directly embeds the token and bypasses environment variable loading issues.

### Environment Variables
- `GITHUB_PERSONAL_ACCESS_TOKEN`: Your GitHub personal access token (configured)
- `GITHUB_TOOLSETS`: Set to "all" for full functionality

### Testing
The GitHub MCP server is accessible via the startup script and properly configured with your access token.

### Available MCP Servers
Based on your configuration, you have access to:
- ✅ **GitHub** - Repository management and API access (79 tools)
- ✅ **Sequential Thinking** - Advanced reasoning tools (17 tools)
- ✅ **Filesystem** - File system operations
- ✅ **Web Search** - DuckDuckGo search functionality
- ⚙️ **Firecrawl** - Web scraping (needs API key)
- ⚙️ **AWS** - AWS services (needs configuration)
- ✅ **Kubernetes** - K8s cluster management
- ✅ **Terraform** - Infrastructure as code
- ✅ **Docker** - Container management
- ⚙️ **Prometheus** - Metrics monitoring (needs URL)
- ⚙️ **Grafana** - Visualization (needs URL)
- ⚙️ **PostgreSQL** - Database access (needs connection string)
- ⚙️ **Redis** - Cache access (needs URL)

### Status
✅ **GitHub MCP Server is WORKING and CONFIGURED**

### Troubleshooting
If you still see "No tools or prompts" in Cursor:

1. **Restart Cursor completely** - Close all instances and reopen
2. **Check the startup script** - Ensure `/home/reddy/.cursor/start-github-mcp.sh` is executable
3. **Verify Docker** - Ensure Docker is running: `docker ps`
4. **Test manually** - Run `/home/reddy/.cursor/start-github-mcp.sh` to verify it works

### Manual Test Command
```bash
timeout 15s /home/reddy/.cursor/start-github-mcp.sh << 'EOF'
{"jsonrpc": "2.0", "id": 1, "method": "initialize", "params": {"protocolVersion": "2024-11-05", "capabilities": {}, "clientInfo": {"name": "test-client", "version": "1.0.0"}}}
{"jsonrpc": "2.0", "id": 2, "method": "tools/list", "params": {}}
EOF
```

Date: September 1, 2025

## Recent Fixes Applied
- ✅ Created startup script approach to bypass environment variable loading issues
- ✅ Embedded GitHub token directly in startup script
- ✅ Verified server responds with all 79 tools
- ✅ Tested authentication and tool listing
