# 🛠️ Troubleshooting Guide

This guide helps resolve common issues when setting up and running SecureFlow Automaton across different platforms.

## 🔍 Quick Diagnostics

Run these commands to quickly identify issues:

```bash
# Check system compatibility
npm run verify

# Generate system report
node scripts/post-install-verify.js

# Check all configurations
npm run setup:full
```

## 🪟 Windows-Specific Issues

### PowerShell Execution Policy

**Problem**: Scripts cannot be executed due to PowerShell execution policy.

**Solution**:
```powershell
# Check current policy
Get-ExecutionPolicy

# Set policy for current user (recommended)
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser

# Or run with bypass (one-time)
PowerShell -ExecutionPolicy Bypass -File quick-setup.sh
```

### Node.js Path Issues

**Problem**: `npm` or `node` commands not found.

**Solution**:
```powershell
# Add to PATH (replace with your Node.js path)
$env:PATH += ";C:\Program Files\nodejs"

# Or reinstall Node.js with PATH option checked
# Download from: https://nodejs.org/
```

### Long Path Support

**Problem**: File path length exceeds Windows limit (260 characters).

**Solution**:
```powershell
# Enable long path support (requires admin)
New-ItemProperty -Path "HKLM:SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force

# Or use shorter directory names
git clone https://github.com/TechTyphoon/secure-flow-automaton.git C:\sfa
```

### npm Install Failures

**Problem**: `npm install` fails with permission or dependency errors.

**Solution**:
```bash
# Clear npm cache
npm cache clean --force

# Install with legacy peer deps
npm install --legacy-peer-deps

# Or use yarn as alternative
npm install -g yarn
yarn install
```

## 🍎 macOS-Specific Issues

### Xcode Command Line Tools

**Problem**: Build failures due to missing development tools.

**Solution**:
```bash
# Install Xcode Command Line Tools
xcode-select --install

# Verify installation
xcode-select -p
```

### Apple Silicon (M1/M2) Issues

**Problem**: Dependencies fail to install on Apple Silicon Macs.

**Solution**:
```bash
# Use Node.js ARM64 version
# Download from: https://nodejs.org/en/download/

# Clear existing installation
rm -rf node_modules package-lock.json

# Install with platform-specific settings
npm config set target_arch arm64
npm install

# For stubborn packages
npm install --target_arch=arm64
```

### Permission Issues

**Problem**: Permission denied errors during installation.

**Solution**:
```bash
# Fix npm permissions (recommended)
npm config set prefix ~/.npm-global
echo 'export PATH=~/.npm-global/bin:$PATH' >> ~/.zshrc
source ~/.zshrc

# Or use nvm for better Node.js management
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
nvm install 20
nvm use 20
```

## 🐧 Linux-Specific Issues

### Missing Build Dependencies

**Problem**: Native module compilation fails.

**Solution**:

**Ubuntu/Debian**:
```bash
sudo apt update
sudo apt install build-essential python3-dev
```

**CentOS/RHEL/Fedora**:
```bash
sudo yum groupinstall "Development Tools"
# or for newer versions:
sudo dnf groupinstall "Development Tools"
```

**Arch Linux**:
```bash
sudo pacman -S base-devel
```

### Node.js Version Issues

**Problem**: System Node.js version is too old.

**Solution**:
```bash
# Using NodeSource repository (Ubuntu/Debian)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Or use nvm (recommended)
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.3/install.sh | bash
source ~/.bashrc
nvm install 20
nvm use 20
```

### Memory Issues

**Problem**: Build process runs out of memory.

**Solution**:
```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Or use swap file if low on RAM
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

## 🌐 Network and Proxy Issues

### Corporate Firewall/Proxy

**Problem**: npm cannot download packages due to corporate firewall.

**Solution**:
```bash
# Configure npm proxy
npm config set proxy http://proxy.company.com:8080
npm config set https-proxy http://proxy.company.com:8080

# For self-signed certificates
npm config set strict-ssl false

# Use corporate registry
npm config set registry https://your-corporate-registry.com/

# Clear proxy settings
npm config delete proxy
npm config delete https-proxy
```

### DNS Issues

**Problem**: Package resolution fails due to DNS issues.

**Solution**:
```bash
# Use alternative DNS servers
# Add to /etc/resolv.conf (Linux) or Network Settings (Windows/macOS)
nameserver 8.8.8.8
nameserver 8.8.4.4

# Use alternative registry
npm config set registry https://registry.npmmirror.com/
```

## 🔧 Common Application Issues

### Port Already in Use

**Problem**: Development server cannot start due to port conflict.

**Solution**:
```bash
# Check what's using the port
lsof -i :8080  # Linux/macOS
netstat -ano | findstr :8080  # Windows

# Use different port
npm run dev -- --port 3000

# Or kill the process using the port
kill -9 <PID>  # Linux/macOS
taskkill /PID <PID> /F  # Windows
```

### Environment Variables Not Loading

**Problem**: Application doesn't load environment variables.

**Solution**:
```bash
# Verify .env file exists and has correct format
ls -la .env
cat .env

# Check for common issues:
# - No spaces around = sign
# - No quotes unless needed
# - Correct variable names (must start with VITE_ for client-side)

# Restart development server after .env changes
```

### TypeScript Compilation Errors

**Problem**: TypeScript compilation fails with type errors.

**Solution**:
```bash
# Clear TypeScript cache
rm -rf node_modules/.cache/
rm -rf .tsbuildinfo

# Reinstall type dependencies
npm install --save-dev @types/node @types/react @types/react-dom

# Check TypeScript version compatibility
npx tsc --version

# Run type check independently
npm run type-check
```

### Build Failures

**Problem**: Production build fails.

**Solution**:
```bash
# Clear all caches and rebuild
npm run clean
rm -rf node_modules package-lock.json
npm install
npm run build

# Check for memory issues
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build

# Build with detailed output
npm run build -- --verbose
```

## 🐳 Docker Issues

### Docker Not Starting

**Problem**: Docker containers fail to start.

**Solution**:
```bash
# Check Docker daemon status
docker --version
docker info

# Restart Docker service
sudo systemctl restart docker  # Linux
# Use Docker Desktop restart on Windows/macOS

# Check for port conflicts
docker ps -a
docker-compose down
```

### Build Context Issues

**Problem**: Docker build fails with context errors.

**Solution**:
```bash
# Ensure you're in the project root
pwd
ls Dockerfile

# Build with specific context
docker build -t secureflow-automaton .

# Check .dockerignore file
cat .dockerignore
```

## 🔍 Getting Help

### Diagnostic Information

When reporting issues, please include:

```bash
# System information
uname -a                    # System details
node --version             # Node.js version
npm --version              # npm version
docker --version           # Docker version (if using)

# Project status
npm run verify             # Run project verification
cat system-report.txt      # System report (generated by verify)

# Error logs
npm run dev 2>&1 | tee debug.log    # Capture full error output
```

### Useful Commands

```bash
# Reset everything
npm run setup:full

# Check dependencies
npm ls --depth=0

# Audit for vulnerabilities
npm audit

# Update dependencies
npm update

# Check for outdated packages
npm outdated
```

### Support Channels

1. **GitHub Issues**: [Report bugs and feature requests](https://github.com/TechTyphoon/secure-flow-automaton/issues)
2. **Documentation**: Check README.md and inline code comments
3. **System Report**: Run `npm run verify` and share the output

## 🚀 Performance Optimization

### Development Performance

```bash
# Use faster development options
npm run dev:unix          # Unix-optimized (Linux/macOS)
npm run dev:windows       # Windows-optimized

# Increase Node.js memory
export NODE_OPTIONS="--max-old-space-size=8192"

# Use SSD storage for node_modules if possible
```

### Build Performance

```bash
# Parallel builds
npm run build -- --parallel

# Skip unnecessary checks in development
NODE_ENV=development npm run build:dev

# Use build caching
npm run build -- --cache
```

Remember: Most issues can be resolved by running `npm run setup:full` which performs a complete clean installation and verification.
