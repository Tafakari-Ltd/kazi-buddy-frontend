"use client";

import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { useJobs } from "@/Redux/Functions/useJobs";
import { Job } from "@/types/job.types";

interface Props {
  job: Job;
  onClose: () => void;
  onSuccess?: () => void;
}

const JobEditModal: React.FC<Props> = ({ job, onClose, onSuccess }) => {
  const { handleUpdateJob, loading, successMessage } = useJobs();

  const [title, setTitle] = useState(job.title || "");
  const [description, setDescription] = useState(job.description || "");
  const [budgetMin, setBudgetMin] = useState<number | string>(job.budget_min ?? "");
  const [budgetMax, setBudgetMax] = useState<number | string>(job.budget_max ?? "");
  const [estimatedHours, setEstimatedHours] = useState<number | string>(job.estimated_hours ?? "");
  const [locationText, setLocationText] = useState(job.location_text || "");

  const [startDate, setStartDate] = useState(() => {
    if (!job.start_date) return "";
    return String(job.start_date).split("T")[0];
  });

  const [endDate, setEndDate] = useState(() => {
    if (!job.end_date) return "";
    return String(job.end_date).split("T")[0];
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (successMessage) {
      toast.success("Job updated successfully");
      if (onSuccess) onSuccess();
      onClose();
    }
  }, [successMessage, onClose, onSuccess]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!description.trim()) {
      setError("Description is required");
      return;
    }

    if (budgetMin && budgetMax && Number(budgetMin) > Number(budgetMax)) {
      setError("Maximum budget must be greater than minimum");
      return;
    }

    if (startDate && endDate && startDate > endDate) {
      setError("End date must be after start date");
      return;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      budget_min: budgetMin === "" ? undefined : Number(budgetMin),
      budget_max: budgetMax === "" ? undefined : Number(budgetMax),
      estimated_hours: estimatedHours === "" ? undefined : Number(estimatedHours),
      location_text: locationText.trim() || undefined,
      start_date: startDate || undefined,
      end_date: endDate || undefined,
      category: typeof job.category === 'string' ? job.category : (job.category as any)?.id,
      job_type: job.job_type,
      urgency_level: job.urgency_level,
      payment_type: job.payment_type,
      visibility: job.visibility,
    };

    try {
      const result: any = await handleUpdateJob(job.id, payload);

      if (result && typeof result === 'object') {
        if (result.fieldErrors) {
          const errorMsg = Object.entries(result.fieldErrors)
            .map(([field, msgs]) => `${field}: ${(msgs as any[])[0]}`)
            .join(", ");
          setError(errorMsg);
        } else if (result.message) {
          setError(result.message);
        }
      } else if (typeof result === 'string') {
        setError(result);
      }
    } catch (err) {
      setError("An unexpected error occurred");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-xl">
        <div className="p-4 border-b flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-900">Edit Job</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-medium">
              ⚠️ {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Job Title</label>
            <input
              type="text"
              className="w-full p-2.5 border rounded-lg border-gray-300 focus:ring-2 focus:ring-red-500 outline-none"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Senior Developer"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">Description</label>
            <textarea
              className="w-full p-2.5 border rounded-lg border-gray-300 focus:ring-2 focus:ring-red-500 outline-none h-32 resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the job requirements..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Start Date</label>
              <input
                type="date"
                className="w-full p-2.5 border rounded-lg border-gray-300 focus:ring-2 focus:ring-red-500 outline-none"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">End Date</label>
              <input
                type="date"
                className="w-full p-2.5 border rounded-lg border-gray-300 focus:ring-2 focus:ring-red-500 outline-none"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Min Budget</label>
              <input
                type="number"
                className="w-full p-2.5 border rounded-lg border-gray-300 focus:ring-2 focus:ring-red-500 outline-none"
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Max Budget</label>
              <input
                type="number"
                className="w-full p-2.5 border rounded-lg border-gray-300 focus:ring-2 focus:ring-red-500 outline-none"
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Est. Hours</label>
              <input
                type="number"
                className="w-full p-2.5 border rounded-lg border-gray-300 focus:ring-2 focus:ring-red-500 outline-none"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Location</label>
              <input
                type="text"
                className="w-full p-2.5 border rounded-lg border-gray-300 focus:ring-2 focus:ring-red-500 outline-none"
                value={locationText}
                onChange={(e) => setLocationText(e.target.value)}
                placeholder="e.g. Remote / Nairobi"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-red-800 text-white rounded-lg hover:bg-red-700 disabled:opacity-60 transition-colors flex items-center gap-2 font-medium"
            >
              {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobEditModal;