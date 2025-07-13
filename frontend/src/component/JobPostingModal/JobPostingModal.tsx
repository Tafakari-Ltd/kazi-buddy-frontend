"use client";

import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import { categories } from "../Homepage/HotJobs/Jobs";

const JOB_TYPES = ["Full-Time", "Part-Time", "Contract", "Internship"];

const JobPostingModal = ({ onClose }: { onClose: () => void }) => {
  type FormDataType = {
    title: string;
    company: string;
    location: string;
    type: string;
    category: string;
    salary: string;
    deadline: string;
    description: string;
    requirements: string[];
    benefits: string[];
  };

  const [formData, setFormData] = useState<FormDataType>({
    title: "",
    company: "",
    location: "",
    type: "",
    category: "",
    salary: "",
    deadline: "",
    description: "",
    requirements: [],
    benefits: [],
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleListChange = (
    field: "requirements" | "benefits",
    index: number,
    value: string
  ) => {
    const updated = [...formData[field]];
    updated[index] = value;
    setFormData((prev) => ({ ...prev, [field]: updated }));
  };

  const addListItem = (field: "requirements" | "benefits") => {
    setFormData((prev) => ({ ...prev, [field]: [...prev[field], ""] }));
  };

  const removeListItem = (
    field: "requirements" | "benefits",
    index: number
  ) => {
    const updated = [...formData[field]];
    updated.splice(index, 1);
    setFormData((prev) => ({ ...prev, [field]: updated }));
  };

  const validate = () => {
    const newErrors: { [key in keyof FormDataType]?: string } = {};
    const requiredFields: (keyof FormDataType)[] = [
      "title",
      "company",
      "location",
      "type",
      "category",
      "salary",
      "deadline",
      "description",
    ];

    requiredFields.forEach((field) => {
      if (!formData[field]) {
        newErrors[field] = "This field is required";
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    console.log("Submitting job:", formData);
    // Perform API call here...

    onClose(); // Close modal on success
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full shadow-lg max-w-[1100px]">
        <div className="p-4 border-b border-neutral-300">
          <h3 className="text-lg font-semibold text-red-800">Create New Job</h3>
        </div>

        <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
          {/* Input Field */}
          {[
            {
              label: "Job Title",
              name: "title",
              placeholder: "e.g. House Cleaner",
            },
            { label: "Company", name: "company", placeholder: "Company Name" },
            {
              label: "Location",
              name: "location",
              placeholder: "e.g. Nairobi, Kenya",
            },
            {
              label: "Salary Range",
              name: "salary",
              placeholder: "e.g. KES 25,000 - 35,000",
            },
          ].map(({ label, name, placeholder }) => (
            <div key={name}>
              <label className="block text-sm font-medium mb-1">
                {label} *
              </label>
              <input
                type="text"
                className={`w-full p-2 border rounded ${
                  errors[name] ? "border-red-500" : "border-gray-300"
                }`}
                placeholder={placeholder}
                value={(formData as any)[name]}
                onChange={(e) => handleChange(name, e.target.value)}
              />
              {errors[name] && (
                <p className="text-xs text-red-500">{errors[name]}</p>
              )}
            </div>
          ))}

          {/* Select Fields */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">
                Job Type *
              </label>
              <select
                className={`w-full p-2 border rounded ${
                  errors.type ? "border-red-500" : "border-gray-300"
                }`}
                value={formData.type}
                onChange={(e) => handleChange("type", e.target.value)}
              >
                <option value="">Select job type</option>
                {JOB_TYPES.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              {errors.type && (
                <p className="text-xs text-red-500">{errors.type}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Category *
              </label>
              <select
                className={`w-full p-2 border rounded ${
                  errors.category ? "border-red-500" : "border-gray-300"
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
              {errors.category && (
                <p className="text-xs text-red-500">{errors.category}</p>
              )}
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-medium mb-1">Deadline *</label>
            <input
              type="date"
              className={`w-full p-2 border rounded ${
                errors.deadline ? "border-red-500" : "border-gray-300"
              }`}
              value={formData.deadline}
              onChange={(e) => handleChange("deadline", e.target.value)}
            />
            {errors.deadline && (
              <p className="text-xs text-red-500">{errors.deadline}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Description *
            </label>
            <textarea
              rows={4}
              className={`w-full p-2 border rounded ${
                errors.description ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Describe the job role..."
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
            />
            {errors.description && (
              <p className="text-xs text-red-500">{errors.description}</p>
            )}
          </div>

          {/* Requirements */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Requirements
            </label>
            {formData.requirements.map((req, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <input
                  type="text"
                  className="flex-1 p-2 border rounded border-neutral-300"
                  placeholder="Enter requirement"
                  value={req}
                  onChange={(e) =>
                    handleListChange("requirements", idx, e.target.value)
                  }
                />
                <button
                  onClick={() => removeListItem("requirements", idx)}
                  className="p-2 text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              onClick={() => addListItem("requirements")}
              className="text-red-600 text-sm flex items-center gap-1"
            >
              <span>+</span> Add Requirement
            </button>
          </div>

          {/* Benefits */}
          <div>
            <label className="block text-sm font-medium mb-1">Benefits</label>
            {formData.benefits.map((benefit, idx) => (
              <div key={idx} className="flex gap-2 mb-2">
                <input
                  type="text"
                  className="flex-1 p-2 border rounded border-neutral-300"
                  placeholder="Enter benefit"
                  value={benefit}
                  onChange={(e) =>
                    handleListChange("benefits", idx, e.target.value)
                  }
                />
                <button
                  onClick={() => removeListItem("benefits", idx)}
                  className="p-2 text-red-600 hover:text-red-800"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <button
              onClick={() => addListItem("benefits")}
              className="text-red-600 text-sm flex items-center gap-1"
            >
              <span>+</span> Add Benefit
            </button>
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
