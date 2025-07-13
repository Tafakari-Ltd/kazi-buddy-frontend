import { Home, Users, HardHat, Briefcase, Shield } from "lucide-react";
export const menuItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: Home,
    href: "/dashboard",
    badge: null,
  },
  {
    id: "employees",
    label: "Employers",
    icon: Users,
    href: "/employers",
    badge: "247",
    submenu: [
      { label: "All Employers", href: "/admin/employers/all" },
      { label: "Employers Reports", href: "/employees/reports" },
      { label: "Attendance", href: "/employees/attendance" },
    ],
  },
  {
    id: "workers",
    label: "Workers",
    icon: HardHat,
    href: "/workers",
    badge: "89",
    submenu: [
      { label: "Active Workers", href: "/admin/workers/active" },
      { label: "Assignments", href: "/workers/assignments" },
      { label: "Performance", href: "/workers/performance" },
    ],
  },
  {
    id: "jobs",
    label: "Jobs & Projects",
    icon: Briefcase,
    href: "/jobs",
    badge: "12",
    submenu: [
      { label: "Active Projects", href: "/jobs/active" },
      { label: "Job Postings", href: "/jobs/postings" },
      { label: "Project Timeline", href: "/jobs/timeline" },
      { label: "Resource Allocation", href: "/jobs/resources" },
    ],
  },
  {
    id: "admins",
    label: "Administrators",
    icon: Shield,
    href: "/admins",
    badge: "5",
    submenu: [
      { label: "Admin Users", href: "/admins/users" },
      { label: "Roles & Permissions", href: "/admins/roles" },
      { label: "Access Logs", href: "/admins/logs" },
    ],
  },
];
