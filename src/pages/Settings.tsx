
import React from "react";
import { useAuth } from "@/components/AuthContext";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const Settings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // Enhanced back handler: go back if possible, else go home (/)
  const handleBack = () => {
    if (window.history.length > 2) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="max-w-xl mx-auto mt-14 px-4">
      <div className="relative bg-gradient-to-br from-blue-200 via-blue-100 to-sky-100 rounded-2xl shadow-lg border border-blue-300 p-8 pb-10">
        <Button
          variant="outline"
          size="sm"
          className="absolute left-5 top-5 flex items-center gap-1"
          onClick={handleBack}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
        <h2 className="mb-6 text-3xl font-bold text-blue-900 text-center">
          Settings
        </h2>
        {user ? (
          <div className="space-y-6">
            <div>
              <span className="block text-blue-600 font-semibold">Email</span>
              <div className="bg-white/90 border border-blue-100 rounded px-3 py-2 mt-1 text-blue-900">
                {user.email}
              </div>
            </div>
            <div>
              <span className="block text-blue-600 font-semibold">User ID</span>
              <div className="bg-white/90 border border-blue-100 rounded px-3 py-2 mt-1 text-xs text-blue-900">
                {user.id}
              </div>
            </div>
            <div className="pt-4 text-blue-700 text-center text-sm italic">
              More preferences and account features will appear here soon!
            </div>
          </div>
        ) : (
          <div className="text-center text-muted-foreground">
            Please login to see settings.
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;

