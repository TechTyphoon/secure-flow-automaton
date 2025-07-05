
# SecureFlow - DevSecOps Pipeline Dashboard

![SecureFlow Demo Screenshot](./public/placeholder.svg)

> **Note:** Demo video and more screenshots coming soon!


## 🛡️ Overview

SecureFlow is a comprehensive DevSecOps pipeline management platform that integrates security into every stage of your development lifecycle. Built with modern web technologies, it provides real-time security monitoring, automated vulnerability remediation, and comprehensive reporting to ensure your applications remain secure from code to production.


## 🌟 Key Features

### 📊 Security Dashboard
- **Real-time Monitoring**: Live vulnerability tracking and security score calculations
- **Comprehensive Metrics**: Security posture visualization with interactive charts
- **Performance Analytics**: Pipeline execution metrics and security gate status
- **Compliance Tracking**: Automated compliance status monitoring and reporting

### 🔍 Vulnerability Management
- **Automated Detection**: AI-powered vulnerability identification across code, dependencies, and infrastructure
- **Smart Remediation**: Automated fixing of common security issues with manual review options
- **Risk Assessment**: Severity-based prioritization with CVSS scoring
- **Detailed Analysis**: In-depth vulnerability reports with remediation guidance

### 🔧 DevSecOps Research Hub
- **Tool Selection**: Comprehensive guide for choosing the right security tools
- **SAST/DAST Integration**: Static and Dynamic Application Security Testing recommendations
- **Container Security**: Docker and Kubernetes security best practices
- **Infrastructure as Code**: Terraform, CloudFormation, and ARM template security scanning

### 👥 User Personas & Workflows
- **Developer Experience**: Security-first development workflows and IDE integration
- **Security Engineer**: Advanced threat analysis and incident response workflows  
- **DevOps Integration**: CI/CD pipeline security automation and monitoring
- **Management Reporting**: Executive dashboards and compliance reporting

### 📅 Implementation Timeline
- **Structured Roadmap**: Week-by-week implementation plan for DevSecOps adoption
- **Milestone Tracking**: Progress monitoring with validation checkpoints
- **Resource Planning**: Team allocation and skill development guidance
- **Success Metrics**: KPI definition and measurement frameworks


## 🏗️ Architecture

### Frontend Stack
- **React 18** with TypeScript for type-safe development
- **Vite** for fast development and optimized builds
- **Tailwind CSS** with custom design system for consistent styling
- **shadcn/ui** components for professional UI elements
- **React Router** for client-side routing
- **React Query** for efficient data fetching and caching
- **Recharts** for interactive data visualization

### Backend Integration
- **Supabase** for backend services including:
  - PostgreSQL database with Row Level Security (RLS)
  - Real-time subscriptions for live updates
  - Authentication and user management
  - Edge Functions for serverless business logic
  - File storage for reports and artifacts

### Security Features
- **Authentication**: Email/password and social login support
- **Authorization**: Role-based access control (RBAC)
- **Data Security**: Encrypted data transmission and storage
- **Session Management**: Secure session handling with automatic refresh

## 📱 Application Structure

### Core Components

#### 1. Security Metrics (`SecurityMetrics.tsx`)
```typescript
// Real-time security dashboard with key metrics
- Vulnerability counts by severity
- Security score calculations
- Compliance status indicators
- Pipeline health monitoring
```

#### 2. Pipeline Flow (`PipelineFlow.tsx`)
```typescript
// Visual representation of DevSecOps pipeline stages
- Code analysis and scanning
- Security gate controls
- Deployment automation
- Monitoring and alerting
```

#### 3. Vulnerability Dashboard (`VulnerabilityDashboard.tsx`)
```typescript
// Comprehensive vulnerability management
- Vulnerability listing and filtering
- Automated remediation triggers
- Manual review workflows
- Progress tracking
```

#### 4. Compliance Overview (`ComplianceOverview.tsx`)
```typescript
// Regulatory compliance tracking
- OWASP compliance status
- Industry standards monitoring
- Audit trail maintenance
- Report generation
```

### Database Schema

