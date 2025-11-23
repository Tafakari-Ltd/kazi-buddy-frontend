"use client";
import React, { useState } from "react";
import { Check, Dot, Plus, Trash2 } from "lucide-react";

const stages = [
  "Submitted",
  "Resume Screening",
  "Technical Assessment",
  "Oral Interviews",
  "Offer",
];

const initialApplications = [
  {
    id: 1,
    name: "Google",
    position: "Frontend Engineer",
    email: "careers@google.com",
    currentStage: "Technical Assessment",
  },
  {
    id: 2,
    name: "Meta",
    email: "jobs@meta.com",
    position: "Fullstack Developer",
    currentStage: "Resume Screening",
  },
  {
    id: 3,
    name: "Netflix",
    position: "Frontend Engineer",
    email: "careers@netflix.com",
    currentStage: "Technical Assessment",
  },
  {
    id: 5,
    name: "Microsoft",
    email: "microsoft@gmail.com",
    position: "Fullstack Developer",
    currentStage: "Oral Interview",
  },
];

const ApplicationCard = ({
  app,
  onCancel,
}: {
  app: any;
  onCancel: (id: number) => void;
}) => {
  const currentStageIndex = stages.indexOf(app.currentStage);

  return (
    <div className="p-5 bg-white border border-gray-200 rounded-2xl shadow hover:shadow-lg transition duration-200">
      <div className="flex justify-between items-center mb-3">
        <div>
          <h3 className="text-lg font-semibold text-purple-dark">{app.name}</h3>
          <p className="text-sm text-gray-700">
            {app.position} — {app.email}
          </p>
        </div>
        <button
          aria-label="Cancel application"
          onClick={() => onCancel(app.id)}
          className="text-red-500 hover:text-red-700"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <p className="text-xs text-gray-500 mb-2">Application Progress</p>
      <div className="flex items-center justify-between gap-2 mb-2">
        {stages.map((stage, index) => {
          const isCompleted = index < currentStageIndex;
          const isCurrent = index === currentStageIndex;

          return (
            <div key={stage} className="flex flex-col items-center flex-1">
              <div
                className={`w-8 h-8 flex items-center justify-center rounded-full border-2 ${
                  isCompleted
                    ? "bg-green-500 border-green-600 text-white"
                    : isCurrent
                      ? "bg-yellow-100 border-yellow-400 text-yellow-600"
                      : "bg-gray-100 border-gray-300 text-gray-400"
                }`}
              >
                {isCompleted ? (
                  <Check size={18} />
                ) : (
                  <Dot size={18} className={isCurrent ? "" : "opacity-30"} />
                )}
              </div>
              <p className="text-[10px] text-center mt-1 text-gray-600">
                {stage}
              </p>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-purple-dark font-medium">
        Current Stage: {app.currentStage}
      </p>
    </div>
  );
};

const ViewApplications = () => {
  const [applications, setApplications] = useState(initialApplications);
  const [counter, setCounter] = useState(initialApplications.length + 1);

  const handleAdd = () => {
    const newApp = {
      id: counter,
      name: "New Company",
      email: "hr@company.com",
      position: "Software Engineer",
      currentStage: "Submitted",
    };
    setApplications([newApp, ...applications]);
    setCounter(counter + 1);
  };

  const handleCancel = (id: number) => {
    const confirm = window.confirm("Cancel this application?");
    if (confirm) {
      setApplications(applications.filter((app) => app.id !== id));
    }
  };

  return (
    <div className="px-6 py-10  mx-auto">
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-bold text-purple-dark">My Applications</h1>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-maroon text-white text-sm rounded-lg hover:bg-redish transition"
        >
          <Plus size={16} /> Add Application
        </button>
      </div>

      {applications.length === 0 ? (
        <p className="text-center text-gray-500">No applications yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {applications.map((app) => (
            <ApplicationCard key={app.id} app={app} onCancel={handleCancel} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ViewApplications;
