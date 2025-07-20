import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import SecurityMetrics from '@/components/SecurityMetrics';
import { AuthContext } from '@/components/AuthContext';

// Mock the hooks
vi.mock('@/hooks/useRealSecurityData', () => ({
  useSecurityMetrics: vi.fn(),
}));

vi.mock('@/hooks/use-toast', () => ({
  useToast: vi.fn(() => ({
    toast: vi.fn(),
  })),
}));

const mockUser = {
  id: '1',
  email: 'test@example.com',
  user_metadata: { name: 'Test User' },
};

const MockProvider = ({ children, user = null }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthContext.Provider value={{ user, signOut: vi.fn() }}>
          {children}
        </AuthContext.Provider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('SecurityMetrics', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock the hooks
    vi.mock('@/hooks/useRealSecurityData', () => ({
      useSecurityMetrics: vi.fn(),
    }));
  });

  it.skip('renders loading state', () => {
    const { useSecurityMetrics } = require('@/hooks/useRealSecurityData');
    useSecurityMetrics.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    render(
      <MockProvider user={mockUser}>
        <SecurityMetrics />
      </MockProvider>
    );

    expect(screen.getAllByTestId('skeleton')).toHaveLength(4);
  });

  it.skip('renders sign in prompt for unauthenticated users', () => {
    const { useSecurityMetrics } = require('@/hooks/useRealSecurityData');
    useSecurityMetrics.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });

    render(
      <MockProvider user={null}>
        <SecurityMetrics />
      </MockProvider>
    );

    expect(screen.getByText('Please sign in to view metrics')).toBeInTheDocument();
  });

  it.skip('renders security metrics for authenticated users', () => {
    const { useSecurityMetrics } = require('@/hooks/useRealSecurityData');
    useSecurityMetrics.mockReturnValue({
      data: {
        securityScore: 85,
        totalVulnerabilities: 5,
        criticalCount: 1,
        highCount: 2,
        mediumCount: 2,
        lowCount: 0,
        lastScanDate: '2023-01-01',
        scanStatus: 'completed',
      },
      isLoading: false,
      error: null,
    });

    render(
      <MockProvider user={mockUser}>
        <SecurityMetrics />
      </MockProvider>
    );

    expect(screen.getByText('85')).toBeInTheDocument();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('completed')).toBeInTheDocument();
  });

  it.skip('renders no data state', () => {
    const { useSecurityMetrics } = require('@/hooks/useRealSecurityData');
    useSecurityMetrics.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });

    render(
      <MockProvider user={mockUser}>
        <SecurityMetrics />
      </MockProvider>
    );

    expect(screen.getByText('No security scans yet')).toBeInTheDocument();
  });
});
