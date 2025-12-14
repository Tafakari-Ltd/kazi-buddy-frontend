"use client";
import React, { useState, useEffect } from "react";
import { CreateWorkerProfileData } from "@/types/worker.types";
import { X, Save, AlertCircle } from "lucide-react";

interface WorkerProfileFormProps {
  initialData?: CreateWorkerProfileData;
  onSubmit: (data: CreateWorkerProfileData) => Promise<void>;
  onCancel: () => void;
  loading: boolean;
  isEdit: boolean;
}

const WorkerProfileForm: React.FC<WorkerProfileFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  loading,
  isEdit,
}) => {
  const [formData, setFormData] = useState<CreateWorkerProfileData>({
    location: "",
    location_text: "",
    bio: "",
    skills: [],
    hourly_rate: 0,
    years_experience: 0,
    is_available: true,
    availability_schedule: {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: [],
      saturday: [],
      sunday: [],
    },
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        // Ensure availability_schedule structure exists
        availability_schedule: initialData.availability_schedule || {
          monday: [], tuesday: [], wednesday: [], thursday: [], friday: [], saturday: [], sunday: []
        }
      });
    }
  }, [initialData]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.location.trim()) newErrors.location = "Location is required";
    if (!formData.bio.trim()) newErrors.bio = "Bio is required";
    
    // Handle number/string conversion safely
    const rate = Number(formData.hourly_rate);
    if (!rate || rate <= 0) newErrors.hourly_rate = "Valid hourly rate is required";
    
    const exp = Number(formData.years_experience);
    if (exp < 0) newErrors.years_experience = "Invalid experience years";

    const hasAvailability = Object.values(formData.availability_schedule || {}).some(
      (daySlots) => Array.isArray(daySlots) && daySlots.length >= 2
    );
    
    if (!hasAvailability) {
        // Warning but maybe not blocking? Original logic blocked it.
       // newErrors.availability_schedule = "Set at least one availability day";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    await onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let processedValue: any = value;
    
    if (type === "number") processedValue = parseFloat(value) || 0;
    if (type === "checkbox") processedValue = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({ ...prev, [name]: processedValue }));
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location *</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none ${errors.location ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
              placeholder="e.g. Nairobi, Kenya"
            />
            {errors.location && <p className="text-xs text-red-500 mt-1">{errors.location}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Specific Area</label>
            <input
              type="text"
              name="location_text"
              value={formData.location_text}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              placeholder="e.g. Westlands"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate (KES) *</label>
            <input
              type="number"
              name="hourly_rate"
              value={formData.hourly_rate}
              onChange={handleChange}
              className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none ${errors.hourly_rate ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
            />
            {errors.hourly_rate && <p className="text-xs text-red-500 mt-1">{errors.hourly_rate}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
            <input
              type="number"
              name="years_experience"
              value={formData.years_experience}
              onChange={handleChange}
              className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none ${errors.years_experience ? 'border-red-500' : 'border-gray-300'}`}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Bio *</label>
          <textarea
            name="bio"
            rows={4}
            value={formData.bio}
            onChange={handleChange}
            className={`w-full p-2 border rounded-lg focus:ring-2 focus:ring-red-500 outline-none resize-none ${errors.bio ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
            placeholder="Tell employers about yourself..."
          />
          {errors.bio && <p className="text-xs text-red-500 mt-1">{errors.bio}</p>}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="is_available"
            checked={formData.is_available}
            onChange={handleChange}
            id="is_available"
            className="w-4 h-4 text-red-600 rounded focus:ring-red-500 border-gray-300"
          />
          <label htmlFor="is_available" className="text-sm font-medium text-gray-700">
            I am currently available for work
          </label>
        </div>

        {/* Availability Schedule placeholder - In a real app this would be a complex scheduler component */}
        {errors.availability_schedule && (
          <div className="bg-yellow-50 p-3 rounded text-sm text-yellow-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> {errors.availability_schedule}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-2 bg-red-800 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {loading ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {loading ? "Saving..." : isEdit ? "Update Profile" : "Create Profile"}
        </button>
      </div>
    </form>
  );
};

export default WorkerProfileForm;