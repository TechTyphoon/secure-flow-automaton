
import React, { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

type Props = {
  open: boolean;
  onClose: () => void;
};

const ProfileDropdown: React.FC<Props> = ({ open, onClose }) => {
  const dropdownRef = React.useRef<HTMLDivElement>(null);

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
      <a href="/profile" className="block p-2 text-sm hover:bg-accent rounded">My Profile</a>
      <a href="/settings" className="block p-2 text-sm hover:bg-accent rounded">Settings</a>
      <button className="block p-2 text-sm text-left w-full hover:bg-accent rounded">Logout</button>
    </div>
  );
};

export default ProfileDropdown;
