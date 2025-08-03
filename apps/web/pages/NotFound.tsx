import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/components/AuthContext";
import { Link } from "react-router-dom";

const NOT_FOUND_FN_URL =
  "https://znubqwefuxqkzjgtrdcf.functions.supabase.co/not-found-log";

const NotFound = () => {
  const location = useLocation();
  const [backendMessage, setBackendMessage] = useState<string | null>(null);
  const [tip, setTip] = useState<string>("");
  const { user } = useAuth();

  useEffect(() => {
    // POST log to backend
    fetch(NOT_FOUND_FN_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: location.pathname,
        referrer: window?.document?.referrer ?? "",
        userAgent: navigator.userAgent,
        userId: user?.id,
      }),
    }).catch((e) => {});

    // Fetch custom error (GET)
    fetch(`${NOT_FOUND_FN_URL}?path=${encodeURIComponent(location.pathname)}`)
      .then(res => res.json())
      .then(data => {
        setBackendMessage(data?.message || null);
        setTip(data?.tip || "");
      })
      .catch(() => {});
  }, [location.pathname, user]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-4">
          {backendMessage || "Oops! Page not found."}
        </p>
        {tip && <p className="text-sm text-muted-foreground mb-3">{tip}</p>}
        <Link to="/" className="text-blue-500 hover:text-blue-700 underline">
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