#### Security Scans Table
```sql
CREATE TABLE security_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_name TEXT NOT NULL,
    branch TEXT DEFAULT 'main',
    scan_type TEXT NOT NULL,
    status TEXT DEFAULT 'running',
    started_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ,
    total_vulnerabilities INTEGER DEFAULT 0,
    critical_count INTEGER DEFAULT 0,
    high_count INTEGER DEFAULT 0,
    medium_count INTEGER DEFAULT 0,
    low_count INTEGER DEFAULT 0,
    scan_results JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### Vulnerabilities Table
```sql
CREATE TABLE vulnerabilities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scan_id UUID REFERENCES security_scans(id),
    title TEXT NOT NULL,
    description TEXT,
    severity TEXT NOT NULL,
    cve_id TEXT,
    component TEXT,
    file_path TEXT,
    line_number INTEGER,
    status TEXT DEFAULT 'open',
    auto_fixable BOOLEAN DEFAULT false,
    confidence_score INTEGER DEFAULT 0,
    remediation_advice TEXT,
    first_detected TIMESTAMPTZ DEFAULT now(),
    last_seen TIMESTAMPTZ DEFAULT now(),
    fixed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```

#### Pipeline Metrics Table
```sql
CREATE TABLE pipeline_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pipeline_id TEXT NOT NULL,
    project_name TEXT NOT NULL,
    branch TEXT DEFAULT 'main',
    status TEXT NOT NULL,
    started_at TIMESTAMPTZ DEFAULT now(),
    completed_at TIMESTAMPTZ,
    duration_seconds INTEGER,
    security_gate_passed BOOLEAN DEFAULT false,
    build_number INTEGER,
    triggered_by TEXT,
    metrics JSONB,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);
```


## 🧪 Testing

We use **Jest** and **React Testing Library** for unit and integration tests. All critical components and business logic are covered by tests.

### Running Tests
```bash
npm run test
```

### Example Test (React Component)
```typescript
import { render, screen } from '@testing-library/react';
import SecurityMetrics from './src/components/SecurityMetrics';

test('renders security metrics dashboard', () => {
  render(<SecurityMetrics />);
  expect(screen.getByText(/Vulnerability counts/i)).toBeInTheDocument();
});
```

Test coverage reports are generated with:
```bash
npm run test:coverage
```

---

## � API Documentation

All backend endpoints and Edge Functions are documented using **Swagger** (OpenAPI). You can view the API docs at `/api-docs` after running the backend, or see the [API Docs Portal](https://docs.lovable.dev/api).

---

## 🖼️ Screenshots & Demo

| Dashboard | Vulnerability Details | Compliance Overview |
|-----------|----------------------|---------------------|
| ![Dashboard](./public/placeholder.svg) | ![Vuln Details](./public/placeholder.svg) | ![Compliance](./public/placeholder.svg) |

> **Live Demo:** Coming soon!

---

## ⚙️ CI/CD Pipeline

We use **GitHub Actions** for continuous integration and deployment. All pull requests are automatically linted, tested, and built before merging.

Example workflow: `.github/workflows/ci.yml`
```yaml
name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: npm ci
      - run: npm run lint
      - run: npm run test -- --coverage
      - run: npm run build
```

---

## ♿ Accessibility

We follow [WCAG 2.1](https://www.w3.org/WAI/standards-guidelines/wcag/) guidelines for accessibility:
- Semantic HTML and ARIA roles
- Keyboard navigation support
- Sufficient color contrast
- Screen reader compatibility

Accessibility is tested using [axe](https://www.deque.com/axe/) and manual audits.

---

### Prerequisites
- Node.js 18+ and npm
- Git for version control
- Modern web browser

### Installation

1. **Clone the repository**
```bash
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>
```

2. **Install dependencies**
```bash
npm install
```

3. **Environment Setup**
```bash
# The Supabase configuration is already included
# No environment variables needed for local development
```

4. **Start development server**
```bash
npm run dev
```

5. **Open your browser**
Navigate to `http://localhost:5173` to view the application

### Available Scripts

```bash
# Development
npm run dev          # Start development server with hot reload

# Building
npm run build        # Production build with optimizations
npm run build:dev    # Development build for testing

# Code Quality
npm run lint         # Run ESLint for code quality checks

# Preview
npm run preview      # Preview production build locally
```

## 🔐 Authentication & Authorization

### User Authentication
The application uses Supabase Auth for secure user management:

```typescript
// Login
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password'
});

// Signup
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password',
  options: {
    emailRedirectTo: `${window.location.origin}/`
  }
});

// Logout
await supabase.auth.signOut();
```

### Role-Based Access Control
- **Admin**: Full system access and user management
- **Security Engineer**: Advanced security features and reporting
- **Developer**: Code analysis and vulnerability remediation
- **Viewer**: Read-only access to dashboards and reports

## 🌐 API Integration

### Supabase Edge Functions

#### 1. Vulnerability Details (`vulnerability-details`)
```typescript
// Get detailed vulnerability information
const response = await supabase.functions.invoke('vulnerability-details', {
  body: { vulnerabilityId: 'uuid' }
});
```

