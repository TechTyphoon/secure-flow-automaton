
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/components/AuthContext";

const Auth = () => {
  const { user, initializing } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });

  React.useEffect(() => {
    if (!initializing && user) {
      navigate("/");
    }
  }, [user, initializing, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErr(null);
    if (isSignup) {
      const redirectUrl = `${window.location.origin}/`;
      const { error } = await supabase.auth.signUp({
        email: form.email,
        password: form.password,
        options: { emailRedirectTo: redirectUrl },
      });
      setLoading(false);
      if (error) setErr(error.message);
      else setErr("Signup successful! Please check your email to confirm.");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password });
      setLoading(false);
      if (error) setErr(error.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md min-w-[320px] w-full max-w-md space-y-3">
        <h2 className="font-bold text-xl text-center">{isSignup ? "Sign Up" : "Login"}</h2>
        <Input
          placeholder="Email"
          name="email"
          type="email"
          required
          value={form.email}
          autoComplete="username"
          onChange={handleChange}
        />
        <Input
          placeholder="Password"
          name="password"
          type="password"
          required
          autoComplete={isSignup ? "new-password" : "current-password"}
          value={form.password}
          onChange={handleChange}
        />
        <Button className="w-full" type="submit" disabled={loading}>
          {loading ? "Please wait..." : isSignup ? "Sign Up" : "Login"}
        </Button>
        {err && <div className="text-destructive text-center text-sm mt-2">{err}</div>}
        <div className="text-center text-sm">
          {isSignup ? (
            <>
              Already have an account?{" "}
              <span className="text-blue-600 cursor-pointer" onClick={() => setIsSignup(false)}>
                Login
              </span>
            </>
          ) : (
            <>
              Don't have an account?{" "}
              <span className="text-blue-600 cursor-pointer" onClick={() => setIsSignup(true)}>
                Signup
              </span>
            </>
          )}
        </div>
      </form>
    </div>
  );
};

export default Auth;
