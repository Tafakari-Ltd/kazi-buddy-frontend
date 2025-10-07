"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { AppDispatch, RootState } from "@/Redux/Store/Store";
import { createJob, clearJobState } from "@/Redux/Features/jobsSlice";
import { categories } from "../Homepage/HotJobs/Jobs";

const JOB_TYPES = [
  { value: "full_time", label: "Full-Time" },
  { value: "part_time", label: "Part-Time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" }
];

const URGENCY_LEVELS = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" }
];

const PAYMENT_TYPES = [
  { value: "fixed", label: "Fixed Price" },
  { value: "hourly", label: "Hourly Rate" }
];

const JobPostingModal = ({ onClose }: { onClose: () => void }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { loading, error, successMessage } = useSelector(
    (state: RootState) => state.jobs
  );
  const { user } = useSelector((state: RootState) => state.auth);

  type FormDataType = {
    title: string;
    category: string;
    description: string;
    location: string;
    location_text: string;
    job_type: string;
    urgency_level: string;
    budget_min: string;
    budget_max: string;
    payment_type: string;
    start_date: string;
    end_date: string;
    estimated_hours: string;
    max_applicants: string;
    status: string;
    visibility: string;
  };

  const [formData, setFormData] = useState<FormDataType>({
    title: "",
    category: "",
    description: "",
    location: "",
    location_text: "",
    job_type: "",
    urgency_level: "medium",
    budget_min: "",
    budget_max: "",
    payment_type: "fixed",
    start_date: "",
    end_date: "",
    estimated_hours: "",
    max_applicants: "50",
    status: "active",
    visibility: "public",
  });

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      dispatch(clearJobState());
      onClose(); 
    }
  }, [successMessage, dispatch, onClose]);

  const handleChange = (field: keyof FormDataType, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};
    
    // Required fields
    if (!formData.title.trim()) newErrors.title = "Job title is required";
    if (!formData.category) newErrors.category = "Category is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.job_type) newErrors.job_type = "Job type is required";

    // Budget validation
    if (formData.budget_min && formData.budget_max) {
      const min = parseFloat(formData.budget_min);
      const max = parseFloat(formData.budget_max);
      if (min > max) {
        newErrors.budget_max = "Maximum budget must be greater than minimum";
      }
    }

    // Date validation
    if (formData.start_date && formData.end_date) {
      if (new Date(formData.start_date) > new Date(formData.end_date)) {
        newErrors.end_date = "End date must be after start date";
      }
    }

    setFieldErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
   
    setFieldErrors({});
    
    if (!validate()) {
      toast.error("Please fix the errors in the form");
      return;
    }

    // Get employer ID from authenticated user
    const employerId = user?.id;
    if (!employerId) {
      toast.error("You must be logged in to create a job");
      return;
    }

    try {
      
      const jobData = {
        employer: employerId,
        category: formData.category,
        title: formData.title,
        description: formData.description,
        location: formData.location,
        location_text: formData.location_text || undefined,
        job_type: formData.job_type as any,
        urgency_level: formData.urgency_level as any,
        budget_min: formData.budget_min ? parseFloat(formData.budget_min) : undefined,
        budget_max: formData.budget_max ? parseFloat(formData.budget_max) : undefined,
        payment_type: formData.payment_type as any,
        start_date: formData.start_date || undefined,
        end_date: formData.end_date || undefined,
        estimated_hours: formData.estimated_hours ? parseInt(formData.estimated_hours) : undefined,
        max_applicants: formData.max_applicants ? parseInt(formData.max_applicants) : undefined,
        status: formData.status as any,
        visibility: formData.visibility as any,
      };

      const resultAction = await dispatch(createJob(jobData));

      if (createJob.fulfilled.match(resultAction)) {
        
      } else if (createJob.rejected.match(resultAction)) {
        const errorPayload = resultAction.payload;
        
        dispatch(clearJobState());

        // Handle field errors
        if (errorPayload && typeof errorPayload === 'object' && 'fieldErrors' in errorPayload) {
          const errors: Record<string, string> = {};
          const payloadWithErrors = errorPayload as { fieldErrors: Record<string, string[]> };
          
          Object.entries(payloadWithErrors.fieldErrors).forEach(([field, messages]) => {
            if (Array.isArray(messages) && messages.length > 0) {
              errors[field] = messages[0];
            }
          });
          setFieldErrors(errors);
          toast.error(`Please fix ${Object.keys(errors).length} error${Object.keys(errors).length > 1 ? 's' : ''} in the form`);
        } else {
          toast.error(typeof errorPayload === 'string' ? errorPayload : "Failed to create job");
        }
      }
    } catch (err: any) {
      console.error("Unexpected error:", err);
      toast.error(err?.message || "An unexpected error occurred");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full shadow-lg max-w-[1100px]">
        <div className="p-4 border-b border-neutral-300">
          <h3 className="text-lg font-semibold text-red-800">Create New Job</h3>
        </div>

        <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Error Summary */}
          {Object.keys(fieldErrors).length > 0 && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-md shadow-sm">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3 flex-1">
                  <h3 className="text-sm font-semibold text-red-800">
                    {Object.keys(fieldErrors).length === 1 
                      ? 'Please fix the following error:' 
                      : `Please fix the following ${Object.keys(fieldErrors).length} errors:`}
                  </h3>
                  <div className="mt-2 text-sm text-red-700 max-h-32 overflow-y-auto">
                    <ul className="space-y-1">
                      {Object.entries(fieldErrors).map(([field, error]) => (
                        <li key={field} className="flex items-start">
                          <span className="mr-2 text-red-500">•</span>
                          <span>
                            <strong className="capitalize">{field.replace(/_/g, ' ')}:</strong> {error}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Job Title */}
          <div>
            <label className="block text-sm font-medium mb-1">Job Title *</label>
            <input
              type="text"
              className={`w-full p-2 border rounded ${
                fieldErrors.title ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="e.g. House Cleaner"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
            />
            {fieldErrors.title && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.title}</p>
            )}
          </div>

          {/* Category & Job Type */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Category *</label>
              <select
                className={`w-full p-2 border rounded ${
                  fieldErrors.category ? "border-red-500" : "border-gray-300"
                }`}
                value={formData.category}
                onChange={(e) => handleChange("category", e.target.value)}
              >
                <option value="">Select category</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
              {fieldErrors.category && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.category}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Job Type *</label>
              <select
                className={`w-full p-2 border rounded ${
                  fieldErrors.job_type ? "border-red-500" : "border-gray-300"
                }`}
                value={formData.job_type}
                onChange={(e) => handleChange("job_type", e.target.value)}
              >
                <option value="">Select job type</option>
                {JOB_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              {fieldErrors.job_type && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.job_type}</p>
              )}
            </div>
          </div>

          {/* Location */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Location *</label>
              <input
                type="text"
                className={`w-full p-2 border rounded ${
                  fieldErrors.location ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="e.g. Nairobi, Kenya"
                value={formData.location}
                onChange={(e) => handleChange("location", e.target.value)}
              />
              {fieldErrors.location && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.location}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Location Details</label>
              <input
                type="text"
                className="w-full p-2 border rounded border-gray-300"
                placeholder="e.g. Work from anywhere"
                value={formData.location_text}
                onChange={(e) => handleChange("location_text", e.target.value)}
              />
            </div>
          </div>

          {/* Budget & Payment Type */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Min Budget</label>
              <input
                type="number"
                className={`w-full p-2 border rounded ${
                  fieldErrors.budget_min ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="1000"
                value={formData.budget_min}
                onChange={(e) => handleChange("budget_min", e.target.value)}
              />
              {fieldErrors.budget_min && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.budget_min}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Max Budget</label>
              <input
                type="number"
                className={`w-full p-2 border rounded ${
                  fieldErrors.budget_max ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="3000"
                value={formData.budget_max}
                onChange={(e) => handleChange("budget_max", e.target.value)}
              />
              {fieldErrors.budget_max && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.budget_max}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Payment Type</label>
              <select
                className="w-full p-2 border rounded border-gray-300"
                value={formData.payment_type}
                onChange={(e) => handleChange("payment_type", e.target.value)}
              >
                {PAYMENT_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Dates & Hours */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Start Date</label>
              <input
                type="date"
                className={`w-full p-2 border rounded ${
                  fieldErrors.start_date ? "border-red-500" : "border-gray-300"
                }`}
                value={formData.start_date}
                onChange={(e) => handleChange("start_date", e.target.value)}
              />
              {fieldErrors.start_date && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.start_date}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">End Date</label>
              <input
                type="date"
                className={`w-full p-2 border rounded ${
                  fieldErrors.end_date ? "border-red-500" : "border-gray-300"
                }`}
                value={formData.end_date}
                onChange={(e) => handleChange("end_date", e.target.value)}
              />
              {fieldErrors.end_date && (
                <p className="text-xs text-red-600 mt-1">{fieldErrors.end_date}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Estimated Hours</label>
              <input
                type="number"
                className="w-full p-2 border rounded border-gray-300"
                placeholder="160"
                value={formData.estimated_hours}
                onChange={(e) => handleChange("estimated_hours", e.target.value)}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">Description *</label>
            <textarea
              rows={4}
              className={`w-full p-2 border rounded ${
                fieldErrors.description ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Describe the job role..."
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
            {fieldErrors.description && (
              <p className="text-xs text-red-600 mt-1">{fieldErrors.description}</p>
            )}
          </div>

          {/* Additional Settings */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Urgency Level</label>
              <select
                className="w-full p-2 border rounded border-gray-300"
                value={formData.urgency_level}
                onChange={(e) => handleChange("urgency_level", e.target.value)}
              >
                {URGENCY_LEVELS.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Max Applicants</label>
              <input
                type="number"
                className="w-full p-2 border rounded border-gray-300"
                placeholder="50"
                value={formData.max_applicants}
                onChange={(e) => handleChange("max_applicants", e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Visibility</label>
              <select
                className="w-full p-2 border rounded border-gray-300"
                value={formData.visibility}
                onChange={(e) => handleChange("visibility", e.target.value)}
              >
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-neutral-300  flex justify-end gap-2">
          <button
            className="px-4 py-1 border border-gray-300 text-gray-700 rounded hover:bg-gray-50"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-1 rounded text-white bg-red-800 hover:bg-red-700"
          >
            Create Job
          </button>
        </div>
      </div>
    </div>
  );
};

export default JobPostingModal;
