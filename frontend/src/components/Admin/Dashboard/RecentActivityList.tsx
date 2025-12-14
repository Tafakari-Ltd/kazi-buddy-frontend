"use client";
import React from "react";
import { ArrowRight, Eye, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export interface PendingUser {
  id?: string;
  user_id?: string;
  uuid?: string;
  username: string;
  email: string;
  full_name: string;
  phone_number: string;
  user_type: string;
  created_at: string;
}

interface RecentActivityListProps {
  users: PendingUser[];
  onApprove: (user: PendingUser) => void;
  approvingId: string | null;
}

// Helper to safely get ID
const getPendingUserId = (user: PendingUser): string | undefined => {
  return user.id || user.user_id || user.uuid;
};

const RecentActivityList: React.FC<RecentActivityListProps> = ({
  users,
  onApprove,
  approvingId,
}) => {
  const router = useRouter();

  return (
    <div className="rounded-xl bg-white p-5 shadow-sm border border-gray-200">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">Top pending users</h2>
          <p className="text-xs text-gray-500">The newest users who are waiting for approval.</p>
        </div>
        <button
          onClick={() => router.push("/admin/approve-users")}
          className="inline-flex items-center gap-2 text-xs font-medium text-blue-700 hover:text-blue-900"
        >
          View all pending users
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {users.length === 0 ? (
        <p className="text-sm text-gray-600">There are currently no users waiting for approval.</p>
      ) : (
        <ul className="divide-y divide-gray-100">
          {users.map((user, idx) => {
            const userId = getPendingUserId(user);
            return (
              <li key={userId || `${user.email}-${idx}`} className="flex items-center justify-between py-3">
                <div>
                  <p className="text-sm font-medium text-gray-900">{user.full_name}</p>
                  <p className="text-xs text-gray-500">{user.email} · {user.phone_number}</p>
                  <p className="mt-1 text-xs text-gray-500">
                    {user.user_type} · Registered on {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => router.push("/admin/approve-users")}
                    className="inline-flex items-center gap-1 rounded-full border border-gray-300 px-3 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Review
                  </button>
                  <button
                    onClick={() => onApprove(user)}
                    disabled={approvingId === userId}
                    className="inline-flex items-center gap-1 rounded-full bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700 disabled:bg-gray-300 transition-colors"
                  >
                    {approvingId === userId ? (
                      <>
                        <span className="h-3 w-3 animate-spin rounded-full border-b-2 border-white" />
                        Approving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-3.5 w-3.5" />
                        Approve
                      </>
                    )}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
};

export default RecentActivityList;