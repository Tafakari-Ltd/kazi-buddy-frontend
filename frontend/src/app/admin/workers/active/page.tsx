"use client";
import React, { useState } from "react";
import { Eye, Edit, Trash2, Search } from "lucide-react";

import { workersDummy } from "@/component/Homepage/HotJobs/Workers";

const AllWorkersAdministration = () => {
  const [workers, setWorkers] = useState(workersDummy);

  const [search, setSearch] = useState("");

  const filteredWorkers = workers.filter(
    (worker) =>
      worker.name.toLowerCase().includes(search.toLowerCase()) ||
      worker.skills.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen p-6 bg-gray-50">
      <h1 className="text-2xl font-bold mb-6 text-red-800">
        Workers Administration
      </h1>

      {/* Search Bar */}
      <div className="mb-4 relative">
        <Search className="absolute left-3 top-3 text-gray-400" />
        <input
          type="text"
          placeholder="Search by name or skill..."
          className="pl-10 pr-4 py-2 border border-gray-300 w-full rounded-md focus:ring-red-900 focus:outline-none"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Workers Table */}
      <div className="bg-white border border-gray-200 shadow-sm overflow-x-auto">
        <div className="min-w-[800px]">
          <table className="w-full">
            <thead className="bg-red-900 text-white">
              <tr>
                <th className="px-6 py-3 text-left">Name</th>
                <th className="px-6 py-3 text-left">Skill</th>
                <th className="px-6 py-3 text-left">Phone</th>
                <th className="px-6 py-3 text-left">Location</th>
                <th className="px-6 py-3 text-left">Status</th>
                <th className="px-6 py-3 text-left">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredWorkers.map((worker) => (
                <tr key={worker.id}>
                  <td className="px-6 py-4">{worker.name}</td>
                  <td className="px-6 py-4">{worker.skills}</td>
                  <td className="px-6 py-4">{worker.phone}</td>
                  <td className="px-6 py-4">{worker.location}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        worker.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {worker.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <button className="text-blue-600 hover:text-blue-800">
                      <Eye size={16} />
                    </button>
                    <button className="text-green-600 hover:text-green-800">
                      <Edit size={16} />
                    </button>
                    <button className="text-red-600 hover:text-red-800">
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AllWorkersAdministration;
