
import React from "react";
import { useAuth } from "@/components/AuthContext";

const Settings = () => {
  const { user } = useAuth();

  // Pick a unique accent color so the user sees this has changed
  return (
    <div className="max-w-2xl mx-auto mt-12 bg-green-100/90 rounded-xl shadow px-8 py-10 border border-green-400">
      <h2 className="mb-4 text-2xl font-extrabold text-green-900 tracking-tight">Settings</h2>
      {user ? (
        <div className="space-y-4">
          <div>
            <span className="text-green-700 font-semibold">Your Email:</span>
            <div className="ml-2">{user.email}</div>
          </div>
          <div>
            <span className="text-green-700 font-semibold">User ID:</span>
            <div className="ml-2 text-xs">{user.id}</div>
          </div>
          <div className="mt-6 italic text-green-700">
            Settings page enhanced! Here you can display user preferences or account actions in the future.
          </div>
        </div>
      ) : (
        <div className="text-muted-foreground">Please login to see settings.</div>
      )}
    </div>
  );
};

export default Settings;
