"use client";

import React from "react";

const jobAlerts = [
  {
    id: 1,
    title: "Housekeeper Needed in Dubai",
    jobType: "Full-Time",
    category: "Domestic Work",
    location: "Dubai, UAE",
    rate: "$500/Month + Accommodation",
    deadline: "2025-06-15",
    description:
      "Looking for a dedicated and hardworking housekeeper. Experience preferred but not mandatory. Food and housing provided.",
  },
  {
    id: 2,
    title: "Security Guard Job - Nairobi",
    jobType: "Shift-Based",
    category: "Security",
    location: "Nairobi, Kenya",
    rate: "KES 25,000/Month",
    deadline: "2025-07-01",
    description:
      "Must be alert and physically fit. Night and day shifts available. Basic training offered for free.",
  },
  {
    id: 3,
    title: "Factory Worker in Qatar",
    jobType: "Contract (2 years)",
    category: "Manual Labor",
    location: "Doha, Qatar",
    rate: "$450/Month + Benefits",
    deadline: "2025-06-30",
    description:
      "We are hiring men and women for light factory duties. Accommodation, meals, and transport provided.",
  },
  {
    id: 4,
    title: "Shop Attendant – Mombasa",
    jobType: "Part-Time",
    category: "Retail",
    location: "Mombasa, Kenya",
    rate: "KES 800/Day",
    deadline: "2025-06-20",
    description:
      "Friendly and reliable shop attendant needed. No prior experience required. Training provided.",
  },
  {
    id: 5,
    title: "Elderly Caregiver – Germany",
    jobType: "Full-Time (Visa Sponsored)",
    category: "Caregiving",
    location: "Berlin, Germany",
    rate: "€1200/Month",
    deadline: "2025-07-05",
    description:
      "Caring for an elderly person in a home setting. Free accommodation, visa processing assistance provided.",
  },
];

// Format date
const formatDate = (dateString: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const JobsAlerts = () => {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto bg-white shadow-xl rounded-lg p-6">
        <h2 className="text-3xl font-bold text-maroon mb-8">
          Job Opportunities
        </h2>
        <div className="grid gap-6">
          {jobAlerts.map((job) => (
            <div
              key={job.id}
              className="border border-gray-200 rounded-md p-5 hover:shadow-lg transition-all"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-xl font-semibold text-gray-800">
                  {job.title}
                </h3>
                <span className="text-sm font-medium bg-green-600 text-white px-3 py-1 rounded">
                  {job.jobType}
                </span>
              </div>
              <div className="text-sm text-gray-600 mb-3 flex flex-wrap gap-4">
                <span>
                  📍 <strong>Location:</strong> {job.location}
                </span>
                <span>
                  🧰 <strong>Category:</strong> {job.category}
                </span>
                <span>
                  💵 <strong>Rate:</strong> {job.rate}
                </span>
                <span>
                  ⏰ <strong>Deadline:</strong> {formatDate(job.deadline)}
                </span>
              </div>
              <p className="text-gray-700 text-sm mb-4">{job.description}</p>
              <button className="mt-2 bg-green-700 hover:bg-green-800 text-white px-4 py-2 rounded-md transition-colors text-sm font-medium">
                Apply Now
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JobsAlerts;
