"use client";
import { Provider } from "react-redux";
import React, { useEffect } from "react";
import { store } from "@/Redux/Store/Store";
import { loadSession } from "@/Redux/Features/authSlice";
import { fetchUserWorkerProfile } from "@/Redux/Features/workerProfilesSlice";
import { Toaster } from "sonner";

function AuthInitializer({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize auth state from sessionStorage on app load
    store.dispatch(loadSession());

    // After loading session, check if user has worker profile
    const state = store.getState();
    if (state.auth.isAuthenticated && state.auth.userId) {
      // Fetch user's worker profile if authenticated
      store.dispatch(fetchUserWorkerProfile(state.auth.userId));
    }
  }, []);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <AuthInitializer>
        <Toaster position="top-right" richColors />
        {children}
      </AuthInitializer>
    </Provider>
  );
}
