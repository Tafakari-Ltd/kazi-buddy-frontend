"use client";
import React from "react";
import { Plus, Trash2 } from "lucide-react";

interface Education {
  school: string;
  degree: string;
  specialization: string;
}

interface EducationListProps {
  education: Education[];
  setEducation: (edu: Education[]) => void;
}

const EducationList: React.FC<EducationListProps> = ({ education, setEducation }) => {
  const handleChange = (index: number, field: keyof Education, value: string) => {
    const updated = [...education];
    updated[index][field] = value;
    setEducation(updated);
  };

  const addEducation = () => {
    setEducation([...education, { school: "", degree: "", specialization: "" }]);
  };

  const removeEducation = (index: number) => {
    const updated = education.filter((_, i) => i !== index);
    setEducation(updated);
  };

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-purple-900 mb-3 flex items-center justify-between">
        <span>Education <span className="text-xs text-gray-500 font-normal ml-2">(Local only)</span></span>
        <button type="button" onClick={addEducation} className="text-xs flex items-center gap-1 text-purple-700 hover:text-purple-900 bg-purple-50 px-2 py-1 rounded">
          <Plus size={14} /> Add
        </button>
      </h3>
      <div className="space-y-3">
        {education.map((edu, index) => (
          <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-start bg-gray-50 p-3 rounded-lg border border-gray-200">
            <div className="md:col-span-4">
              <input 
                type="text" 
                placeholder="School/University" 
                value={edu.school} 
                onChange={(e) => handleChange(index, "school", e.target.value)} 
                className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm" 
              />
            </div>
            <div className="md:col-span-4">
              <input 
                type="text" 
                placeholder="Degree" 
                value={edu.degree} 
                onChange={(e) => handleChange(index, "degree", e.target.value)} 
                className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm" 
              />
            </div>
            <div className="md:col-span-3">
              <input 
                type="text" 
                placeholder="Specialization" 
                value={edu.specialization} 
                onChange={(e) => handleChange(index, "specialization", e.target.value)} 
                className="w-full border border-gray-300 px-3 py-2 rounded-md text-sm" 
              />
            </div>
            <div className="md:col-span-1 flex justify-center">
              {education.length > 1 && (
                <button type="button" onClick={() => removeEducation(index)} className="text-red-500 hover:text-red-700 p-2">
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

export default EducationList;