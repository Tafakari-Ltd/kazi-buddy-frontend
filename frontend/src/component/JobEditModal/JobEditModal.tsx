"use client";

import React, { useEffect, useState } from "react";
import { useJobs } from "@/Redux/Functions/useJobs";
import { Job } from "@/types/job.types";

interface Props {
  job: Job;
  onClose: () => void;
  onSuccess?: () => void;
}

const JobEditModal: React.FC<Props> = ({ job, onClose, onSuccess }) => {
  const { handleUpdateJob, loading, successMessage } = useJobs();

  const [title, setTitle] = useState(job.title);
  const [budgetMin, setBudgetMin] = useState<number | string>(job.budget_min ?? "");
  const [budgetMax, setBudgetMax] = useState<number | string>(job.budget_max ?? "");
  const [estimatedHours, setEstimatedHours] = useState<number | string>(job.estimated_hours ?? "");
  const [locationText, setLocationText] = useState(job.location_text ?? "");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (successMessage) {
      if (onSuccess) onSuccess();
      onClose();
    }
  }, [successMessage, onClose, onSuccess]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (budgetMin && budgetMax && Number(budgetMin) > Number(budgetMax)) {
      setError("Maximum budget must be greater than minimum");
      return;
    }

    await handleUpdateJob(job.id, {
      title: title?.trim() || undefined,
      budget_min: budgetMin === "" ? undefined : Number(budgetMin),
      budget_max: budgetMax === "" ? undefined : Number(budgetMax),
      estimated_hours: estimatedHours === "" ? undefined : Number(estimatedHours),
      location_text: locationText?.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-xl">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Edit Job</h3>
        </div>

        <form onSubmit={onSubmit} className="p-4 space-y-3">
          {error && (
            <div className="p-2 bg-red-50 text-red-700 border border-red-200 rounded">{error}</div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              className="w-full p-2 border rounded border-gray-300"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Min Budget</label>
              <input
                type="number"
                className="w-full p-2 border rounded border-gray-300"
                value={budgetMin}
                onChange={(e) => setBudgetMin(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Max Budget</label>
              <input
                type="number"
                className="w-full p-2 border rounded border-gray-300"
                value={budgetMax}
                onChange={(e) => setBudgetMax(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Estimated Hours</label>
              <input
                type="number"
                className="w-full p-2 border rounded border-gray-300"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location Details</label>
              <input
                type="text"
                className="w-full p-2 border rounded border-gray-300"
                value={locationText}
                onChange={(e) => setLocationText(e.target.value)}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded text-gray-700">
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-red-700 text-white rounded disabled:opacity-60"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobEditModal;