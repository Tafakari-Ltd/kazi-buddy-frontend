"use client";

import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/Redux/Store/Store";
import {
  createJobSkillsService,
  getJobSkills,
  getJobSkillsLoading,
  getJobSkillsError,
  getJobSkillsSuccess,
  validateSkillData,
  formatSkillForDisplay,
} from "@/services/jobSkillsService";
import { SkillLevel, SKILL_LEVEL_OPTIONS } from "@/types/job.types";
import { toast } from "sonner";

interface JobSkillsManagerProps {
  jobId: string;
  readonly?: boolean;
}

const JobSkillsManager: React.FC<JobSkillsManagerProps> = ({ jobId, readonly = false }) => {
  const dispatch = useDispatch<AppDispatch>();
  const jobSkillsService = createJobSkillsService(dispatch);

  const allJobSkills = useSelector(getJobSkills);
  // Filter skills for this specific job
  const jobSkills = allJobSkills.filter(skill => skill.job_id === jobId);
  const loading = useSelector(getJobSkillsLoading);
  const error = useSelector(getJobSkillsError);
  const successMessage = useSelector(getJobSkillsSuccess);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    skill: "",
    experience_level: SkillLevel.INTERMEDIATE,
    is_required: false,
  });

  // Fetch job skills on component mount
  useEffect(() => {
    // For now, we'll fetch all skills and filter by jobId client-side
    // In a real app, you'd want a separate endpoint for job-specific skills
    jobSkillsService.fetchAll();
  }, []);

  // Handle success/error messages
  useEffect(() => {
    if (successMessage) {
      toast.success(successMessage);
      jobSkillsService.clearMessages();
      setShowAddForm(false);
      setEditingSkillId(null);
      resetForm();
    }
    if (error) {
      toast.error(error);
      jobSkillsService.clearMessages();
    }
  }, [successMessage, error]);

  const resetForm = () => {
    setFormData({
      skill: "",
      experience_level: SkillLevel.INTERMEDIATE,
      is_required: false,
    });
  };

  const handleSubmit = async () => {

    // Validate form data
    const validationErrors = validateSkillData(formData);
    if (validationErrors.length > 0) {
      validationErrors.forEach((error) => toast.error(error));
      return;
    }

    try {
      if (editingSkillId) {
        // Update existing skill
        await jobSkillsService.update(editingSkillId, formData);
      } else {
        // Create new skill
        await jobSkillsService.create(jobId, formData);
      }
    } catch (error) {
      console.error("Error saving job skill:", error);
    }
  };

  const handleEdit = (skillId: string) => {
    const skill = allJobSkills.find((s) => s.id === skillId);
    if (skill) {
      setFormData({
        skill: skill.skill,
        experience_level: skill.experience_level,
        is_required: skill.is_required,
      });
      setEditingSkillId(skillId);
      setShowAddForm(true);
    }
  };

  const handleDelete = async (skillId: string) => {
    if (window.confirm("Are you sure you want to delete this skill?")) {
      try {
        await jobSkillsService.delete(skillId);
      } catch (error) {
        console.error("Error deleting job skill:", error);
      }
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingSkillId(null);
    resetForm();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2">Loading job skills...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Job Skills</h3>
        {!readonly && (
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            disabled={showAddForm}
          >
            Add Skill
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showAddForm && !readonly && (
        <div className="bg-gray-50 p-4 rounded-md space-y-4">
          <div>
            <label htmlFor="skill" className="block text-sm font-medium text-gray-700">
              Skill Name *
            </label>
            <input
              type="text"
              id="skill"
              value={formData.skill}
              onChange={(e) => setFormData({ ...formData, skill: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g., JavaScript, Python, Design Thinking"
              required
            />
          </div>

          <div>
            <label htmlFor="experience_level" className="block text-sm font-medium text-gray-700">
              Experience Level *
            </label>
            <select
              id="experience_level"
              value={formData.experience_level}
              onChange={(e) =>
                setFormData({ ...formData, experience_level: e.target.value as SkillLevel })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
            >
              {SKILL_LEVEL_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_required"
              checked={formData.is_required}
              onChange={(e) => setFormData({ ...formData, is_required: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_required" className="ml-2 block text-sm text-gray-900">
              This skill is required
            </label>
          </div>

          <div className="flex space-x-2">
            <button
              type="button"
              onClick={handleSubmit}
              className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors"
              disabled={loading}
            >
              {editingSkillId ? "Update" : "Add"} Skill
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Skills List */}
      {jobSkills.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <p>No skills added yet.</p>
          {!readonly && <p className="text-sm">Click "Add Skill" to get started.</p>}
        </div>
      ) : (
        <div className="space-y-2">
          {jobSkills.map((skill) => (
            <div
              key={skill.id}
              className="flex items-center justify-between p-3 bg-white border rounded-md shadow-sm"
            >
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">{skill.skill}</span>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      skill.experience_level === SkillLevel.EXPERT
                        ? "bg-purple-100 text-purple-800"
                        : skill.experience_level === SkillLevel.ADVANCED
                        ? "bg-blue-100 text-blue-800"
                        : skill.experience_level === SkillLevel.INTERMEDIATE
                        ? "bg-green-100 text-green-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {skill.experience_level.charAt(0).toUpperCase() +
                      skill.experience_level.slice(1)}
                  </span>
                  {skill.is_required && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      Required
                    </span>
                  )}
                </div>
              </div>
              {!readonly && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(skill.id)}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    disabled={showAddForm}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(skill.id)}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                    disabled={loading}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobSkillsManager;