# Contributing to SecureFlow Automaton

Thank you for your interest in contributing to SecureFlow Automaton! This document provides guidelines and instructions for contributing to the project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Guidelines](#contributing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Issue Reporting](#issue-reporting)
- [Development Workflow](#development-workflow)
- [Testing](#testing)
- [Documentation](#documentation)
- [Security](#security)

## 🤝 Code of Conduct

This project and everyone participating in it is governed by our [Code of Conduct](CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm 9+
- Docker (optional, for containerized development)
- Git

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/secure-flow-automaton.git
   cd secure-flow-automaton
   ```

3. Add the original repository as upstream:
   ```bash
   git remote add upstream https://github.com/TechTyphoon/secure-flow-automaton.git
   ```

## 🛠️ Development Setup

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Start the database (if using Docker):**
   ```bash
   npm run docker:dev
   ```

### Docker Development

1. **Start the entire development environment:**
   ```bash
   docker-compose -f docker-compose.dev.yml up --build
   ```

2. **Access the application:**
   - Frontend: http://localhost:8080
   - Database (pgAdmin): http://localhost:5050
   - Mailhog: http://localhost:8025

## 📝 Contributing Guidelines

### Code Style

- **TypeScript**: Use strict TypeScript with proper type annotations
- **ESLint**: Follow the project's ESLint configuration
- **Prettier**: Use Prettier for code formatting
- **Naming Conventions**: Use camelCase for variables and functions, PascalCase for components

### Security Guidelines

- **Security First**: Always consider security implications of your changes
- **Secrets**: Never commit sensitive information (API keys, passwords, etc.)
- **Dependencies**: Keep dependencies updated and use `npm audit` regularly
- **Input Validation**: Always validate user inputs and sanitize data

### Commit Messages

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
type(scope): description

[optional body]

[optional footer(s)]
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test additions/changes
- `chore`: Maintenance tasks
- `security`: Security-related changes

**Examples:**
```
feat(dashboard): add real-time vulnerability monitoring
fix(auth): resolve login redirect issue
docs(readme): update installation instructions
security(api): implement rate limiting for auth endpoints
```

## 🔄 Pull Request Process

### Before Submitting

1. **Check existing issues and PRs** to avoid duplicates
2. **Create an issue** for significant changes to discuss the approach
3. **Test your changes** thoroughly
4. **Update documentation** if needed
5. **Run the full test suite**

### PR Checklist

- [ ] **Code Quality**
  - [ ] Code follows the project's style guidelines
  - [ ] All tests pass
  - [ ] No linting errors
  - [ ] TypeScript compilation successful

- [ ] **Security**
  - [ ] Security implications considered
  - [ ] No sensitive data exposed
  - [ ] Dependencies updated and audited

- [ ] **Documentation**
  - [ ] README updated (if applicable)
  - [ ] Code comments added for complex logic
  - [ ] API documentation updated (if applicable)

- [ ] **Testing**
  - [ ] Existing tests pass
  - [ ] New tests added for new functionality
  - [ ] Edge cases considered

### PR Template

```markdown
## Description
Brief description of the changes made.

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update
- [ ] Security fix

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)
Add screenshots to help reviewers understand the changes.

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] Tests added/updated
```

## 🐛 Issue Reporting

### Bug Reports

Include the following information:

1. **Environment**: OS, Node.js version, browser
2. **Steps to reproduce**: Clear, numbered steps
3. **Expected behavior**: What should happen
4. **Actual behavior**: What actually happens
5. **Screenshots**: If applicable
6. **Error messages**: Full error messages and stack traces

### Feature Requests

Include the following information:

1. **Problem**: What problem does this solve?
2. **Solution**: Proposed solution
3. **Alternatives**: Other solutions considered
4. **Additional context**: Any other relevant information

## 🔄 Development Workflow

### Branch Naming

- `feature/description`: New features
- `fix/description`: Bug fixes
- `docs/description`: Documentation updates
- `security/description`: Security-related changes
- `refactor/description`: Code refactoring

### Development Process

1. **Create a branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** and commit:
   ```bash
   git add .
   git commit -m "feat(scope): your feature description"
   ```

3. **Keep your branch updated**:
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

4. **Push your branch**:
   ```bash
   git push origin feature/your-feature-name
   ```

5. **Create a pull request** on GitHub

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run security tests
npm run lint:security

# Run type checking
npm run type-check
```

### Test Guidelines

- **Unit Tests**: Test individual components and functions
- **Integration Tests**: Test component interactions
- **Security Tests**: Test for security vulnerabilities
- **Performance Tests**: Test for performance regressions

## 📚 Documentation

### Documentation Standards

- **README**: Keep the README up to date
- **Code Comments**: Add comments for complex logic
- **API Documentation**: Document API endpoints
- **Inline Documentation**: Use JSDoc for functions and classes

### Documentation Updates

- Update relevant documentation when making changes
- Include examples and usage instructions
- Keep documentation in sync with code changes

## 🔐 Security

### Security Considerations

- **Vulnerability Disclosure**: Report security vulnerabilities privately
- **Security Testing**: Run security scans regularly
- **Dependencies**: Keep dependencies updated
- **Code Review**: Security-focused code reviews

### Reporting Security Issues

Please report security vulnerabilities to [security@secureflow.com](mailto:security@secureflow.com) instead of using the public issue tracker.

## 📞 Getting Help

- **GitHub Issues**: For bug reports and feature requests
- **GitHub Discussions**: For general questions and discussions
- **Email**: [contact@secureflow.com](mailto:contact@secureflow.com)

## 🏆 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

Thank you for contributing to SecureFlow Automaton! 🎉
