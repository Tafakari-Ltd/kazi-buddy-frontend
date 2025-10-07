"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/Redux/Store/Store";
import { getProfile, updateProfile, deleteProfile } from "@/Redux/Features/profileSlice";
import Navbar from "@/component/common/Navbar/Navbar";

const Profile = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { profile, loading, updating, deleting, error } = useSelector(
    (state: RootState) => state.profile
  );

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  const [education, setEducation] = useState([
    { school: "", degree: "", specialization: "" },
  ]);
  const [experience, setExperience] = useState([{ company: "", role: "" }]);
  const [jobApplications, setJobApplications] = useState([
    {
      title: "Residential Plumber",
      company: "PipeWorks Co.",
      coverLetter:
        "I have over 5 years of experience handling residential plumbing systems. I'm confident in my ability to quickly diagnose and repair issues while providing excellent customer service.",
      status: "Pending",
    },
    {
      title: "Maintenance Plumber",
      company: "GreenLeaf Apartments",
      coverLetter:
        "I've worked extensively in apartment maintenance and can efficiently manage plumbing needs for large buildings. I'm available for both day and night shifts.",
      status: "Reviewed",
    },
    {
      title: "Commercial Plumbing Technician",
      company: "FlowFix Industries",
      coverLetter:
        "My background in commercial plumbing and certifications in pipefitting make me a strong candidate for your industrial plumbing technician role.",
      status: "Interview Scheduled",
    },
  ]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch profile on mount
  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);

  
  useEffect(() => {
    if (profile) {
      setName(profile.full_name || "");
      setEmail(profile.email || "");
      setPhoneNumber(profile.phone_number || "");
      
      
      if (profile.profile_photo_url) {
        
        const imageUrl = profile.profile_photo_url.startsWith('http') 
          ? profile.profile_photo_url 
          : `${process.env.NEXT_PUBLIC_BASE_URL}${profile.profile_photo_url}`;
        
        console.log("Profile Photo URL:", imageUrl);
        setProfileImage(imageUrl);
      }
      
      setProfileImageFile(null);
    }
  }, [profile]);

  // Upload Handlers
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImageFile(file);
      setProfileImage(URL.createObjectURL(file));
    }
  };

  const handleResumeUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setResume(file);
  };

 
  const handleAddEducation = () => {
    setEducation([...education, { school: "", degree: "", specialization: "" }]);
  };

  const handleAddExperience = () => {
    setExperience([...experience, { company: "", role: "" }]);
  };

  const handleAddJobApplication = () => {
    setJobApplications([
      ...jobApplications,
      { title: "", company: "", coverLetter: "", status: "Pending" },
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatePayload: any = {};
    
    
    if (name !== profile?.full_name) {
      updatePayload.full_name = name;
    }
    if (phoneNumber !== profile?.phone_number) {
      updatePayload.phone_number = phoneNumber;
    }
    if (profileImageFile) {
      updatePayload.profile_photo = profileImageFile;
      console.log("Including profile photo in update:", profileImageFile);
    }

   
    if (Object.keys(updatePayload).length === 0) {
      alert("No changes to save");
      return;
    }

    console.log("Update payload:", updatePayload);

    try {
      const result = await dispatch(updateProfile(updatePayload)).unwrap();
      console.log("Update result:", result);
      console.log("Profile photo URL after update:", result.profile_photo_url);
      
      alert("Profile updated successfully!");
      
      setProfileImageFile(null);
      
      await dispatch(getProfile());
    } catch (err: any) {
      console.error("Update failed:", err);
      alert(`Failed to update profile: ${err}`);
    }
  };

  const handleDeleteAccount = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    try {
      await dispatch(deleteProfile()).unwrap();
      
    } catch (err: any) {
      alert(`Failed to delete account: ${err}`);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-maroon via-purple-dark to-redish flex items-center justify-center">
          <div className="text-white text-xl">Loading profile...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-maroon via-purple-dark to-redish px-6 py-10 text-white pt-[70px]">
        <div className="mx-auto bg-white rounded shadow-lg p-8 text-gray-900">
          <h2 className="text-2xl font-bold mb-6 text-center text-maroon">
            Job Seeker Profile
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {error}
            </div>
          )}

          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            {/* Left Column */}
            <div>
              <div className="flex flex-col items-center mb-6">
                <label htmlFor="profile-image" className="cursor-pointer">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile"
                      className="w-28 h-28 object-cover rounded-full border-4 border-purple-dark"
                      onError={(e) => {
                        console.error("Image failed to load:", profileImage);
                       
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : (
                    <div className="w-28 h-28 flex items-center justify-center bg-purple-100 rounded-full text-purple-dark font-bold text-sm">
                      Upload
                    </div>
                  )}
                  {profileImage && (
                    <div className="hidden w-28 h-28 flex items-center justify-center bg-purple-100 rounded-full text-purple-dark font-bold text-sm">
                      Upload
                    </div>
                  )}
                </label>
                <input
                  id="profile-image"
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
                {profileImageFile && (
                  <p className="text-xs text-green-600 mt-2">New image selected</p>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Basic Info */}
                <div className="grid gap-4">
                  <div>
                    <label className="text-sm font-medium text-maroon">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full border border-gray-300 px-4 py-2 rounded-md mt-1 outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-maroon">Email</label>
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="w-full border border-gray-300 px-4 py-2 rounded-md mt-1 outline-none bg-gray-100 cursor-not-allowed"
                    />
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-maroon">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      className="w-full border border-gray-300 px-4 py-2 rounded-md mt-1 outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-maroon">
                      Resume
                      <span className="text-xs text-gray-500 ml-2">(Local only - not saved to server)</span>
                    </label>
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={handleResumeUpload}
                      className="w-full border border-gray-300 px-4 py-2 rounded-md mt-1 bg-white cursor-pointer"
                    />
                    {resume && (
                      <p className="text-sm mt-1 text-green-600">{resume.name}</p>
                    )}
                  </div>
                </div>

                {/* Education Section */}
                <div>
                  <h3 className="text-lg font-semibold text-maroon mb-2">
                    Education
                    <span className="text-xs text-gray-500 ml-2">(Local only - not saved to server)</span>
                  </h3>
                  {education.map((edu, index) => (
                    <div key={index} className="grid grid-cols-3 gap-4 mb-2">
                      <input
                        type="text"
                        placeholder="School/University"
                        value={edu.school}
                        onChange={(e) => {
                          const newEdu = [...education];
                          newEdu[index].school = e.target.value;
                          setEducation(newEdu);
                        }}
                        className="border border-gray-300 px-3 py-2 rounded-md"
                      />
                      <input
                        type="text"
                        placeholder="Degree"
                        value={edu.degree}
                        onChange={(e) => {
                          const newEdu = [...education];
                          newEdu[index].degree = e.target.value;
                          setEducation(newEdu);
                        }}
                        className="border border-gray-300 px-3 py-2 rounded-md"
                      />
                      <input
                        type="text"
                        placeholder="Specialization"
                        value={edu.specialization}
                        onChange={(e) => {
                          const newEdu = [...education];
                          newEdu[index].specialization = e.target.value;
                          setEducation(newEdu);
                        }}
                        className="border border-gray-300 px-3 py-2 rounded-md"
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddEducation}
                    className="text-purple-dark hover:text-maroon text-sm font-medium"
                  >
                    + Add Education
                  </button>
                </div>

                {/* Experience Section */}
                <div>
                  <h3 className="text-lg font-semibold text-maroon mb-2">
                    Experience
                    <span className="text-xs text-gray-500 ml-2">(Local only - not saved to server)</span>
                  </h3>
                  {experience.map((exp, index) => (
                    <div key={index} className="grid grid-cols-2 gap-4 mb-2">
                      <input
                        type="text"
                        placeholder="Company"
                        value={exp.company}
                        onChange={(e) => {
                          const newExp = [...experience];
                          newExp[index].company = e.target.value;
                          setExperience(newExp);
                        }}
                        className="border border-gray-300 px-3 py-2 rounded-md"
                      />
                      <input
                        type="text"
                        placeholder="Role"
                        value={exp.role}
                        onChange={(e) => {
                          const newExp = [...experience];
                          newExp[index].role = e.target.value;
                          setExperience(newExp);
                        }}
                        className="border border-gray-300 px-3 py-2 rounded-md"
                      />
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={handleAddExperience}
                    className="text-purple-dark hover:text-maroon text-sm font-medium"
                  >
                    + Add Experience
                  </button>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={updating}
                    className="w-full bg-maroon hover:bg-redish text-white px-4 py-2 rounded-md font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updating ? "Saving..." : "Save Profile"}
                  </button>

                  <button
                    type="button"
                    onClick={handleDeleteAccount}
                    disabled={deleting}
                    className={`w-full px-4 py-2 rounded-md font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed ${
                      showDeleteConfirm
                        ? "bg-red-600 hover:bg-red-700 text-white"
                        : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                    }`}
                  >
                    {deleting
                      ? "Deleting..."
                      : showDeleteConfirm
                      ? "Click Again to Confirm Delete"
                      : "Delete Account"}
                  </button>

                  {showDeleteConfirm && (
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(false)}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md font-semibold transition"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Right Column – Job Applications */}
            <div className="overflow-y-auto max-h-screen">
              <h3 className="text-xl font-semibold text-maroon mb-4">
                Job Applications
                <span className="text-xs text-gray-500 ml-2">(Local only - not saved to server)</span>
              </h3>

              {jobApplications.map((app, index) => (
                <div
                  key={index}
                  className="mb-4 p-4 rounded-md border border-gray-300"
                >
                  <input
                    type="text"
                    placeholder="Job Title"
                    value={app.title}
                    onChange={(e) => {
                      const updated = [...jobApplications];
                      updated[index].title = e.target.value;
                      setJobApplications(updated);
                    }}
                    className="w-full mb-2 border px-3 py-2 rounded-md border-neutral-300"
                  />
                  <input
                    type="text"
                    placeholder="Company"
                    value={app.company}
                    onChange={(e) => {
                      const updated = [...jobApplications];
                      updated[index].company = e.target.value;
                      setJobApplications(updated);
                    }}
                    className="w-full mb-2 border px-3 py-2 rounded-md border-neutral-300"
                  />
                  <textarea
                    placeholder="Cover Letter"
                    value={app.coverLetter}
                    onChange={(e) => {
                      const updated = [...jobApplications];
                      updated[index].coverLetter = e.target.value;
                      setJobApplications(updated);
                    }}
                    className="w-full border px-3 py-2 rounded-md mb-2 border-neutral-300"
                  />
                  <span className="text-sm text-gray-600">
                    Status:{" "}
                    <span className="font-semibold text-purple-dark">{app.status}</span>
                  </span>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddJobApplication}
                className="text-purple-dark hover:text-maroon text-sm font-medium"
              >
                + Add Job Application
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;