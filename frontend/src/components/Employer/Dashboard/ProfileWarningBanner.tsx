import React from "react";
import { AlertCircle } from "lucide-react";

interface ProfileWarningBannerProps {
  onSetupNow: () => void;
}

const ProfileWarningBanner: React.FC<ProfileWarningBannerProps> = ({
  onSetupNow,
}) => {
  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
      <div className="flex items-center gap-3">
        <AlertCircle className="w-6 h-6 text-yellow-600" />
        <div>
          <h3 className="font-bold text-yellow-800">Complete Your Profile</h3>
          <p className="text-sm text-yellow-700">
            You need a profile to post jobs and manage applications.
          </p>
        </div>
      </div>
      <button
        onClick={onSetupNow}
        className="bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-700"
      >
        Setup Now
      </button>
    </div>
  );
};

export default ProfileWarningBanner;
