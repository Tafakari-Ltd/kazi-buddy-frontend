import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Find Workers | KaziBuddy",
  description: "Browse and hire skilled workers on KaziBuddy. Connect with verified professionals in your area.",
};

export default function WorkersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}