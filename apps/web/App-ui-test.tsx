import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Step 2: Test UI Components (Radix UI)
const HomePage = () => (
  <TooltipProvider>
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>🎉 SecureFlow Automaton Dashboard</h1>
      <p>✅ React Router: Working!</p>
      <p>🔄 UI Components: Testing...</p>
      
      <div style={{ marginTop: '20px' }}>
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>🔍 UI Component Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p>Testing Radix UI components:</p>
              <ul style={{ marginTop: '10px' }}>
                <li>✅ Card: Working</li>
                <li>✅ CardHeader: Working</li>
                <li>✅ CardContent: Working</li>
                <li>🔄 Button: Testing...</li>
              </ul>
            </div>
            
            <Button 
              className="w-full"
              variant="default"
              onClick={() => alert('✅ UI Components are working!')}
            >
              🧪 Test UI Button
            </Button>
            
            <div style={{ padding: '15px', backgroundColor: '#f0f9ff', border: '1px solid #0ea5e9', borderRadius: '8px' }}>
              <h3>🎯 Progress</h3>
              <ul>
                <li>✅ React: Working</li>
                <li>✅ TypeScript: Working</li>
                <li>✅ Vite: Working</li>
                <li>✅ Project Structure: Working</li>
                <li>✅ React Router: Working</li>
                <li>🔄 UI Components: Testing...</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    
    {/* Test Toaster components */}
    <Toaster />
    <Sonner />
  </TooltipProvider>
);

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="*" element={<div style={{padding: '20px'}}><h1>404 - Page not found</h1><a href="/">Go Home</a></div>} />
    </Routes>
  </BrowserRouter>
);

export default App;