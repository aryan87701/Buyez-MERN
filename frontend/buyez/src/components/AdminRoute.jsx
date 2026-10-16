import React, { useContext } from "react";
import { Navigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { ShieldAlert, ArrowLeft } from "lucide-react";

const AdminRoute = ({ children }) => {
  const { user, isAdmin, isAuthenticated } = useContext(AuthContext);

  if (!isAuthenticated) {
    return <Navigate to="/login?redirect=admin" replace />;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-[#fcfbfa] py-20 px-4 flex items-center justify-center">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl border border-neutral-200 text-center space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
            <ShieldAlert size={28} />
          </div>
          <h2 className="text-2xl font-bold font-serif text-neutral-900">
            Access Denied
          </h2>
          <p className="text-xs text-neutral-500 leading-relaxed">
            You are signed in as <strong>{user?.name || user?.email}</strong>{" "}
            (role: {user?.role || "user"}). This area is restricted strictly to
            store administrators.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-2">
            <Link
              to="/"
              className="flex-1 py-2.5 px-4 bg-neutral-100 text-neutral-800 text-xs font-semibold rounded-lg hover:bg-neutral-200"
            >
              Back to Store
            </Link>
            <Link
              to="/login?redirect=admin"
              className="flex-1 py-2.5 px-4 bg-[#153228] text-white text-xs font-semibold rounded-lg hover:bg-[#0f241d]"
            >
              Sign In as Admin
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default AdminRoute;
