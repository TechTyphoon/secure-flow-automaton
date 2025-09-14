
import React, { useEffect, useState } from "react";
import { Shield, Bell, User, Settings, Activity } from "lucide-react";
import { Button } from "@/components/ui/button";
import NotificationsModal from "@/components/modals/NotificationsModal";
import ProfileDropdown from "@/components/layout/ProfileDropdown";
import { useAuth } from "@/components/auth/AuthContext";
import { Link, useNavigate } from "react-router-dom";

const Header = () => {
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Fetch unread notification count
  useEffect(() => {
    if (!user) return setNotificationCount(0);
    fetch(`/api/notifications/count?userid=${user.id}`)
      .then((r) => r.json())
      .then((d) => setNotificationCount(d.count || 0))
      .catch(() => setNotificationCount(0));
  }, [user]);

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
        <div className="flex items-center space-x-4 relative">
          <div className="hidden md:flex items-center space-x-2 text-sm">
            <div className="h-2 w-2 rounded-full bg-security-secure animate-pulse-security"></div>
            <span className="text-muted-foreground">Pipeline Status:</span>
            <span className="text-security-secure font-medium">Secure</span>
          </div>
          <Button variant="ghost" size="icon" className="relative" onClick={() => setNotifOpen(true)}>
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 h-3 w-3 bg-security-critical rounded-full text-xs flex items-center justify-center text-white">
                {notificationCount}
              </span>
            )}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => navigate('/monitoring')} title="System Monitoring">
            <Activity className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setProfileOpen((v) => !v)}>
            <User className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => navigate('/settings')}>
            <Settings className="h-5 w-5" />
          </Button>
          <ProfileDropdown open={profileOpen} onClose={() => setProfileOpen(false)} />
        </div>
      </div>
      <NotificationsModal open={notifOpen} onClose={() => setNotifOpen(false)} />
    </header>
  );
};

export default Header;
