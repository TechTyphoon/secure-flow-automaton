// Centralized icon imports for tree-shaking optimization
// Import only the icons we actually use to reduce bundle size

export {
  // Navigation & UI
  BarChart3,
  Shield,
  Users,
  Calendar,
  HelpCircle,
  ChevronRight,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  ExternalLink,
  X,
  Check,
  
  // Security & Alerts
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Zap,
  Key,
  LockKeyhole,
  
  // Development & Tools
  GitBranch,
  Code,
  TestTube,
  Package,
  Rocket,
  Container,
  RefreshCw,
  Play,
  
  // User & Profile
  User,
  Settings,
  LogOut,
  
  // General
  FileText,
  Award,
  Target,
  Circle,
  MoreHorizontal,
  PanelLeft,
  
} from 'lucide-react';

// Create a type for our icon components
export type IconComponent = React.ComponentType<React.SVGProps<SVGSVGElement>>;
