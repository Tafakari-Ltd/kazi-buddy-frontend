"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Users,
  Briefcase,
  FileText,
  Building2,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  ArrowRight,
  UserCheck,
  BriefcaseIcon,
  FileCheck,
  Pause,
  PlayCircle,
  Ban,
  Eye,
  Star
} from "lucide-react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "@/Redux/Store/Store";
import { fetchWorkerProfiles } from "@/Redux/Features/workerProfilesSlice";
import { fetchEmployerProfiles } from "@/Redux/Features/employerProfilesSlice";
import { JobApplicationApi } from "@/services/jobApplicationApi";
import api from "@/lib/axios";
import { approveUser } from "@/Redux/Features/authSlice";
import { toast } from "sonner";
import { motion } from "framer-motion";
import ProtectedRoute from "@/component/Authentication/ProtectedRoute";

interface PendingUser {
  id: string;
  username: string;
  email: string;
  full_name: string;
  phone_number: string;
  user_type: string;
  created_at: string;
}

interface DashboardStats {
  totalWorkers: number;
  totalEmployers: number;
  totalJobs: number;
  totalApplications: number;
  pendingUsers: number;
  pendingJobs: number;
  pendingApplications: number;
  reviewedApplications: number;
  acceptedApplications: number;
  rejectedApplications: number;
  activeJobs: number;
  draftJobs: number;
  pausedJobs: number;
  closedJobs: number;
  cancelledJobs: number;
}

const AdminDashboard = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  
  const [stats, setStats] = useState<DashboardStats>({
    totalWorkers: 0,
    totalEmployers: 0,
    totalJobs: 0,
    totalApplications: 0,
    pendingUsers: 0,
    pendingJobs: 0,
    pendingApplications: 0,
    reviewedApplications: 0,
    acceptedApplications: 0,
    rejectedApplications: 0,
    activeJobs: 0,
    draftJobs: 0,
    pausedJobs: 0,
    closedJobs: 0,
    cancelledJobs: 0,
  });

  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all data in parallel
      const [
        workersResponse,
        employersResponse,