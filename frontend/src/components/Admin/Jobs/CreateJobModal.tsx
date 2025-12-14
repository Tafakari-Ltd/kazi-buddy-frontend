"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, Save } from "lucide-react";
import {
  CreateJobData,
  JobFormErrors,
  JobStatus,
  JobType,
  UrgencyLevel,
  PaymentType,
  JobVisibility,
  JOB_TYPE_OPTIONS,
  URGENCY_LEVEL_OPTIONS,
  PAYMENT_TYPE_OPTIONS,
} from "@/types/job.types";

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateJobData) => Promise<void>;
  categories: { id: string; name: string }[];
  loading: boolean;
}

const CreateJobModal: React.FC<CreateJobModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  categories,
  loading,
}) => {
  const initialFormState: Partial<CreateJobData> = {
    title: "",
    description: "",
    category: "",
    location: "",
    location_text: "",
    job_type: JobType.FULL_TIME,
    urgency_level: UrgencyLevel.MEDIUM,
    budget_min: 0,
    budget_max: 0,
    payment_type: PaymentType.FIXED,
    start_date: "",
    end_date: "",
    estimated_hours: 0,
    max_applicants: 5,
    status: JobStatus.DRAFT,
    visibility: JobVisibility.PUBLIC,
  };

  const [formData, setFormData] = useState<Partial<CreateJobData>>(initialFormState);
  const [errors, setErrors] = useState<JobFormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: JobFormErrors = {};

    if (!formData.title?.trim()) newErrors.title = "Job title is required";
    if (!formData.description?.trim()) {
      newErrors.description = "Job description is required";
    } else if (formData.description.length < 50) {
      newErrors.description = "Description must be at least 50 characters";
    }
    if (!formData.category) newErrors.category = "Please select a category";
    if (!formData.location?.trim()) newErrors.location = "Job location is required";
    
    if (!formData.budget_min || formData.budget_min <= 0) newErrors.budget_min = "Min budget required";
    if (!formData.budget_max || formData.budget_max <= 0) newErrors.budget_max = "Max budget required";
    if (formData.budget_min && formData.budget_max && formData.budget_min >= formData.budget_max) {
      newErrors.budget_max = "Max budget must be greater than min";
    }

    if (!formData.start_date) newErrors.start_date = "Start date is required";
    if (!formData.end_date) newErrors.end_date = "End date is required";
    if (formData.start_date && formData.end_date && new Date(formData.start_date) >= new Date(formData.end_date)) {
      newErrors.end_date = "End date must be after start date";
    }

    if (!formData.estimated_hours || formData.estimated_hours <= 0) newErrors.estimated_hours = "Hours required";
    if (!formData.max_applicants || formData.max_applicants <= 0) newErrors.max_applicants = "Applicants required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    await onSubmit(formData as CreateJobData);
    setFormData(initialFormState);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let processedValue: any = value;
    if (type === "number") processedValue = parseFloat(value) || 0;

    setFormData((prev) => ({ ...prev, [name]: processedValue }));
    if (errors[name as keyof JobFormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl shadow-2xl border border-gray-100 p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-200">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">Create New Job</h3>
                <p className="text-sm text-gray-500">Fill in the details to post a new job</p>
              </div>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Job Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${errors.title ? "border-red-300 bg-red-50" : "border-gray-200 focus:border-red-500"}`}
                    placeholder="e.g. Senior React Developer"
                  />
                  {errors.title && <p className="mt-2 text-sm text-red-600 flex items-center gap-1"><AlertCircle className="w-4 h-4" />{errors.title}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Category <span className="text-red-500">*</span></label>
                  <select name="category" value={formData.category} onChange={handleChange} className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${errors.category ? "border-red-300" : "border-gray-200 focus:border-red-500"}`}>
                    <option value="">Select a category</option>
                    {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                  </select>
                  {errors.category && <p className="mt-2 text-sm text-red-600">{errors.category}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Job Type <span className="text-red-500">*</span></label>
                  <select name="job_type" value={formData.job_type} onChange={handleChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-red-500">
                    {JOB_TYPE_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Location <span className="text-red-500">*</span></label>
                  <input type="text" name="location" value={formData.location} onChange={handleChange} className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${errors.location ? "border-red-300" : "border-gray-200 focus:border-red-500"}`} />
                  {errors.location && <p className="mt-2 text-sm text-red-600">{errors.location}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Location Description</label>
                  <input type="text" name="location_text" value={formData.location_text} onChange={handleChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-red-500" placeholder="Optional details" />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Min Budget ($) <span className="text-red-500">*</span></label>
                  <input type="number" name="budget_min" value={formData.budget_min} onChange={handleChange} className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${errors.budget_min ? "border-red-300" : "border-gray-200 focus:border-red-500"}`} />
                  {errors.budget_min && <p className="mt-2 text-sm text-red-600">{errors.budget_min}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Max Budget ($) <span className="text-red-500">*</span></label>
                  <input type="number" name="budget_max" value={formData.budget_max} onChange={handleChange} className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${errors.budget_max ? "border-red-300" : "border-gray-200 focus:border-red-500"}`} />
                  {errors.budget_max && <p className="mt-2 text-sm text-red-600">{errors.budget_max}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Payment Type</label>
                  <select name="payment_type" value={formData.payment_type} onChange={handleChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-red-500">
                    {PAYMENT_TYPE_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Urgency</label>
                  <select name="urgency_level" value={formData.urgency_level} onChange={handleChange} className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-red-500">
                    {URGENCY_LEVEL_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Start Date <span className="text-red-500">*</span></label>
                  <input type="date" name="start_date" value={formData.start_date} onChange={handleChange} className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${errors.start_date ? "border-red-300" : "border-gray-200 focus:border-red-500"}`} />
                  {errors.start_date && <p className="mt-2 text-sm text-red-600">{errors.start_date}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">End Date <span className="text-red-500">*</span></label>
                  <input type="date" name="end_date" value={formData.end_date} onChange={handleChange} className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${errors.end_date ? "border-red-300" : "border-gray-200 focus:border-red-500"}`} />
                  {errors.end_date && <p className="mt-2 text-sm text-red-600">{errors.end_date}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Estimated Hours <span className="text-red-500">*</span></label>
                  <input type="number" name="estimated_hours" value={formData.estimated_hours} onChange={handleChange} className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${errors.estimated_hours ? "border-red-300" : "border-gray-200 focus:border-red-500"}`} />
                  {errors.estimated_hours && <p className="mt-2 text-sm text-red-600">{errors.estimated_hours}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Max Applicants <span className="text-red-500">*</span></label>
                  <input type="number" name="max_applicants" value={formData.max_applicants} onChange={handleChange} className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${errors.max_applicants ? "border-red-300" : "border-gray-200 focus:border-red-500"}`} min="1" />
                  {errors.max_applicants && <p className="mt-2 text-sm text-red-600">{errors.max_applicants}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description <span className="text-red-500">*</span></label>
                <textarea name="description" rows={6} value={formData.description} onChange={handleChange} className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none resize-none transition-all ${errors.description ? "border-red-300" : "border-gray-200 focus:border-red-500"}`} placeholder="Job details..." />
                {errors.description && <p className="mt-2 text-sm text-red-600">{errors.description}</p>}
                <p className="mt-1 text-xs text-gray-500">Minimum 50 characters required</p>
              </div>

              <div className="flex gap-4 justify-end pt-6 mt-8 border-t border-gray-200">
                <button type="button" onClick={onClose} className="px-6 py-2.5 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors font-medium">Cancel</button>
                <button type="submit" disabled={loading} className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg transition-all shadow-lg font-medium">
                  {loading ? <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div> : <Save className="w-4 h-4" />}
                  {loading ? "Creating..." : "Create Job"}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreateJobModal;