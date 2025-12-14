"use client";
import React from "react";

interface ProfileHeaderProps {
  name: string;
  setName: (val: string) => void;
  email: string;
  phoneNumber: string;
  setPhoneNumber: (val: string) => void;
  profileImage: string | null;
  onImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  resume: File | null;
  onResumeUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  name, setName, email, phoneNumber, setPhoneNumber,
  profileImage, onImageUpload, resume, onResumeUpload
}) => {
  return (
    <div className="mb-8">
      <div className="flex flex-col items-center mb-6">
        <label htmlFor="profile-image" className="cursor-pointer relative group">
          {profileImage ? (
            <img src={profileImage} alt="Profile" className="w-28 h-28 object-cover rounded-full border-4 border-purple-900 group-hover:opacity-90 transition-opacity" />
          ) : (
            <div className="w-28 h-28 flex items-center justify-center bg-purple-100 rounded-full text-purple-900 font-bold text-sm border-4 border-white shadow-sm">
              Upload
            </div>
          )}
          <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-medium">Change</div>
        </label>
        <input id="profile-image" type="file" accept="image/*" onChange={onImageUpload} className="hidden" />
      </div>

      <div className="grid gap-4">
        <div>
          <label className="text-sm font-medium text-purple-900">Full Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full border border-gray-300 px-4 py-2 rounded-md mt-1 outline-none focus:ring-2 focus:ring-purple-600" />
        </div>
        <div>
          <label className="text-sm font-medium text-purple-900">Email</label>
          <input type="email" value={email} disabled className="w-full border border-gray-300 px-4 py-2 rounded-md mt-1 outline-none bg-gray-100 cursor-not-allowed text-gray-600" />
        </div>
        <div>
          <label className="text-sm font-medium text-purple-900">Phone Number</label>
          <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} className="w-full border border-gray-300 px-4 py-2 rounded-md mt-1 outline-none focus:ring-2 focus:ring-purple-600" />
        </div>
        <div>
          <label className="text-sm font-medium text-purple-900">Resume <span className="text-xs text-gray-500 ml-2">(Local only)</span></label>
          <div className="mt-1 flex items-center gap-2">
            <label className="flex-1 cursor-pointer">
              <span className="inline-block w-full border border-gray-300 px-4 py-2 rounded-md bg-white text-gray-700 hover:bg-gray-50 transition-colors truncate">
                {resume ? resume.name : "Choose file..."}
              </span>
              <input type="file" accept=".pdf,.doc,.docx" onChange={onResumeUpload} className="hidden" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;