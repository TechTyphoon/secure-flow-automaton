import { vi } from 'vitest';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { useAuth } from '@/components/AuthContext';
import React from 'react';

// Test utilities for consistent test setup

export const mockUser = {
  id: '1',
  email: 'test@example.com',
  user_metadata: { name: 'Test User' },
  aud: 'authenticated',
  role: 'authenticated',
  created_at: '2024-01-01T00:00:00Z',
  updated_at: '2024-01-01T00:00:00Z',
};

export const createMockQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      gcTime: 0,
    },
    mutations: {
      retry: false,
    },
  },
});

// Mock auth context
export const MockAuthProvider = ({ 
  children, 
  user = null,
  initializing = false 
}: {
  children: React.ReactNode;
  user?: any;
  initializing?: boolean;
}) => {
  // Mock the useAuth hook
  vi.mocked(useAuth).mockReturnValue({
    user,
    initializing,
    signOut: vi.fn(),
    session: user ? { user } : null,
  });
  
  return <>{children}</>;
};

// Mock implementations for common hooks
export const mockSecurityMetrics = {
  data: {
    vulnerabilitiesFound: 12,
    criticalVulns: 2,
    highVulns: 4,
    mediumVulns: 4,
    lowVulns: 2,
    lastScan: '2024-01-15T10:30:00Z',
    scanStatus: 'completed',
    remediationRate: 85,
  },
  isLoading: false,
  error: null,
  refetch: vi.fn(),
};

export const mockLoadingState = {
  data: null,
  isLoading: true,
  error: null,
  refetch: vi.fn(),
};

export const mockErrorState = {
  data: null,
  isLoading: false,
  error: new Error('Failed to fetch data'),
  refetch: vi.fn(),
};

// Setup for Supabase mocks
export const mockSupabase = {
  auth: {
    getSession: vi.fn(),
    getUser: vi.fn(),
    signOut: vi.fn(),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    onAuthStateChange: vi.fn(() => ({
      data: { subscription: { unsubscribe: vi.fn() } }
    })),
  },
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        order: vi.fn(() => Promise.resolve({ data: [], error: null })),
      })),
    })),
  })),
};

// Common test data
export const mockVulnerabilities = [
  {
    id: '1',
    cve_id: 'CVE-2024-0001',
    title: 'SQL Injection Vulnerability',
    severity: 'CRITICAL',
    status: 'open',
    created_at: '2024-01-01T00:00:00Z',
    file_path: '/src/auth/login.js',
    line_number: 45,
  },
  {
    id: '2',
    cve_id: 'CVE-2024-0002',
    title: 'XSS Vulnerability',
    severity: 'HIGH',
    status: 'fixed',
    created_at: '2024-01-02T00:00:00Z',
    file_path: '/src/components/UserInput.js',
    line_number: 23,
  },
];

export const mockSecurityScans = [
  {
    id: '1',
    scan_type: 'sast',
    status: 'completed',
    created_at: '2024-01-15T10:30:00Z',
    vulnerabilities_found: 12,
    scan_duration: 120,
  },
  {
    id: '2',
    scan_type: 'dependency',
    status: 'completed',
    created_at: '2024-01-15T09:15:00Z',
    vulnerabilities_found: 5,
    scan_duration: 45,
  },
];