#### 2. Automated Remediation (`automated-remediation`)
```typescript
// Trigger automated vulnerability fixing
const response = await supabase.functions.invoke('automated-remediation', {
  body: { 
    vulnerabilityId: 'uuid',
    action: 'auto-fix'
  }
});
```

#### 3. Pipeline Trigger (`pipeline-trigger`)
```typescript
// Trigger security pipeline execution
const response = await supabase.functions.invoke('pipeline-trigger', {
  body: { 
    projectName: 'my-app',
    branch: 'main'
  }
});
```

#### 4. Notifications (`notifications`)
```typescript
// Send security alerts and notifications
const response = await supabase.functions.invoke('notifications', {
  body: { 
    type: 'security-alert',
    severity: 'high',
    message: 'Critical vulnerability detected'
  }
});
```

## 📊 Monitoring & Analytics

### Security Metrics
- **Vulnerability Trends**: Track vulnerability discovery and remediation over time
- **Security Score**: Composite security health indicator
- **Compliance Status**: Regulatory requirement adherence tracking
- **Pipeline Performance**: Execution time and success rate monitoring

### Real-time Updates
- **Live Dashboard**: WebSocket connections for real-time data updates
- **Push Notifications**: Instant alerts for critical security events
- **Progress Tracking**: Live pipeline execution status
- **Collaborative Updates**: Multi-user real-time collaboration

## 🛠️ Customization & Extension

### Adding New Security Tools
1. Create tool configuration in `src/components/ToolSelection.tsx`
2. Add integration logic in Supabase Edge Functions
3. Update database schema for tool-specific data
4. Add UI components for tool management

### Custom Dashboards
1. Create new component in `src/components/`
2. Add routing in `src/App.tsx`
3. Implement data fetching with React Query
4. Style with Tailwind CSS and design system

### Integration Examples
```typescript
// Custom security tool integration
interface SecurityTool {
  name: string;
  type: 'SAST' | 'DAST' | 'SCA' | 'IAST';
  configuration: Record<string, any>;
  enabled: boolean;
}

// Pipeline extension
interface PipelineStage {
  name: string;
  order: number;
  tools: SecurityTool[];
  gates: SecurityGate[];
}
```

## 🔧 Development Guidelines

### Code Structure
```
src/
├── components/          # Reusable UI components
│   ├── ui/             # shadcn/ui components
│   └── project-timeline/ # Timeline-specific components
├── pages/              # Route components
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
├── integrations/       # Third-party integrations
└── types/              # TypeScript type definitions
```

### Styling Guidelines
- Use Tailwind CSS with semantic design tokens
- Follow the established design system in `src/index.css`
- Create reusable component variants
- Maintain responsive design principles

### State Management
- React Query for server state
- React Context for global UI state
- Local state with useState for component-specific data
- Supabase real-time subscriptions for live updates

## 🚢 Deployment


## 🚀 Production Deployment

You can deploy SecureFlow to any modern static hosting provider (Vercel, Netlify, AWS S3 + CloudFront, or your own server). Below are the recommended steps for a real-time, production-ready deployment:

### 1. Build the Application
```bash
npm run build
```
This creates an optimized production build in the `dist` folder.

### 2. Configure Environment Variables
Create a `.env.production` file at the project root with your production Supabase credentials:
```env
VITE_SUPABASE_URL=your-production-supabase-url
VITE_SUPABASE_ANON_KEY=your-production-supabase-anon-key
# Add any other secrets or config as needed
```

### 3. Set Up Supabase for Production
- Create a Supabase project at https://app.supabase.com/
- Enable Row Level Security (RLS) and configure policies for all tables
- Set up authentication providers (email, OAuth, etc.)
- Deploy your Edge Functions from `supabase/functions/`
- Add secrets for Edge Functions as needed
- Configure storage buckets for reports/artifacts

### 4. Deploy to Hosting Provider
You can use any static hosting provider. Here are examples:

#### Deploy to Vercel
1. Push your code to GitHub.
2. Go to https://vercel.com/import and import your repo.
3. Set the environment variables in the Vercel dashboard.
4. Deploy!


#### Deploy to Netlify (Recommended)
1. Push your code to GitHub.
2. Go to https://app.netlify.com/ and create a new site from Git.
3. In Site Settings > Build & Deploy > Environment, add:
   - `VITE_SUPABASE_URL` (from your Supabase project)
   - `VITE_SUPABASE_ANON_KEY` (from your Supabase project)
   - Any other required environment variables
