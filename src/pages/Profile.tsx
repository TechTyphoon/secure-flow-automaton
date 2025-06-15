
import React from "react";
import { useAuth } from "@/components/AuthContext";

const Profile = () => {
  const { user } = useAuth();

  if (!user) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-card text-card-foreground rounded shadow p-8">
          <h2 className="text-xl font-bold mb-4">Profile</h2>
          <p className="text-muted-foreground">You are not logged in.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center items-center min-h-[60vh]">
      <div className="bg-card border-accent border-2 rounded-xl shadow-xl p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-4">My Profile</h2>
        <div className="space-y-2">
          <div>
            <span className="font-semibold">Email:</span> {user.email}
          </div>
          <div>
            <span className="font-semibold">User ID:</span> {user.id}
          </div>
          {/* You can add more fields here if your user model has them */}
        </div>
      </div>
    </div>
  );
};

export default Profile;
