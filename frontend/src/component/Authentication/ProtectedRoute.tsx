"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/Redux/Store/Store";
import { toast } from "sonner";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const allowedUnauthenticatedPaths = [
  "/",
  "/jobs",
  "/jobs/users/applications",
  "/jobs/users/alerts",
  "/auth/login",
  "/auth/signup",
  "/auth/signup/worker",    
  "/auth/signup/employer",  
  "/auth/verify-email",
  "/auth/forgot",          
];

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState<null | boolean>(null);
  
  const { user, isAuthenticated: reduxIsAuthenticated } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    // 1. Check basic authentication
    const sessionIsAuthenticated = sessionStorage.getItem("isAuthenticated") === "true";
    const isAuthenticated = reduxIsAuthenticated || sessionIsAuthenticated;
    
    // Check if the exact path is in the allowed list
    const isAllowed = allowedUnauthenticatedPaths.includes(pathname);

    if (!isAuthenticated && !isAllowed) {
      router.replace(`/auth/login?returnTo=${pathname}`);
      setAuthorized(false);
      return;
    }

    // 2. Role-based Access Control (RBAC)
    if (isAuthenticated && user) {
      const userRole = user.role || user.user_type;
      
      // Admin Routes Protection
      if (pathname.startsWith("/admin") || pathname.startsWith("/adminpanel")) {
        const isAdmin = user.is_staff || user.is_superuser || userRole === "admin";
        if (!isAdmin) {
          toast.error("Unauthorized access. Admin privileges required.");
          
          if (userRole === "employer") router.replace("/employer");
          else if (userRole === "worker") router.replace("/worker");
          else router.replace("/");
          
          setAuthorized(false);
          return;
        }
      }

      // Employer Routes Protection
      if (pathname.startsWith("/employer")) {
        const isEmployer = userRole === "employer" || userRole === "admin";
        if (!isEmployer) {
           toast.error("Unauthorized access. Employer account required.");
           if (userRole === "worker") router.replace("/worker");
           else router.replace("/");
           
           setAuthorized(false);
           return;
        }
      }

      // Worker Routes Protection
      if (pathname.startsWith("/worker")) {
        const isWorker = userRole === "worker" || userRole === "admin";
        if (!isWorker) {
           toast.error("Unauthorized access. Worker account required.");
           if (userRole === "employer") router.replace("/employer");
           else router.replace("/");
           
           setAuthorized(false);
           return;
        }
      }
    }

    setAuthorized(true);
  }, [router, pathname, user, reduxIsAuthenticated]);

  if (authorized === null) {
    return null; 
  }

  if (authorized === false) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;