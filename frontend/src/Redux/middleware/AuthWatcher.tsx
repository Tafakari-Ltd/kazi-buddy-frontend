"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useSelector } from "react-redux";

import { RootState } from "../Store/Store";

export default function AuthWatcher() {
    const router = useRouter();
    const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated);

    useEffect(() => {
        if (!isAuthenticated) {
            router.replace("/auth/login");
        }
    }, [isAuthenticated, router]);

    return null; // Invisible
}
