import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Worker Dashboard | KaziBuddy",
  description:
    "Manage your worker profile, find jobs, and connect with employers on KaziBuddy.",
};

export default function WorkerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
