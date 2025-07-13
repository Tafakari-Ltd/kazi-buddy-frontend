"use client";

import React, { useState, ChangeEvent, FormEvent, useRef } from "react";
import { Upload } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

import { categories } from "@/component/Homepage/HotJobs/Jobs";
import "highlight.js/styles/github.css";

interface JobFormData {
  title: string;
  jobType: string;
  category: string;
  location: string;
  rate: string;
  description: string;
  image: File | null;
}

const UploadNew: React.FC = () => {
  const [formData, setFormData] = useState<JobFormData>({
    title: "",
    jobType: "",
    category: "",
    location: "",
    rate: "",
    description: "",
    image: null,
  });

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Auto-resize textarea
    if (name === "description" && textareaRef.current) {
      textareaRef.current.style.height = "auto"; // Reset height
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!formData.image) {
      alert("Please upload an image.");
      return;
    }

    const data = new FormData();
    data.append("title", formData.title);
    data.append("jobType", formData.jobType);
    data.append("category", formData.category);
    data.append("location", formData.location);
    data.append("rate", formData.rate);
    data.append("description", formData.description);
    data.append("image", formData.image);

    console.log("Job posted:", formData);
    alert("Job posted successfully!");

    e.currentTarget.reset();
    setFormData({
      title: "",
      jobType: "",
      category: "",
      location: "",
      rate: "",
      description: "",
      image: null,
    });
    setPreviewUrl(null);
  };

  return (
    <div className="bg-white mx-auto">
      <h2 className="text-2xl font-semibold text-[#800000] mb-6">
        Upload New Job Posting
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="title"
          placeholder="Job Title"
          value={formData.title}
          onChange={handleChange}
          required
          className="w-full border p-2 rounded border-neutral-300"
        />

        <div className="grid grid-cols-2 gap-4">
          <div>
            <input
              type="text"
              name="jobType"
              list="jobTypes"
              placeholder="Job Type (e.g., Full-Time)"
              value={formData.jobType}
              onChange={handleChange}
              required
              className="w-full border p-2 rounded border-neutral-300"
            />
            <datalist id="jobTypes">
              <option value="Full-Time" />
              <option value="Part-Time" />
              <option value="Contract" />
              <option value="Freelance" />
            </datalist>
          </div>

          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded border-neutral-300 text-gray-600"
          >
            <option value="">Select Category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            name="location"
            placeholder="Location (e.g., Nairobi, Kenya)"
            value={formData.location}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded border-neutral-300"
          />

          <input
            type="text"
            name="rate"
            placeholder="Rate (e.g., KSh 1000/Day)"
            value={formData.rate}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded border-neutral-300"
          />
        </div>

        {/* Markdown Textarea and Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <textarea
            ref={textareaRef}
            name="description"
            placeholder="Write job description in markdown..."
            value={formData.description}
            onChange={handleChange}
            required
            className="w-full border p-2 rounded border-neutral-300 overflow-hidden resize-none"
            rows={4}
          />
          <div className="w-full border border-dashed p-3 rounded border-neutral-300 overflow-auto prose prose-sm max-h-[700px]">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeHighlight]}
            >
              {formData.description}
            </ReactMarkdown>
          </div>
        </div>

        {/* Upload Image */}
        <div className="flex items-center gap-2">
          <label
            htmlFor="imageUpload"
            className="flex items-center gap-2 bg-gray-100 border border-neutral-300 rounded px-4 py-2 cursor-pointer hover:bg-gray-200"
          >
            <Upload className="text-[#800000]" size={20} />
            <span className="text-sm">Upload Image</span>
          </label>
          <input
            type="file"
            id="imageUpload"
            accept="image/*"
            onChange={handleImageChange}
            required
            className="hidden"
          />
          {formData.image && (
            <span className="text-sm text-gray-600">{formData.image.name}</span>
          )}
        </div>

        {/* Image Preview */}
        {previewUrl && (
          <div>
            <img
              src={previewUrl}
              alt="Preview"
              className="mt-2 h-40 object-cover rounded"
            />
          </div>
        )}

        <button
          type="submit"
          className="bg-[#800000] text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Post Job
        </button>
      </form>
    </div>
  );
};

export default UploadNew;
