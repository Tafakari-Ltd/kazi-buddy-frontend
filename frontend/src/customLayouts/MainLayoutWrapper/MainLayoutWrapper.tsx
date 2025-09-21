"use client";

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { usePathname } from "next/navigation";

import NProgress from "nprogress";
import "@/styles/nprogress.css";

import SearchModal from "@/component/SearchModal/SearchModal";
import { RootState } from "@/Redux/Store/Store";
import { Preloader } from "../Preloader/Preloader";

import { Toaster } from "sonner";

import AuthWatcher from "@/Redux/middleware/AuthWatcher";

const MainLayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  const isShown = useSelector((state: RootState) => state.search.isShown);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    NProgress.start();
    setLoading(true);

    const timer = setTimeout(() => {
      setLoading(false);
      NProgress.done();
    }, 300);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div>
      {/* <AuthWatcher /> */}
      {loading ? <Preloader /> : children}
      {isShown && <SearchModal />}
      <Toaster position="top-right" richColors closeButton />
    </div>
  );
};

export default MainLayoutWrapper;
