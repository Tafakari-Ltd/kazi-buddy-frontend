"use client";
import React from "react";
import { Plus, Trash2 } from "lucide-react";

interface Experience {
  company: string;
  role: string;
}

interface ExperienceListProps {
  experience: Experience[];
  setExperience: (exp: Experience[]) => void;
}

const ExperienceList: React.FC<ExperienceListProps> = ({ experience, setExperience }) => {
  const handleChange = (index: number, field: keyof Experience, value: string) => {
    const updated = [...experience];
    updated[index][field] = value;
    setExperience(updated);
  };

  const addExperience = () => {
    setExperience([...experience, { company: "", role: "" }]);
  };

  const removeExperience = (index: number) => {
    const updated = experience.filter((_, i) => i !== index);
    setExperience(updated);
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-purple-900 mb-3 flex items-center justify-between">
        <span>Experience <span className="text-xs text-gray-500 font-normal ml-2">(Local only)</span></span>
        <button type="button" onClick={addExperience} className="text-xs flex items-center gap-1 text-purple-700 hover:text-purple-900 bg-purple-50 px-2 py-1 rounded">
          <Plus size={14} /> Add
        </button>
      </h3>
      <div className="space-y-3">
        {experience.map((exp, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-start bg-gray-50 p-3 rounded-lg border border-gray-200">
            <div className="md:col-span-6">
              <input 
                type="text" 
                placeholder="Company" 
                value={exp.company} 
                onChange={(e) => handleChange(index, "company", e.target.value)} 
                className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm" 
              />
            </div>
            <div className="md:col-span-5">
              <input 
                type="text" 
                placeholder="Role" 
                value={exp.role} 
                onChange={(e) => handleChange(index, "role", e.target.value)} 
                className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm" 
              />
            </div>
            <div className="md:col-span-1 flex justify-center">
              {experience.length > 1 && (
                <button type="button" onClick={() => removeExperience(index)} className="text-red-500 hover:text-red-700 p-2">
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExperienceList;