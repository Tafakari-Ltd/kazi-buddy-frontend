"use client";

import React, { useState } from "react";
import { UploadCloud } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "@/Redux/Store/Store";
import { closeJobModal } from "@/Redux/Features/ApplyJobSlice";
import { motion, AnimatePresence } from "framer-motion";

const jobTitle = "Plumbing";

const ApplyJob = () => {

  const dispatch = useDispatch<AppDispatch>();
  
  const { isModalOpen } = useSelector((state: RootState) => state.applyJob);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<{ name?: string; email?: string }>({});
  const [files, setFiles] = useState<File[]>([]);
  const [successMsg, setSuccessMsg] = useState("");

  const validate = () => {
    const errs: { name?: string; email?: string } = {};
    if (!name.trim()) errs.name = "Name is required";
    if (!email.trim()) errs.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) errs.email = "Email is invalid";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Submit logic goes here
    setSuccessMsg("Application submitted successfully!");
    setName("");
    setEmail("");
    setMessage("");
    setFiles([]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const newFiles = Array.from(e.target.files);
    const uniqueFiles = newFiles.filter(
      (file) => !files.some((f) => f.name === file.name)
    );
    setFiles((prev) => [...prev, ...uniqueFiles]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClose = () => {
    dispatch(closeJobModal());
    setErrors({});
    setSuccessMsg("");
  };

  return (
    <AnimatePresence>
      {isModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center"
          aria-hidden={!isModalOpen}
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="bg-white rounded-lg w-full max-w-[90%] sm:max-w-[700px] p-6 relative shadow-lg"
          >
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-2xl font-bold"
              aria-label="Close modal"
            >
              &times;
            </button>

            <h2 className="text-xl font-semibold text-[#800000] mb-4">
              Apply for: {jobTitle}
            </h2>

            {successMsg && (
              <div className="mb-4 p-3 rounded bg-green-100 text-green-700 border border-green-400">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Name */}
              <label className="flex flex-col">
                <span className="text-sm font-medium text-gray-700 flex">
                  Name <p className="text-red-500 ml-1">*</p>
                </span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={`mt-1 p-2 border rounded ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.name && (
                  <span className="text-red-500 text-xs mt-1">{errors.name}</span>
                )}
              </label>

              {/* Email */}
              <label className="flex flex-col">
                <span className="text-sm font-medium text-gray-700 flex">
                  Email <p className="text-red-500 ml-1">*</p>
                </span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`mt-1 p-2 border rounded ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.email && (
                  <span className="text-red-500 text-xs mt-1">{errors.email}</span>
                )}
              </label>

              {/* Message */}
              <label className="flex flex-col">
                <span className="text-sm font-medium text-gray-700">
                  Cover Letter
                </span>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="mt-1 p-2 border border-gray-300 rounded"
                  placeholder="Tell us why you're a great fit..."
                />
              </label>

              {/* File Upload */}
              <label className="flex flex-col">
                <span className="text-sm font-medium text-gray-700 mb-2">
                  Upload Documents (optional)
                </span>
                <div
                  className="flex items-center gap-3 p-4 border-2 border-dashed border-gray-300 rounded cursor-pointer hover:border-[#800000] transition"
                  onClick={() => document.getElementById("fileInput")?.click()}
                >
                  <UploadCloud className="w-6 h-6 text-[#800000]" />
                  <span className="text-[#800000] font-medium">
                    Click or drag files to upload
                  </span>
                  <input
                    id="fileInput"
                    type="file"
                    multiple
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                {files.length > 0 && (
                  <ul className="mt-2 max-h-32 overflow-auto border border-gray-200 rounded p-2 bg-gray-50">
                    {files.map((file, index) => (
                      <li
                        key={index}
                        className="flex justify-between items-center text-sm text-gray-700 mb-1"
                      >
                        <span>{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeFile(index)}
                          className="text-red-500 hover:text-red-700 font-bold ml-2"
                        >
                          &times;
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </label>

              {/* Buttons */}
              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 rounded border border-gray-400 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#800000] text-white rounded hover:bg-[#5a0000]"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ApplyJob;
