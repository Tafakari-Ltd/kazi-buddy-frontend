import { Middleware, isAnyOf } from "@reduxjs/toolkit";
import { logout } from "../Features/authSlice";
import { toast } from "sonner";

export const authMiddleware: Middleware = () => (next) => (action) => {
  if (isAnyOf(logout)(action)) {
    toast.success("You have been logged out successfully 👋");
  }
  return next(action);
};
