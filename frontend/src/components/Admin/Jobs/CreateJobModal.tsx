"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertCircle, Save } from "lucide-react";
import {
  CreateJobData, JobFormErrors, JobStatus, JobType, UrgencyLevel, PaymentType, JobVisibility,
  JOB_TYPE_OPTIONS, URGENCY_LEVEL_OPTIONS, PAYMENT_TYPE_OPTIONS
} from "@/types/job.types";

interface CreateJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateJobData) => Promise<void>;
  categories: { id: string; name: string }[];
  loading: boolean;
}

const CreateJobModal: React.FC<CreateJobModalProps> = ({ isOpen, onClose, onSubmit, categories, loading }) => {
  const initialFormState: Partial<CreateJobData> = {
    title: "", description: "", category: "", location: "", location_text: "",
    job_type: JobType.FULL_TIME, urgency_level: UrgencyLevel.MEDIUM,
    budget_min: 0, budget_max: 0, payment_type: PaymentType.FIXED,
    start_date: "", end_date: "", estimated_hours: 0, max_applicants: 5,
    status: JobStatus.DRAFT, visibility: JobVisibility.PUBLIC,
  };

  const [formData, setFormData] = useState<Partial<CreateJobData>>(initialFormState);
  const [errors, setErrors] = useState<JobFormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: JobFormErrors = {};
    if (!formData.title?.trim()) newErrors.title = "Required";
    if (!formData.description?.trim() || formData.description.length < 50) newErrors.description = "Min 50 chars";
    if (!formData.category) newErrors.category = "Required";
    if (!formData.location?.trim()) newErrors.location = "Required";
    if (!formData.budget_min || formData.budget_min <= 0) newErrors.budget_min = "Required";
    if (!formData.budget_max || formData.budget_max <= 0) newErrors.budget_max = "Required";
    if (formData.budget_min && formData.budget_max && formData.budget_min >= formData.budget_max) newErrors.budget_max = "Max > Min";
    if (!formData.start_date) newErrors.start_date = "Required";
    if (!formData.end_date) newErrors.end_date = "Required";
    if (formData.start_date && formData.end_date && new Date(formData.start_date) >= new Date(formData.end_date)) newErrors.end_date = "End > Start";

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
    const val = type === "number" ? (parseFloat(value) || 0) : value;
    setFormData(prev => ({ ...prev, [name]: val }));
    if (errors[name as keyof JobFormErrors]) setErrors(prev => ({ ...prev, [name]: undefined }));
  };

  const inputClass = (err?: string) => `w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-all ${err ? "border-red-300 bg-red-50" : "border-gray-200 focus:border-red-500"}`;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }} className="bg-white rounded-xl shadow-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6 border-b pb-4">
              <h3 className="text-2xl font-bold text-gray-900">Create New Job</h3>
              <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-2">
                  <label className="block text-sm font-semibold mb-2">Job Title *</label>
                  <input name="title" value={formData.title} onChange={handleChange} className={inputClass(errors.title)} placeholder="e.g. Senior React Developer" />
                  {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Category *</label>
                  <select name="category" value={formData.category} onChange={handleChange} className={inputClass(errors.category)}>
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Job Type</label>
                  <select name="job_type" value={formData.job_type} onChange={handleChange} className={inputClass()}>
                    {JOB_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Location *</label>
                  <input name="location" value={formData.location} onChange={handleChange} className={inputClass(errors.location)} />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Min Budget (KES) *</label>
                  <input type="number" name="budget_min" value={formData.budget_min ?? ""} onChange={handleChange} className={inputClass(errors.budget_min)} />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Max Budget (KES) *</label>
                  <input type="number" name="budget_max" value={formData.budget_max ?? ""} onChange={handleChange} className={inputClass(errors.budget_max)} />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Start Date *</label>
                  <input type="date" name="start_date" value={formData.start_date ?? ""} onChange={handleChange} className={inputClass(errors.start_date)} />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">End Date *</label>
                  <input type="date" name="end_date" value={formData.end_date ?? ""} onChange={handleChange} className={inputClass(errors.end_date)} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2">Description *</label>
                <textarea name="description" rows={6} value={formData.description} onChange={handleChange} className={inputClass(errors.description)} />
                {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description}</p>}
              </div>

              <div className="flex justify-end gap-4 pt-4 border-t">
                <button type="button" onClick={onClose} className="px-6 py-2 border rounded-lg hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={loading} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2">
                  {loading ? "Saving..." : <><Save className="w-4 h-4" /> Create Job</>}
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