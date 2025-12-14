"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Save } from "lucide-react";
import {
  BusinessType,
  BUSINESS_TYPE_OPTIONS,
  INDUSTRY_OPTIONS,
} from "@/types/employer.types";

interface EmployerProfileFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: any) => Promise<void>;
  initialData?: any;
  loading: boolean;
  isEdit: boolean;
}

const EmployerProfileForm: React.FC<EmployerProfileFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  loading,
  isEdit,
}) => {
  const initialFormState = {
    company_name: "",
    business_type: BusinessType.CORPORATION,
    industry: "",
    location: "",
    location_text: "",
    description: "",
    website_url: "",
    business_registration_number: "",
  };

  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isOpen && initialData) {
      setFormData({
        company_name: initialData.company_name || "",
        business_type: initialData.business_type || BusinessType.CORPORATION,
        industry: initialData.industry || "",
        location: initialData.location || "",
        location_text: initialData.location_text || "",
        description: initialData.description || "",
        website_url: initialData.website_url || "",
        business_registration_number: initialData.business_registration_number || "",
      });
    } else if (isOpen && !isEdit) {
      setFormData(initialFormState);
    }
    setErrors({});
  }, [isOpen, initialData, isEdit]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.company_name.trim()) newErrors.company_name = "Company name is required";
    if (!formData.industry) newErrors.industry = "Industry is required";
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.description.trim()) newErrors.description = "Description is required";
    if (!formData.business_registration_number.trim()) {
      newErrors.business_registration_number = "Registration number is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    await onSubmit(formData);
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <h3 className="text-xl font-bold text-gray-900">
                {isEdit ? "Edit Employer Profile" : "Create Employer Profile"}
              </h3>
              <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Company Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Company Name *</label>
                <input
                  type="text"
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.company_name ? "border-red-300 focus:ring-red-200 bg-red-50" : "border-gray-300 focus:ring-red-100 focus:border-red-400"}`}
                  placeholder="Enter company name"
                  value={formData.company_name}
                  onChange={(e) => handleChange("company_name", e.target.value)}
                />
                {errors.company_name && <p className="text-xs text-red-600 mt-1">{errors.company_name}</p>}
              </div>

              {/* Business Type and Industry */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Business Type *</label>
                  <select
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400 bg-white"
                    value={formData.business_type}
                    onChange={(e) => handleChange("business_type", e.target.value)}
                  >
                    {BUSINESS_TYPE_OPTIONS.map((type) => (
                      <option key={type.value} value={type.value}>{type.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Industry *</label>
                  <select
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.industry ? "border-red-300 focus:ring-red-200 bg-red-50" : "border-gray-300 focus:ring-red-100 focus:border-red-400 bg-white"}`}
                    value={formData.industry}
                    onChange={(e) => handleChange("industry", e.target.value)}
                  >
                    <option value="">Select industry</option>
                    {INDUSTRY_OPTIONS.map((industry) => (
                      <option key={industry} value={industry}>{industry}</option>
                    ))}
                  </select>
                  {errors.industry && <p className="text-xs text-red-600 mt-1">{errors.industry}</p>}
                </div>
              </div>

              {/* Location */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Location *</label>
                  <input
                    type="text"
                    className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.location ? "border-red-300 focus:ring-red-200 bg-red-50" : "border-gray-300 focus:ring-red-100 focus:border-red-400"}`}
                    placeholder="City, Country"
                    value={formData.location}
                    onChange={(e) => handleChange("location", e.target.value)}
                  />
                  {errors.location && <p className="text-xs text-red-600 mt-1">{errors.location}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Location Details</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400"
                    placeholder="e.g., Downtown area"
                    value={formData.location_text}
                    onChange={(e) => handleChange("location_text", e.target.value)}
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Company Description *</label>
                <textarea
                  rows={4}
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all resize-none ${errors.description ? "border-red-300 focus:ring-red-200 bg-red-50" : "border-gray-300 focus:ring-red-100 focus:border-red-400"}`}
                  placeholder="Describe your company..."
                  value={formData.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                />
                {errors.description && <p className="text-xs text-red-600 mt-1">{errors.description}</p>}
              </div>

              {/* Website URL */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Website URL</label>
                <input
                  type="url"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400"
                  placeholder="https://your-website.com"
                  value={formData.website_url}
                  onChange={(e) => handleChange("website_url", e.target.value)}
                />
              </div>

              {/* Business Registration Number */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Business Registration Number *</label>
                <input
                  type="text"
                  className={`w-full p-3 border rounded-lg focus:outline-none focus:ring-2 transition-all ${errors.business_registration_number ? "border-red-300 focus:ring-red-200 bg-red-50" : "border-gray-300 focus:ring-red-100 focus:border-red-400"}`}
                  placeholder="Your business registration number"
                  value={formData.business_registration_number}
                  onChange={(e) => handleChange("business_registration_number", e.target.value)}
                />
                {errors.business_registration_number && <p className="text-xs text-red-600 mt-1">{errors.business_registration_number}</p>}
              </div>
            </div>

            <div className="p-6 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-5 py-2.5 bg-red-800 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 font-medium flex items-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {loading ? "Saving..." : isEdit ? "Update Profile" : "Create Profile"}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EmployerProfileForm;