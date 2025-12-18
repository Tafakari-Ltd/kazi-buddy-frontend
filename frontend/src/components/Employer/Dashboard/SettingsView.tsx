import React from "react";
import { Shield } from "lucide-react";

interface SettingsViewProps {
  onEditProfile: () => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ onEditProfile }) => {
  return (
    <div className="bg-white border border-gray-200 shadow-sm p-12 rounded-xl text-center min-h-[400px] flex flex-col items-center justify-center">
      <Shield className="w-16 h-16 text-gray-300 mb-4" />
      <h3 className="text-xl font-bold text-gray-800 mb-2">Account Settings</h3>
      <p className="text-gray-500 mb-6">
        Manage your account preferences, notifications, and security settings.
      </p>
      <button
        onClick={onEditProfile}
        className="bg-white border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50"
      >
        Edit Employer Profile
      </button>
    </div>
  );
};

export default SettingsView;
