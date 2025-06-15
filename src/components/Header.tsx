
import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Bell, Settings, User } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Header = () => {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
            <Shield className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-bold text-foreground">SecureFlow</h1>
              <p className="text-xs text-muted-foreground">DevSecOps Pipeline</p>
            </div>
          </Link>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="hidden md:flex items-center space-x-2 text-sm">
            <div className="h-2 w-2 rounded-full bg-security-secure animate-pulse-security"></div>
            <span className="text-muted-foreground">Pipeline Status:</span>
            <span className="text-security-secure font-medium">Secure</span>
          </div>
          
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute -top-1 -right-1 h-3 w-3 bg-security-critical rounded-full text-xs flex items-center justify-center text-white">
              3
            </span>
          </Button>
          
          <Button variant="ghost" size="icon">
            <Settings className="h-5 w-5" />
          </Button>
          
          <Button variant="ghost" size="icon">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
