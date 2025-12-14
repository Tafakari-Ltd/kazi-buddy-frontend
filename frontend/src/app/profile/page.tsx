"use client";
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/Redux/Store/Store";
import { getProfile, updateProfile, deleteProfile } from "@/Redux/Features/profileSlice";
import Navbar from "@/component/common/Navbar/Navbar";
import ProfileHeader from "@/components/Profile/ProfileHeader";
import EducationList from "@/components/Profile/EducationList";
import ExperienceList from "@/components/Profile/ExperienceList";
import { Plus } from "lucide-react";

const Profile = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { profile, loading, updating, deleting, error } = useSelector((state: RootState) => state.profile);

  // Form State
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [resume, setResume] = useState<File | null>(null);
  
  // Lists
  const [education, setEducation] = useState([{ school: "", degree: "", specialization: "" }]);
  const [experience, setExperience] = useState([{ company: "", role: "" }]);
  
  // Dummy applications 
  const [jobApplications, setJobApplications] = useState([
    { title: "Residential Plumber", company: "PipeWorks Co.", coverLetter: "I have over 5 years of experience...", status: "Pending" },
    { title: "Maintenance Plumber", company: "GreenLeaf Apartments", coverLetter: "I've worked extensively...", status: "Reviewed" },
    { title: "Commercial Plumbing Technician", company: "FlowFix Industries", coverLetter: "My background in commercial plumbing...", status: "Interview Scheduled" },
  ]);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    dispatch(getProfile());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      setName(profile.full_name || "");
      setEmail(profile.email || "");
      setPhoneNumber(profile.phone_number || "");
      if (profile.profile_photo_url) {
        const imageUrl = profile.profile_photo_url.startsWith("http") 
          ? profile.profile_photo_url 
          : `${process.env.NEXT_PUBLIC_BASE_URL}${profile.profile_photo_url}`;
        setProfileImage(imageUrl);
      }
      setProfileImageFile(null);
    }
  }, [profile]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImageFile(file);
      setProfileImage(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatePayload: any = {};
    if (name !== profile?.full_name) updatePayload.full_name = name;
    if (phoneNumber !== profile?.phone_number) updatePayload.phone_number = phoneNumber;
    if (profileImageFile) updatePayload.profile_photo = profileImageFile;

    if (Object.keys(updatePayload).length === 0) {
      alert("No changes to save");
      return;
    }

    try {
      await dispatch(updateProfile(updatePayload)).unwrap();
      alert("Profile updated successfully!");
      setProfileImageFile(null);
      await dispatch(getProfile());
    } catch (err: any) {
      alert(`Failed to update profile: ${err}`);
    }
  };

  const handleAddApplication = () => {
    setJobApplications([...jobApplications, { title: "", company: "", coverLetter: "", status: "Pending" }]);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-maroon via-purple-dark to-redish flex items-center justify-center">
          <div className="text-white text-xl animate-pulse">Loading profile...</div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-maroon via-purple-dark to-redish px-6 py-10 text-white pt-[80px]">
        <div className="mx-auto bg-white rounded-xl shadow-2xl p-8 text-gray-900 max-w-6xl">
          <h2 className="text-3xl font-bold mb-8 text-center text-maroon">Job Seeker Profile</h2>

          {error && <div className="mb-6 p-4 bg-red-50 border border-red-400 text-red-700 rounded-lg">{error}</div>}

          <div className="grid gap-10 grid-cols-1 lg:grid-cols-2">
            {/* Left Column: Editable Profile */}
            <div>
              <form onSubmit={handleSubmit}>
                <ProfileHeader 
                  name={name} setName={setName}
                  email={email}
                  phoneNumber={phoneNumber} setPhoneNumber={setPhoneNumber}
                  profileImage={profileImage} onImageUpload={handleImageUpload}
                  resume={resume} onResumeUpload={(e) => setResume(e.target.files?.[0] || null)}
                />
                
                <EducationList education={education} setEducation={setEducation} />
                <ExperienceList experience={experience} setExperience={setExperience} />

                <div className="space-y-3 mt-8 pt-6 border-t border-gray-100">
                  <button type="submit" disabled={updating} className="w-full bg-maroon hover:bg-redish text-white px-4 py-3 rounded-lg font-bold transition disabled:opacity-50">
                    {updating ? "Saving..." : "Save Changes"}
                  </button>

                  <div className="pt-4">
                    {!showDeleteConfirm ? (
                      <button type="button" onClick={() => setShowDeleteConfirm(true)} className="text-sm text-red-600 hover:text-red-800 underline w-full text-center">
                        Delete Account
                      </button>
                    ) : (
                      <div className="flex gap-2">
                        <button type="button" onClick={() => setShowDeleteConfirm(false)} className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg font-medium">Cancel</button>
                        <button type="button" onClick={() => dispatch(deleteProfile())} disabled={deleting} className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700">
                          {deleting ? "Deleting..." : "Confirm Delete"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </form>
            </div>

            {/* Right Column: Applications  */}
            <div className="bg-gray-50 p-6 rounded-xl border border-gray-100 h-fit">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-maroon">Job Applications <span className="text-xs font-normal text-gray-500">(Demo)</span></h3>
                <button type="button" onClick={handleAddApplication} className="text-xs flex items-center gap-1 bg-white border border-gray-300 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition">
                  <Plus size={14} /> Add
                </button>
              </div>

              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                {jobApplications.map((app, index) => (
                  <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                    <input type="text" value={app.title} onChange={(e) => {
                      const updated = [...jobApplications]; updated[index].title = e.target.value; setJobApplications(updated);
                    }} className="w-full font-semibold text-gray-800 border-none p-0 focus:ring-0 mb-1" placeholder="Job Title" />
                    
                    <input type="text" value={app.company} onChange={(e) => {
                      const updated = [...jobApplications]; updated[index].company = e.target.value; setJobApplications(updated);
                    }} className="w-full text-sm text-gray-500 border-none p-0 focus:ring-0 mb-3" placeholder="Company Name" />
                    
                    <textarea value={app.coverLetter} onChange={(e) => {
                      const updated = [...jobApplications]; updated[index].coverLetter = e.target.value; setJobApplications(updated);
                    }} className="w-full text-sm text-gray-600 bg-gray-50 p-3 rounded border-none resize-none mb-3" rows={3} placeholder="Cover letter..." />
                    
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium bg-purple-100 text-purple-800 px-2 py-1 rounded">{app.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;