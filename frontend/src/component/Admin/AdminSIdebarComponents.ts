import { Home, Users, HardHat, Briefcase, Shield, Tags } from "lucide-react";
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
      { label: "All Jobs", href: "/admin/jobs" },
      { label: "Create Job", href: "/admin/jobs/create" },
      { label: "Active Jobs", href: "/admin/jobs?status=active" },
      { label: "Draft Jobs", href: "/admin/jobs?status=draft" },
      { label: "Job Analytics", href: "/admin/jobs/analytics" },
    ],
  },
  {
    id: "categories",
    label: "Categories",
    icon: Tags,
    href: "/categories",
    badge: null,
    submenu: [
      { label: "All Categories", href: "/admin/categories" },
      { label: "Create Category", href: "/admin/categories/create" },
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
