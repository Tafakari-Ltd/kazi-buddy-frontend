"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/Redux/Store/Store";
import { approveUser } from "@/Redux/Features/authSlice";
import { toast } from "sonner";
import api from "@/lib/axios";
import ProtectedRoute from "@/component/Authentication/ProtectedRoute";

interface PendingUser {
  // Backend may return different id fields depending on serializer
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

      // NOTE: our axios instance already returns `response.data`
      const data = await api.get("/adminpanel/users/pending/");

      // Support both plain array and paginated `{ results: [] }` responses
      const users = Array.isArray(data) ? data : (data as any)?.results || [];

      setPendingUsers(users);
    } catch (err: any) {
      let errorMessage = err.message || "Failed to fetch pending users";

      if (err.status === 404) {
        errorMessage =
          "The pending users endpoint is not available. Please contact your backend team to implement GET /api/adminpanel/users/pending/";
        toast.error("Endpoint not found - contact backend team", {
          duration: 5000,
        });
      } else if (err.status === 401) {
        errorMessage = "Unauthorized - please login again";
        toast.error("Authentication expired", { duration: 4000 });
      } else if (err.status === 403) {
        errorMessage = "You do not have permission to view pending users";
        toast.error("Forbidden - admin access required", { duration: 4000 });
      } else {
        toast.error(errorMessage);
      }

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

      const resultAction = await dispatch(
        approveUser({ userId, data: approvalData }),
      );

      if (approveUser.fulfilled.match(resultAction)) {
        toast.success(`${user.full_name} approved successfully!`);
        await fetchPendingUsers();
      } else if (approveUser.rejected.match(resultAction)) {
        toast.error(resultAction.payload || "Failed to approve user");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred while approving the user");
    } finally {
      setApprovingId(null);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Approve Users
            </h1>
            <p className="text-gray-600">
              Review and approve pending user registrations
            </p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-md">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          {loadingUsers ? (
            <div className="flex justify-center items-center py-12">
              <div className="text-lg text-gray-600">
                Loading pending users...
              </div>
            </div>
          ) : pendingUsers.length === 0 ? (
            <div className="p-8 bg-white rounded-lg border border-gray-200 text-center">
              <p className="text-gray-600">No pending users to approve</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-100 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                        Date
                      </th>
                      <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingUsers.map((user, idx) => {
                      const rowId =
                        getPendingUserId(user) ?? `${user.email}-${idx}`;
                      return (
                        <tr
                          key={rowId}
                          className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}
                        >
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <div className="flex items-center gap-3">
                              {user.profile_photo_url && (
                                <img
                                  src={user.profile_photo_url}
                                  alt={user.full_name}
                                  className="w-8 h-8 rounded-full object-cover"
                                />
                              )}
                              <span className="font-medium">
                                {user.full_name}
                              </span>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {user.email}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {user.phone_number}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                user.user_type === "employer"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                            >
                              {user.user_type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(user.created_at).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 text-center">
                            <button
                              onClick={() => handleApproveUser(user)}
                              disabled={
                                loading ||
                                approvingId === getPendingUserId(user)
                              }
                              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white text-sm font-medium rounded-md transition"
                            >
                              {approvingId === getPendingUserId(user) ? (
                                <>
                                  <span className="animate-spin">⏳</span>
                                  Approving...
                                </>
                              ) : (
                                "Approve"
                              )}
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default ApproveUsersPage;
