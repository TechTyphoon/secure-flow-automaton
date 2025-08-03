import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Step 1: Test React Router first (most common issue)
const HomePage = () => (
  <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
    <h1>🎉 SecureFlow Automaton Dashboard</h1>
    <p>✅ React Router is working!</p>
    <p>🚀 Full dashboard restoration in progress...</p>
    <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#f0f9ff', border: '1px solid #0ea5e9', borderRadius: '8px' }}>
      <h2>🔍 Progressive Testing</h2>
      <ul>
        <li>✅ React: Working</li>
        <li>✅ TypeScript: Working</li>
        <li>✅ Vite: Working</li>
        <li>✅ Project Structure: Working</li>
        <li>🔄 React Router: Testing...</li>
      </ul>
      <p style={{ marginTop: '10px', color: '#0369a1' }}>
        <strong>Current URL:</strong> {window.location.pathname}
      </p>
    </div>
  </div>
);

const AboutPage = () => (
  <div style={{ padding: '20px' }}>
    <h1>About Page</h1>
    <p>✅ Router navigation works!</p>
    <a href="/" style={{ color: '#0ea5e9' }}>← Back to Home</a>
  </div>
);

const App = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="*" element={<div style={{padding: '20px'}}><h1>404 - Page not found</h1><a href="/">Go Home</a></div>} />
    </Routes>
  </BrowserRouter>
);

export default App;