// ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/UserContext";
import Spinner from "../components/Spinner";

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, role, loading } = useAuth();

  if (loading) return <Spinner />;

  // If user is authenticated and has the required role, render the children components
  if (user && (requiredRole ? role === requiredRole : true)) {
    return children;
  }

  // If user is not authenticated or doesn't have the required role, redirect to login
  return <Navigate to="/" />;
};

export default ProtectedRoute;
