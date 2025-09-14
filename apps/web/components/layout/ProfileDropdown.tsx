
import React, { useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from "@/components/auth/AuthContext";
import { supabase } from "@/integrations/supabase/client";

type Props = {
  open: boolean;
  onClose: () => void;
};

const ProfileDropdown: React.FC<Props> = ({ open, onClose }) => {
  const dropdownRef = React.useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    onClose();
    navigate('/');
  };

  React.useEffect(() => {
    if (!open) return;
    const handleClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    window.addEventListener("mousedown", handleClick);
    return () => window.removeEventListener("mousedown", handleClick);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div ref={dropdownRef} className="absolute right-0 top-12 z-50 min-w-[180px] bg-popover rounded shadow-lg ring-1 ring-black/10 animate-in fade-in p-2">
      <Link to="/profile" className="block p-2 text-sm hover:bg-accent rounded" onClick={onClose}>
        My Profile
      </Link>
      <Link to="/settings" className="block p-2 text-sm hover:bg-accent rounded" onClick={onClose}>
        Settings
      </Link>
      {user && (
        <button 
          onClick={handleLogout}
          className="block p-2 text-sm text-left w-full hover:bg-accent rounded text-destructive"
        >
          Logout
        </button>
      )}
    </div>
  );
};

export default ProfileDropdown;
