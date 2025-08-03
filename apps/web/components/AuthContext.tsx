
import React, { useEffect, useState, createContext, useContext } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { User, Session } from "@supabase/supabase-js";
import { SessionManager, SecurityLogger, validatePassword } from "@/lib/security";

type AuthContextType = {
  user: User | null;
  session: Session | null;
  initializing: boolean;
  sessionTimeoutWarning: boolean;
  extendSession: () => void;
  validateUserPassword: (password: string) => { isValid: boolean; errors: string[]; strength: string };
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  initializing: true,
  sessionTimeoutWarning: false,
  extendSession: () => {},
  validateUserPassword: () => ({ isValid: false, errors: [], strength: 'weak' }),
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [sessionTimeoutWarning, setSessionTimeoutWarning] = useState(false);
  const [sessionManager, setSessionManager] = useState<SessionManager | null>(null);

  // Enhanced session timeout handler
  const handleSessionTimeout = () => {
    SecurityLogger.logEvent('session_timeout', { userId: user?.id });
    supabase.auth.signOut();
    setSessionTimeoutWarning(false);
  };

  // Session timeout warning handler
  const handleSessionWarning = () => {
    SecurityLogger.logEvent('session_timeout_warning', { userId: user?.id });
    setSessionTimeoutWarning(true);
  };

  // Extend session function
  const extendSession = () => {
    if (sessionManager) {
      sessionManager.extendSession();
      setSessionTimeoutWarning(false);
      SecurityLogger.logEvent('session_extended', { userId: user?.id });
    }
  };

  // Password validation wrapper
  const validateUserPassword = (password: string) => {
    return validatePassword(password);
  };

  useEffect(() => {
    // Initialize session manager when user logs in
    if (user && !sessionManager) {
      const manager = new SessionManager(
        handleSessionTimeout,
        handleSessionWarning
      );
      setSessionManager(manager);
      SecurityLogger.logEvent('session_started', { userId: user.id });
    }

    // Cleanup session manager when user logs out
    if (!user && sessionManager) {
      sessionManager.destroy();
      setSessionManager(null);
      setSessionTimeoutWarning(false);
    }

    return () => {
      if (sessionManager) {
        sessionManager.destroy();
      }
    };
  }, [user, sessionManager]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setInitializing(false);

      // Log authentication events for security monitoring
      if (event === 'SIGNED_IN') {
        SecurityLogger.logEvent('user_login', { 
          userId: session?.user?.id,
          email: session?.user?.email,
          provider: session?.user?.app_metadata?.provider 
        });
      } else if (event === 'SIGNED_OUT') {
        SecurityLogger.logEvent('user_logout', { 
          userId: session?.user?.id 
        });
      } else if (event === 'TOKEN_REFRESHED') {
        SecurityLogger.logEvent('token_refresh', { 
          userId: session?.user?.id 
        });
      }
    });

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setInitializing(false);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      initializing, 
      sessionTimeoutWarning,
      extendSession,
      validateUserPassword 
    }}>
      {children}
    </AuthContext.Provider>
  );
};
