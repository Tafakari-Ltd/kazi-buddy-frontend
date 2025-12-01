import type { Metadata } from "next";
import Navbar from "@/component/worker/Navbar/Navbar";

export const metadata: Metadata = {
  title: "Worker Dashboard | KaziBuddy",
  description: "Manage your worker profile, find jobs, and connect with employers on KaziBuddy.",
};

export default function WorkerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="pt-16">
        {children}
      </main>
    </div>
  );
}