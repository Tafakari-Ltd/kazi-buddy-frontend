import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

import { Providers } from "./providers/Providers";
import MainLayoutWrapper from "@/customLayouts/MainLayoutWrapper/MainLayoutWrapper";
import ApplyJob from "@/component/ApplyJob/ApplyJob";
import JobMoreDescription from "@/component/common/JobMoreDescription/JobMoreDescription";
import ProtectedRoute from "@/component/Authentication/ProtectedRoute";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Kazi Buddy",
  description: "Job platform powered by Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${outfit.variable} antialiased`}>
        <Providers>
          <ProtectedRoute>
            <MainLayoutWrapper>
              {children}
              <ApplyJob />
              <JobMoreDescription />
            </MainLayoutWrapper>
          </ProtectedRoute>
        </Providers>
      </body>
    </html>
  );
}
