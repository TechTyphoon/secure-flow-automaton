
import React from "react";
import { useAuth } from "@/components/AuthContext";
import { useNavigate } from "react-router-dom";

export default function RequireAuth({ children }: { children: React.ReactNode }) {
  const { user, initializing } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!initializing && !user) {
      navigate("/auth");
    }
  }, [user, initializing, navigate]);

  if (initializing) return null;

  return <>{children}</>;
}
