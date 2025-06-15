
import React from "react";
import { useAuth } from "@/components/AuthContext";
import { useNavigate } from "react-router-dom";

const Settings = () => {
  const { user, initializing } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!initializing && !user) {
      navigate("/auth");
    }
  }, [user, initializing, navigate]);

  if (initializing) return null;

  return (
    <div className="max-w-2xl mx-auto mt-12 bg-white rounded shadow p-8">
      <h2 className="mb-4 text-xl font-bold">Settings</h2>
      <div className="text-muted-foreground">
        Add your settings and user preferences here.
      </div>
    </div>
  );
};

export default Settings;
