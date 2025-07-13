"use client";

import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useRouter, usePathname } from "next/navigation";

import SearchModal from "@/component/SearchModal/SearchModal";
import { RootState } from "@/Redux/Store/Store";

import { Preloader } from "../Preloader/Preloader";

const MainLayoutWrapper = ({ children }: { children: React.ReactNode }) => {
  const isShown = useSelector((state: RootState) => state.search.isShown);
  const [loading, setLoading] = useState(true); 
  const pathname = usePathname();

  useEffect(() => {
    
    setLoading(true);

    const timer = setTimeout(() => {
      setLoading(false);
    }, 200);

    return () => clearTimeout(timer);
  }, [pathname]);

  return (
    <div>
      {loading ? <Preloader /> : children}
      {isShown && <SearchModal />}
    </div>
);
};

export default MainLayoutWrapper;
