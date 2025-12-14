"use client";
import React from "react";
import { CheckCircle, AlertCircle } from "lucide-react";

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

interface PendingUsersTableProps {
  users: PendingUser[];
  onApprove: (user: PendingUser) => void;
  loading: boolean;
  approvingId: string | null;
}

const getPendingUserId = (user: PendingUser): string | undefined => {
  return user.id || user.user_id || user.uuid;
};

const PendingUsersTable: React.FC<PendingUsersTableProps> = ({ users, onApprove, loading, approvingId }) => {
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Phone</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Type</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Date</th>
              <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user, idx) => {
              const userId = getPendingUserId(user);
              const rowId = userId ?? `${user.email}-${idx}`;
              const isEmailVerified = user.email_verified || user.is_verified;

              return (
                <tr key={rowId} className={idx % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div className="flex items-center gap-3">
                      {user.profile_photo_url && (
                        <img src={user.profile_photo_url} alt={user.full_name} className="w-8 h-8 rounded-full object-cover" />
                      )}
                      <span className="font-medium">{user.full_name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    <div className="flex flex-col">
                      <span>{user.email}</span>
                      {isEmailVerified ? (
                        <span className="text-xs text-green-600 flex items-center gap-1 mt-1"><CheckCircle className="w-3 h-3" /> Verified</span>
                      ) : (
                        <span className="text-xs text-red-500 flex items-center gap-1 mt-1"><AlertCircle className="w-3 h-3" /> Not Verified</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{user.phone_number}</td>
                  <td className="px-6 py-4 text-sm">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${user.user_type === "employer" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`}>
                      {user.user_type}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{new Date(user.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => onApprove(user)}
                      disabled={loading || approvingId === userId || !isEmailVerified}
                      title={!isEmailVerified ? "User must verify email first" : "Approve User"}
                      className={`inline-flex items-center gap-2 px-4 py-2 text-white text-sm font-medium rounded-md transition ${
                        !isEmailVerified ? "bg-gray-400 cursor-not-allowed" : "bg-green-600 hover:bg-green-700 disabled:bg-gray-400"
                      }`}
                    >
                      {approvingId === userId ? "⏳ Approving..." : "Approve"}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PendingUsersTable;