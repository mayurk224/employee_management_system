// PublicRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/UserContext";
import Spinner from "../components/Spinner";

const PublicRoute = ({ children }) => {
  const { user, role, loading } = useAuth();

  if (loading) return <Spinner />;

  // If user is authenticated, redirect based on role
  if (user) {
    if (role === "admin") {
      return <Navigate to="/admin" />;
    } else if (role === "employee") {
      return <Navigate to="/employee" />;
    } else if (role === "manager") {
      return <Navigate to="/manager" />;
    }
    // Add other roles and their respective paths here
  }

  // If user is not authenticated, render the children components
  return children;
};

export default PublicRoute;
