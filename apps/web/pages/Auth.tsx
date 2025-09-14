
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/auth/AuthContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RateLimiter, SecurityLogger, sanitizeInput } from "@/lib/security";
import { Eye, EyeOff, Shield, AlertTriangle, CheckCircle } from "lucide-react";

// Rate limiter for authentication attempts
const authRateLimiter = new RateLimiter();

const Auth = () => {
  const { user, initializing, validateUserPassword } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordValidation, setPasswordValidation] = useState<{
    isValid: boolean;
    errors: string[];
    strength: string;
  } | null>(null);
  const navigate = useNavigate();

  const [form, setForm] = useState({ 
    email: "", 
    password: "",
    confirmPassword: "" 
  });

  React.useEffect(() => {
    if (!initializing && user) {
      navigate("/");
    }
  }, [user, initializing, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    const sanitizedValue = sanitizeInput(value);
    
    setForm({ ...form, [name]: sanitizedValue });
    
    // Real-time password validation for signup
    if (name === 'password' && isSignup) {
      const validation = validateUserPassword(sanitizedValue);
      setPasswordValidation(validation);
    }
  };

  const getClientFingerprint = (): string => {
    // Simple client fingerprinting for rate limiting
    return btoa(`${navigator.userAgent}${screen.width}${screen.height}${new Date().getTimezoneOffset()}`);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);

    // Rate limiting check
    const clientId = getClientFingerprint();
    if (!authRateLimiter.isAllowed(clientId, 5, 60 * 60 * 1000)) { // 5 attempts per hour
      setErr("Too many authentication attempts. Please try again later.");
      setLoading(false);
      SecurityLogger.logEvent('auth_rate_limit_exceeded', { clientId });
      return;
    }

    // Enhanced validation for signup
    if (isSignup) {
      if (!passwordValidation || !passwordValidation.isValid) {
        setErr("Please ensure your password meets all security requirements.");
        setLoading(false);
        return;
      }

      if (form.password !== form.confirmPassword) {
        setErr("Passwords do not match.");
        setLoading(false);
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(form.email)) {
        setErr("Please enter a valid email address.");
        setLoading(false);
        return;
      }
    }

    try {
      if (isSignup) {
        const redirectUrl = `${window.location.origin}/`;
        const { error } = await supabase.auth.signUp({
          email: form.email,
          password: form.password,
          options: { 
            emailRedirectTo: redirectUrl,
            data: {
              registration_timestamp: new Date().toISOString(),
              password_strength: passwordValidation?.strength
            }
          },
        });
        
        if (error) {
          setErr(error.message);
          SecurityLogger.logEvent('signup_failed', { 
            email: form.email, 
            error: error.message 
          });
        } else {
          setErr("Signup successful! Please check your email to confirm your account.");
          SecurityLogger.logEvent('signup_successful', { 
            email: form.email 
          });
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ 
          email: form.email, 
          password: form.password 
        });
        
        if (error) {
          setErr(error.message);
          SecurityLogger.logEvent('login_failed', { 
            email: form.email, 
            error: error.message 
          });
        } else {
          SecurityLogger.logEvent('login_successful', { 
            email: form.email 
          });
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred';
      setErr(errorMessage);
      SecurityLogger.logEvent('auth_error', { 
        email: form.email, 
        error: errorMessage 
      });
    } finally {
      setLoading(false);
    }
  };

  const getPasswordStrengthColor = (strength: string) => {
    switch (strength) {
      case 'very-strong': return 'text-green-600';
      case 'strong': return 'text-green-500';
      case 'medium': return 'text-yellow-500';
      default: return 'text-red-500';
    }
  };

  const getPasswordStrengthWidth = (strength: string) => {
    switch (strength) {
      case 'very-strong': return 'w-full';
      case 'strong': return 'w-3/4';
      case 'medium': return 'w-1/2';
      default: return 'w-1/4';
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Shield className="h-12 w-12 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">
            {isSignup ? "Create Account" : "Sign In"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                placeholder="Email address"
                name="email"
                type="email"
                required
                value={form.email}
                autoComplete="username"
                onChange={handleChange}
                className="w-full"
              />
            </div>

            <div className="relative">
              <Input
                placeholder="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete={isSignup ? "new-password" : "current-password"}
                value={form.password}
                onChange={handleChange}
                className="w-full pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            {isSignup && (
              <>
                <div>
                  <Input
                    placeholder="Confirm password"
                    name="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="new-password"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    className="w-full"
                  />
                </div>

                {/* Password strength indicator */}
                {passwordValidation && form.password && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Password strength:</span>
                      <span className={`font-medium capitalize ${getPasswordStrengthColor(passwordValidation.strength)}`}>
                        {passwordValidation.strength.replace('-', ' ')}
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          passwordValidation.strength === 'very-strong' ? 'bg-green-600' :
                          passwordValidation.strength === 'strong' ? 'bg-green-500' :
                          passwordValidation.strength === 'medium' ? 'bg-yellow-500' :
                          'bg-red-500'
                        } ${getPasswordStrengthWidth(passwordValidation.strength)}`}
                      />
                    </div>
                    
                    {/* Password requirement errors */}
                    {passwordValidation.errors.length > 0 && (
                      <div className="space-y-1">
                        {passwordValidation.errors.map((error, index) => (
                          <div key={index} className="flex items-center text-xs text-red-600">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {error}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            <Button 
              className="w-full" 
              type="submit" 
              disabled={loading || (isSignup && passwordValidation && !passwordValidation.isValid)}
            >
              {loading ? "Please wait..." : isSignup ? "Create Account" : "Sign In"}
            </Button>

            {err && (
              <Alert variant={err.includes("successful") ? "default" : "destructive"}>
                <AlertDescription className="flex items-center">
                  {err.includes("successful") ? (
                    <CheckCircle className="h-4 w-4 mr-2 text-green-600" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 mr-2" />
                  )}
                  {err}
                </AlertDescription>
              </Alert>
            )}

            <div className="text-center text-sm">
              {isSignup ? (
                <>
                  Already have an account?{" "}
                  <button
                    type="button"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                    onClick={() => {
                      setIsSignup(false);
                      setPasswordValidation(null);
                      setForm({ email: "", password: "", confirmPassword: "" });
                      setErr(null);
                    }}
                  >
                    Sign in
                  </button>
                </>
              ) : (
                <>
                  Don't have an account?{" "}
                  <button
                    type="button"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                    onClick={() => {
                      setIsSignup(true);
                      setPasswordValidation(null);
                      setForm({ email: "", password: "", confirmPassword: "" });
                      setErr(null);
                    }}
                  >
                    Create account
                  </button>
                </>
              )}
            </div>
          </form>

          {isSignup && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 mb-2">Password Requirements:</h4>
              <ul className="text-xs text-blue-800 space-y-1">
                <li>• At least 12 characters long</li>
                <li>• Contains uppercase and lowercase letters</li>
                <li>• Includes numbers and special characters</li>
                <li>• No common patterns or dictionary words</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Auth;
