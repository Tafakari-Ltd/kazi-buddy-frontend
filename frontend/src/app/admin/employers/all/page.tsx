"use client";
import React, { useState } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Phone,
  Mail,
  MapPin,
  Building,
} from "lucide-react";


const AllEmployersAdministration = () => {

  const [employers, setEmployers] = useState([
    {
      id: 1,
      name: "Tech Solutions Inc.",
      email: "contact@techsolutions.com",
      phone: "+1-555-0123",
      address: "123 Innovation Drive, Silicon Valley, CA",
      industry: "Technology",
      employees: 150,
      status: "Active",
    },
    {
      id: 2,
      name: "Global Manufacturing Corp",
      email: "hr@globalmfg.com",
      phone: "+1-555-0456",
      address: "456 Industrial Blvd, Detroit, MI",
      industry: "Manufacturing",
      employees: 500,
      status: "Active",
    },
    {
      id: 3,
      name: "Healthcare Partners",
      email: "admin@healthpartners.org",
      phone: "+1-555-0789",
      address: "789 Medical Center Dr, Houston, TX",
      industry: "Healthcare",
      employees: 75,
      status: "Inactive",
    },
    {
      id: 4,
      name: "Tech Solutions Inc.",
      email: "contact@techsolutions.com",
      phone: "+1-555-0123",
      address: "123 Innovation Drive, Silicon Valley, CA",
      industry: "Technology",
      employees: 150,
      status: "Active",
    },
    {
      id: 5,
      name: "Global Manufacturing Corp",
      email: "hr@globalmfg.com",
      phone: "+1-555-0456",
      address: "456 Industrial Blvd, Detroit, MI",
      industry: "Manufacturing",
      employees: 500,
      status: "Active",
    },
    {
      id: 6,
      name: "Healthcare Partners",
      email: "admin@healthpartners.org",
      phone: "+1-555-0789",
      address: "789 Medical Center Dr, Houston, TX",
      industry: "Healthcare",
      employees: 75,
      status: "Inactive",
    },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'add', 'edit', 'view'
  const [selectedEmployer, setSelectedEmployer] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    industry: "",
    employees: "",
    status: "Active",
  });

  const filteredEmployers = employers.filter(
    (employer) =>
      employer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employer.industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const openModal = (mode, employer = null) => {
    setModalMode(mode);
    setSelectedEmployer(employer);
    if (employer) {
      setFormData(employer);
    } else {
      setFormData({
        name: "",
        email: "",
        phone: "",
        address: "",
        industry: "",
        employees: "",
        status: "Active",
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedEmployer(null);
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      industry: "",
      employees: "",
      status: "Active",
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (modalMode === "add") {
      const newEmployer = {
        ...formData,
        id: Math.max(...employers.map((e) => e.id)) + 1,
        employees: parseInt(formData.employees),
      };
      setEmployers([...employers, newEmployer]);
    } else if (modalMode === "edit") {
      setEmployers(
        employers.map((emp) =>
          emp.id === selectedEmployer.id
            ? {
                ...formData,
                id: selectedEmployer.id,
                employees: parseInt(formData.employees),
              }
            : emp
        )
      );
    }
    closeModal();
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this employer?")) {
      setEmployers(employers.filter((emp) => emp.id !== id));
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto">
        {/* Header */}
        <div className="bg-white   border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h1 className="text-xl font-bold text-gray-800">
              Employers Administration
            </h1>
            <button
              onClick={() => openModal("add")}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 flex items-center gap-2 transition-colors rounded"
            >
              <Plus size={20} />
              Add Employer
            </button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={20}
            />
            <input
              type="text"
              placeholder="Search employers by name, email, or industry..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300  focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent"
            />
          </div>
        </div>

        {/* Employers Table */}
        <div className="bg-white shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-red-900 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">
                    Company Name
                  </th>
                  <th className="px-6 py-4 text-left font-semibold">
                    Contact Info
                  </th>
                  <th className="px-6 py-4 text-left font-semibold">
                    Industry
                  </th>
                  <th className="px-6 py-4 text-left font-semibold">
                    Employees
                  </th>
                  <th className="px-6 py-4 text-left font-semibold">Status</th>
                  <th className="px-6 py-4 text-left font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredEmployers.map((employer, index) => (
                  <tr
                    key={employer.id}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Building className="text-red-900" size={20} />
                        <span className="font-medium text-gray-900">
                          {employer.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Mail size={14} />
                          {employer.email}
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Phone size={14} />
                          {employer.phone}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {employer.industry}
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {employer.employees}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          employer.status === "Active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {employer.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => openModal("view", employer)}
                          className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors"
                          title="View Details"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => openModal("edit", employer)}
                          className="text-green-600 hover:text-green-800 p-1 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(employer.id)}
                          className="text-red-600 hover:text-red-800 p-1 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredEmployers.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Building size={48} className="mx-auto mb-4 text-gray-300" />
                <p className="text-lg">No employers found</p>
                <p className="text-sm">Try adjusting your search criteria</p>
              </div>
            )}
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/40 bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-2xl font-bold text-gray-800">
                  {modalMode === "add" && "Add New Employer"}
                  {modalMode === "edit" && "Edit Employer"}
                  {modalMode === "view" && "Employer Details"}
                </h2>
              </div>

              <div className="p-6">
                {modalMode === "view" ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Company Name
                        </label>
                        <p className="text-gray-900 bg-gray-50 p-2 rounded">
                          {selectedEmployer?.name}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Industry
                        </label>
                        <p className="text-gray-900 bg-gray-50 p-2 rounded">
                          {selectedEmployer?.industry}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email
                        </label>
                        <p className="text-gray-900 bg-gray-50 p-2 rounded">
                          {selectedEmployer?.email}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number
                        </label>
                        <p className="text-gray-900 bg-gray-50 p-2 rounded">
                          {selectedEmployer?.phone}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Number of Employees
                        </label>
                        <p className="text-gray-900 bg-gray-50 p-2 rounded">
                          {selectedEmployer?.employees}
                        </p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status
                        </label>
                        <p className="text-gray-900 bg-gray-50 p-2 rounded">
                          {selectedEmployer?.status}
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address
                      </label>
                      <p className="text-gray-900 bg-gray-50 p-2 rounded">
                        {selectedEmployer?.address}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Company Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Industry *
                        </label>
                        <input
                          type="text"
                          name="industry"
                          value={formData.industry}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email *
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Phone Number *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Number of Employees *
                        </label>
                        <input
                          type="number"
                          name="employees"
                          value={formData.employees}
                          onChange={handleInputChange}
                          min="1"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Status *
                        </label>
                        <select
                          name="status"
                          value={formData.status}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent"
                        >
                          <option value="Active">Active</option>
                          <option value="Inactive">Inactive</option>
                        </select>
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Address *
                      </label>
                      <textarea
                        name="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-900 focus:border-transparent"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  {modalMode === "view" ? "Close" : "Cancel"}
                </button>
                {modalMode !== "view" && (
                  <button
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
                  >
                    {modalMode === "add" ? "Add Employer" : "Save Changes"}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AllEmployersAdministration;
