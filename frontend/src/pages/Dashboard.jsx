// frontend/src/pages/Dashboard.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const { accessToken,user, logout } = useAuth();
 
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="card max-w-md w-full">
        <h1 className="text-2xl font-bold mb-4 text-center">
          Welcome, {user?.name || "User"} 🎉
        </h1>       

        <div className="mb-4">
          <p><span className="font-semibold">Email:</span> {user?.email}</p>
        </div>

        <div className="flex flex-col gap-3">
          <Link
            to="/profile"
            className="btn btn-primary text-center"
          >
            Update Profile
          </Link>
          <Link
            to="/change-password"
            className="btn btn-secondary text-center"
          >
            Change Password
          </Link>
          <button
            onClick={logout}
            className="btn bg-red-600 text-white hover:bg-red-700"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
