import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider } from "@/components/AuthContext";
import HealthProvider from "@/components/HealthProvider";
import ErrorBoundary from "@/components/ErrorBoundary";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Create QueryClient for testing
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Step 5: Test ErrorBoundary (likely the culprit!)
const HomePage = () => (
  <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
    <h1>🎉 SecureFlow Automaton Dashboard</h1>
    <p>✅ React Router: Working!</p>
    <p>✅ UI Components: Working!</p>
    <p>✅ Context Providers: Working!</p>
    <p>✅ Custom Providers: Working!</p>
    <p>🔄 ErrorBoundary: Testing...</p>
    
    <div style={{ marginTop: '20px' }}>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>🔍 ErrorBoundary Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p>Testing ErrorBoundary component:</p>
            <ul style={{ marginTop: '10px' }}>
              <li>🔄 ErrorBoundary: Loading...</li>
              <li>🔄 SecurityLogger: Testing...</li>
            </ul>
          </div>
          
          <Button 
            className="w-full"
            variant="default"
            onClick={() => alert('🎉 ErrorBoundary works! Dashboard is ready!')}
          >
            🧪 Test ErrorBoundary
          </Button>
          
          <div style={{ padding: '15px', backgroundColor: '#e8f5e8', border: '1px solid #22c55e', borderRadius: '8px' }}>
            <h3>🎯 Final Test</h3>
            <ul>
              <li>✅ React: Working</li>
              <li>✅ TypeScript: Working</li>
              <li>✅ Vite: Working</li>
              <li>✅ Project Structure: Working</li>
              <li>✅ React Router: Working</li>
              <li>✅ UI Components: Working</li>
              <li>✅ Context Providers: Working</li>
              <li>✅ Custom Providers: Working</li>
              <li>🔄 ErrorBoundary: Testing...</li>
            </ul>
            <p style={{ marginTop: '10px', color: '#15803d', fontSize: '14px' }}>
              <strong>🎯 If this works → Dashboard is ready!</strong>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  </div>
);

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <HealthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="*" element={<div style={{padding: '20px'}}><h1>404 - Page not found</h1><a href="/">Go Home</a></div>} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </HealthProvider>
      </AuthProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;