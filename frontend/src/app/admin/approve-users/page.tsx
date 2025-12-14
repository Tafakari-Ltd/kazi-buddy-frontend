"use client";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/Redux/Store/Store";
import { approveUser } from "@/Redux/Features/authSlice";
import { toast } from "sonner";
import api from "@/lib/axios";
import ProtectedRoute from "@/component/Authentication/ProtectedRoute";
import PendingUsersTable from "@/components/Admin/ApproveUsers/PendingUsersTable";

// Type defs
interface PendingUser {
  id?: string;
  user_id?: string;
  uuid?: string;
  username: string;
  email: string;
  full_name: string;
  phone_number: string;
  user_type: string;
  profile_photo_url?: string;
  created_at: string;
  email_verified?: boolean;
  is_verified?: boolean;
}

const getPendingUserId = (user: PendingUser): string | undefined => {
  return user.id || user.user_id || user.uuid;
};

const ApproveUsersPage: React.FC = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading } = useSelector((state: RootState) => state.auth);

  const [pendingUsers, setPendingUsers] = useState<PendingUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [approvingId, setApprovingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    try {
      setLoadingUsers(true);
      setError(null);
      const data: any = await api.get("/adminpanel/users/pending/");
      const users = Array.isArray(data) ? data : data?.results || [];
      setPendingUsers(users);
    } catch (err: any) {
      let errorMessage = err.message || "Failed to fetch pending users";
      if (err.status === 404) errorMessage = "Endpoint not found.";
      else if (err.status === 401) errorMessage = "Authentication expired.";
      else if (err.status === 403) errorMessage = "Forbidden - admin access required.";
      
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setLoadingUsers(false);
    }
  };

  const handleApproveUser = async (user: PendingUser) => {
    try {
      const userId = getPendingUserId(user);
      if (!userId) {
        toast.error("Could not determine user id for approval.");
        return;
      }
      setApprovingId(userId);

      const approvalData = {
        username: user.username,
        phone_number: user.phone_number,
        email: user.email,
        full_name: user.full_name,
        password: "",
        user_type: user.user_type,
      };

      const resultAction = await dispatch(approveUser({ userId, data: approvalData }));

      if (approveUser.fulfilled.match(resultAction)) {
        toast.success(`${user.full_name} approved successfully!`);
        await fetchPendingUsers();
      } else {
        toast.error(resultAction.payload || "Failed to approve user");
      }
    } catch (err: any) {
      toast.error(err.message || "Approval failed");
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Approve Users</h1>
            <p className="text-gray-600">Review and approve pending user registrations</p>
          </div>

          {error && <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md text-red-700">{error}</div>}

          {loadingUsers ? (
            <div className="flex justify-center items-center py-12 text-lg text-gray-600">Loading pending users...</div>
          ) : pendingUsers.length === 0 ? (
            <div className="p-8 bg-white rounded-lg border border-gray-200 text-center text-gray-600">No pending users to approve</div>
          ) : (
            <PendingUsersTable 
              users={pendingUsers} 
              loading={loading} 
              approvingId={approvingId} 
              onApprove={handleApproveUser} 
            />
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default ApproveUsersPage;