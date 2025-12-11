"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

// Update this array to include the worker and employer signup paths
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

  useEffect(() => {
    
    const isAuthenticated =
      sessionStorage.getItem("isAuthenticated") === "true";
    
    // Check if the exact path is in the allowed list
    const isAllowed = allowedUnauthenticatedPaths.includes(pathname);

    if (!isAuthenticated && !isAllowed) {
      router.replace(`/auth/login?returnTo=${pathname}`);
      setAuthorized(false);
    } else {
      setAuthorized(true);
    }
  }, [router, pathname]);

  if (authorized === null) {
    return null; 
  }

  if (authorized === false) {
    return null;
  }

  return <>{children}</>;
};

export default ProtectedRoute;