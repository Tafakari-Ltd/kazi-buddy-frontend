"use client";

import React, { useState } from "react";
import { Plus, Minus, Clock, MapPin, DollarSign, FileText } from "lucide-react";
import {
  CreateWorkerProfileData,
  UpdateWorkerProfileData,
  AvailabilitySchedule,
  DAYS_OF_WEEK,
  TIME_SLOTS,
  LOCATION_OPTIONS,
  EXPERIENCE_LEVELS,
  WorkerProfileFormErrors,
} from "@/types/worker.types";

interface WorkerProfileFormProps {
  initialData?: Partial<CreateWorkerProfileData>;
  onSubmit: (data: CreateWorkerProfileData) => void;
  onCancel: () => void;
  loading?: boolean;
  errors?: WorkerProfileFormErrors;
  isEdit?: boolean;
}

const WorkerProfileForm: React.FC<WorkerProfileFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  loading = false,
  errors = {},
  isEdit = false,
}) => {
  const [formData, setFormData] = useState<CreateWorkerProfileData>({
    location: initialData?.location || "",
    location_text: initialData?.location_text || "",
    is_available: initialData?.is_available ?? true,
    years_experience: initialData?.years_experience || 0,
    hourly_rate: initialData?.hourly_rate || "",
    availability_schedule: initialData?.availability_schedule || {},
    bio: initialData?.bio || "",
  });

  const handleInputChange = (field: keyof CreateWorkerProfileData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleScheduleChange = (day: string, timeIndex: number, value: string) => {
    setFormData((prev) => {
      const newSchedule = { ...prev.availability_schedule };
      if (!newSchedule[day]) {
        newSchedule[day] = ["", ""];
      }
      newSchedule[day][timeIndex] = value;
      
      // Remove the day if both times are empty
      if (!newSchedule[day][0] && !newSchedule[day][1]) {
        delete newSchedule[day];
      }
      
      return {
        ...prev,
        availability_schedule: newSchedule,
      };
    });
  };

  const addScheduleDay = (day: string) => {
    setFormData((prev) => ({
      ...prev,
      availability_schedule: {
        ...prev.availability_schedule,
        [day]: ["09:00", "17:00"],
      },
    }));
  };

  const removeScheduleDay = (day: string) => {
    setFormData((prev) => {
      const newSchedule = { ...prev.availability_schedule };
      delete newSchedule[day];
      return {
        ...prev,
        availability_schedule: newSchedule,
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const availableDays = DAYS_OF_WEEK.filter(
    (day) => !formData.availability_schedule[day]
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Location Information */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          Location Information
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location *
            </label>
            <select
              className={`w-full p-3 border rounded-lg ${
                errors.location ? "border-red-500" : "border-gray-300"
              }`}
              value={formData.location}
              onChange={(e) => handleInputChange("location", e.target.value)}
            >
              <option value="">Select location</option>
              {LOCATION_OPTIONS.map((location) => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>
            {errors.location && (
              <p className="text-xs text-red-600 mt-1">{errors.location}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location Details
            </label>
            <input
              type="text"
              className={`w-full p-3 border rounded-lg ${
                errors.location_text ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="e.g., Near CBD, Downtown area"
              value={formData.location_text}
              onChange={(e) => handleInputChange("location_text", e.target.value)}
            />
            {errors.location_text && (
              <p className="text-xs text-red-600 mt-1">{errors.location_text}</p>
            )}
          </div>
        </div>
      </div>

      {/* Experience and Rate */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Experience & Rate
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Years of Experience *
            </label>
            <select
              className={`w-full p-3 border rounded-lg ${
                errors.years_experience ? "border-red-500" : "border-gray-300"
              }`}
              value={formData.years_experience}
              onChange={(e) => handleInputChange("years_experience", parseInt(e.target.value))}
            >
              {EXPERIENCE_LEVELS.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
            {errors.years_experience && (
              <p className="text-xs text-red-600 mt-1">{errors.years_experience}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Hourly Rate (USD) *
            </label>
            <input
              type="number"
              step="0.50"
              min="0"
              className={`w-full p-3 border rounded-lg ${
                errors.hourly_rate ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="15.00"
              value={formData.hourly_rate}
              onChange={(e) => handleInputChange("hourly_rate", e.target.value)}
            />
            {errors.hourly_rate && (
              <p className="text-xs text-red-600 mt-1">{errors.hourly_rate}</p>
            )}
          </div>
        </div>
      </div>

      {/* Availability */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Availability
          </h3>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_available}
              onChange={(e) => handleInputChange("is_available", e.target.checked)}
              className="rounded border-gray-300 text-red-600 focus:ring-red-500"
            />
            <span className="text-sm font-medium text-gray-700">Currently Available</span>
          </label>
        </div>

        {/* Schedule */}
        <div className="space-y-3">
          {Object.keys(formData.availability_schedule).map((day) => (
            <div key={day} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-20 text-sm font-medium text-gray-700 capitalize">
                {day}
              </div>
              <select
                className="border rounded px-3 py-1 text-sm"
                value={formData.availability_schedule[day][0] || ""}
                onChange={(e) => handleScheduleChange(day, 0, e.target.value)}
              >
                <option value="">Start time</option>
                {TIME_SLOTS.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
              <span className="text-gray-500">to</span>
              <select
                className="border rounded px-3 py-1 text-sm"
                value={formData.availability_schedule[day][1] || ""}
                onChange={(e) => handleScheduleChange(day, 1, e.target.value)}
              >
                <option value="">End time</option>
                {TIME_SLOTS.map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => removeScheduleDay(day)}
                className="text-red-600 hover:text-red-800 p-1"
              >
                <Minus className="w-4 h-4" />
              </button>
            </div>
          ))}

          {/* Add Day */}
          {availableDays.length > 0 && (
            <div className="flex items-center gap-2">
              <select
                className="border rounded px-3 py-2 text-sm"
                value=""
                onChange={(e) => {
                  if (e.target.value) {
                    addScheduleDay(e.target.value);
                  }
                }}
              >
                <option value="">Add day</option>
                {availableDays.map((day) => (
                  <option key={day} value={day}>
                    {day.charAt(0).toUpperCase() + day.slice(1)}
                  </option>
                ))}
              </select>
              <Plus className="w-4 h-4 text-gray-500" />
            </div>
          )}
        </div>

        {errors.availability_schedule && (
          <p className="text-xs text-red-600">{errors.availability_schedule}</p>
        )}
      </div>

      {/* Bio */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <FileText className="w-5 h-5" />
          About You
        </h3>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bio *
          </label>
          <textarea
            rows={5}
            className={`w-full p-3 border rounded-lg ${
              errors.bio ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Tell employers about your skills, experience, and what makes you a great worker..."
            value={formData.bio}
            onChange={(e) => handleInputChange("bio", e.target.value)}
          />
          <div className="flex justify-between items-center mt-1">
            {errors.bio && (
              <p className="text-xs text-red-600">{errors.bio}</p>
            )}
            <span className="text-xs text-gray-500 ml-auto">
              {formData.bio.length}/500 characters
            </span>
          </div>
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex justify-end gap-3 pt-6 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          {loading ? "Saving..." : isEdit ? "Update Profile" : "Create Profile"}
        </button>
      </div>
    </form>
  );
};

export default WorkerProfileForm;