4. Set the build command to `npm run build` and the publish directory to `dist`.
5. Click Deploy Site!

##### Netlify + Supabase Production Checklist
- [ ] Supabase project is in production mode (not local/dev)
- [ ] RLS (Row Level Security) is enabled and policies are set
- [ ] Auth providers (email, OAuth, etc.) are configured
- [ ] Edge Functions are deployed and tested
- [ ] Storage buckets are set up for reports/artifacts
- [ ] Netlify environment variables are set correctly
- [ ] HTTPS and custom domain configured (optional)
- [ ] Test all critical workflows in production

> For more details, see the [Supabase docs](https://supabase.com/docs/guides/hosting/netlify).

#### Deploy to AWS S3 + CloudFront
1. Build the app (`npm run build`).
2. Upload the `dist` folder to your S3 bucket.
3. Set up CloudFront for CDN and HTTPS.
4. Configure environment variables using a tool like [envsubst](https://github.com/a8m/envsubst) or at build time.

### 5. Post-Deployment Checklist
- [ ] Test authentication and all critical workflows in production
- [ ] Enable HTTPS and custom domain
- [ ] Monitor Supabase logs and usage
- [ ] Set up error monitoring (e.g., Sentry)
- [ ] Regularly update dependencies and security patches

---

## 🔍 Troubleshooting

### Common Issues

#### Authentication Problems
```typescript
// Check session state
const { data: { session } } = await supabase.auth.getSession();
console.log('Current session:', session);

// Verify auth configuration
console.log('Supabase URL:', supabase.supabaseUrl);
```

#### Database Connection Issues
```sql
-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'vulnerabilities';

-- Verify user permissions
SELECT auth.uid(), auth.role();
```

#### UI Rendering Problems
- Clear browser cache and reload
- Check console for JavaScript errors
- Verify component imports and exports
- Check Tailwind CSS configuration

### Performance Optimization
- Use React.memo for expensive components
- Implement proper key props for lists
- Optimize image loading with proper sizing
- Use React Query for efficient data caching

## 📚 Additional Resources

### Documentation
- [Supabase Documentation](https://supabase.com/docs)
- [React Router Documentation](https://reactrouter.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [shadcn/ui Components](https://ui.shadcn.com/)

### Security Best Practices
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [DevSecOps Guidelines](https://www.devsecops.org/)
- [Container Security](https://kubernetes.io/docs/concepts/security/)
- [CI/CD Security](https://www.cisa.gov/sites/default/files/publications/ESF_SECURING_THE_SOFTWARE_SUPPLY_CHAIN_DEVELOPERS.PDF)

### Community & Support
- [GitHub Issues](https://github.com/your-repo/issues)
- [Discord Community](https://discord.com/channels/1119885301872070706/1280461670979993613)
- [Documentation](https://docs.lovable.dev/)
- [Video Tutorials](https://www.youtube.com/watch?v=9KHLTZaJcR8&list=PLbVHz4urQBZkJiAWdG8HWoJTdgEysigIO)


## 🤝 Contributing

We welcome contributions! Please use our [issue templates](.github/ISSUE_TEMPLATE.md) and [pull request template](.github/PULL_REQUEST_TEMPLATE.md) for submitting bugs and features.

### Development Setup
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes following the code style guidelines
4. Test your changes thoroughly
5. Commit with descriptive messages
6. Push to your fork and create a Pull Request

### Code Standards
- TypeScript for type safety
- ESLint for code quality
- Consistent naming conventions
- Comprehensive component documentation
- Test coverage for critical functionality


## 📄 License

This project is licensed under the **MIT License**. See [LICENSE](./LICENSE) for details.

---

---

## 🎯 Project Status

**Current Version**: 1.0.0  
**Status**: Active Development  
**Last Updated**: 2025-01-07

**Recent Updates**:
- ✅ Complete authentication system implementation
- ✅ Real-time vulnerability dashboard
- ✅ Automated remediation workflows  
- ✅ Comprehensive project timeline
- ✅ Role-based access control
- ✅ Responsive design system
- ✅ Supabase integration
- ✅ Edge Functions for business logic

**Upcoming Features**:
- 🔄 Advanced reporting and analytics
- 🔄 Integration with popular security tools
- 🔄 Mobile application
- 🔄 Advanced user management
- 🔄 Custom dashboard builder
- 🔄 API documentation portal

For questions, support, or contributions, please visit our [GitHub repository](https://github.com/your-repo) or join our [Discord community](https://discord.com/channels/1119885301872070706/1280461670979993613).

**Built with ❤️ using Lovable**