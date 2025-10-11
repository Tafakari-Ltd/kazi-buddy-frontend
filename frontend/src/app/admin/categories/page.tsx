"use client";
import React, { useEffect, useState } from "react";
import { useCategories } from "@/Redux/Functions/useCategories";
import { Plus, Edit2, Trash2, Eye, AlertCircle, Save, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CategoriesPage = () => {
  const {
    categories,
    loading,
    error,
    successMessage,
    handleFetchCategories,
    handleDeleteCategory,
    handleUpdateCategory,
    handleClearState,
  } = useCategories();

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [categoryToView, setCategoryToView] = useState<any>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<any>(null);
  const [editFormData, setEditFormData] = useState({ name: "", description: "" });
  const [editFormErrors, setEditFormErrors] = useState({ name: "", description: "" });

  useEffect(() => {
    handleFetchCategories();
  }, []);

  useEffect(() => {
    if (successMessage) {
      setTimeout(() => {
        handleClearState();
      }, 3000);
    }
  }, [successMessage, handleClearState]);

  const handleDeleteClick = (categoryId: string) => {
    setCategoryToDelete(categoryId);
    setShowDeleteModal(true);
  };

  const handleViewClick = (category: any) => {
    setCategoryToView(category);
    setShowViewModal(true);
  };

  const handleEditClick = (category: any) => {
    setCategoryToEdit(category);
    setEditFormData({ name: category.name, description: category.description });
    setEditFormErrors({ name: "", description: "" });
    setShowEditModal(true);
  };

  const validateEditForm = () => {
    const errors = { name: "", description: "" };

    if (!editFormData.name.trim()) {
      errors.name = "Category name is required";
    } else if (editFormData.name.length < 2) {
      errors.name = "Category name must be at least 2 characters";
    }

    if (!editFormData.description.trim()) {
      errors.description = "Description is required";
    } else if (editFormData.description.length < 10) {
      errors.description = "Description must be at least 10 characters";
    }

    setEditFormErrors(errors);
    return !errors.name && !errors.description;
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateEditForm()) {
      return;
    }

    await handleUpdateCategory(categoryToEdit.id, editFormData.name, editFormData.description);
    setShowEditModal(false);
    handleFetchCategories(); // Refresh the list
  };

  const handleEditInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));

    // Clear specific field error when user starts typing
    if (editFormErrors[name as keyof typeof editFormErrors]) {
      setEditFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const confirmDelete = async () => {
    if (categoryToDelete) {
      await handleDeleteCategory(categoryToDelete);
      setShowDeleteModal(false);
      setCategoryToDelete(null);
      handleFetchCategories(); // Refresh the list
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories Management</h1>
          <p className="text-gray-600 mt-2">Manage job categories and their details</p>
        </div>
        <a
          href="/admin/categories/create"
          className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Category
        </a>
      </div>

      {/* Success Message */}
      <AnimatePresence>
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6"
          >
            {successMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading categories...</p>
        </div>
      )}

      {/* Categories List */}
      {!loading && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 text-center text-gray-500">
                      No categories available. Create your first category to get started.
                    </td>
                  </tr>
                ) : (
                  categories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{category.name}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-500 max-w-xs truncate">
                          {category.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewClick(category)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleEditClick(category)}
                            className="text-yellow-600 hover:text-yellow-900 p-1 rounded"
                            title="Edit Category"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(category.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded"
                            title="Delete Category"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl border border-gray-100 p-6 max-w-md w-full"
            >
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Confirm Delete</h3>
                <p className="text-gray-600 mb-6 text-sm">
                  Are you sure you want to delete this category? This action cannot be undone and may affect related jobs.
                </p>
              </div>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-6 py-2.5 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 transition-all shadow-lg font-medium"
                >
                  Delete Category
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Details Modal */}
      <AnimatePresence>
        {showViewModal && categoryToView && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl border border-gray-100 p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            >
              <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-200">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    Category Details
                  </h3>
                  <p className="text-sm text-gray-500">View complete category information</p>
                </div>
                <button
                  onClick={() => setShowViewModal(false)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    Category Name
                  </label>
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 p-4 rounded-lg">
                    <p className="text-xl font-bold text-gray-900">
                      {categoryToView.name}
                    </p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    Description
                  </label>
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-4 rounded-lg max-h-48 overflow-y-auto">
                    <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-sm">
                      {categoryToView.description}
                    </p>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                    Category ID
                  </label>
                  <div className="bg-gradient-to-r from-gray-50 to-slate-50 border border-gray-200 p-3 rounded-lg">
                    <p className="text-sm text-gray-600 font-mono break-all">
                      {categoryToView.id}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex gap-3 justify-end mt-8 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowViewModal(false)}
                  className="px-6 py-2.5 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    handleEditClick(categoryToView);
                  }}
                  className="px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:from-red-700 hover:to-red-800 inline-flex items-center gap-2 transition-all shadow-lg font-medium"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Category
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Category Modal */}
      <AnimatePresence>
        {showEditModal && categoryToEdit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-2xl border border-gray-100 p-6 max-w-2xl w-full max-h-[85vh] overflow-y-auto"
            >
              <div className="flex justify-between items-start mb-6 pb-4 border-b border-gray-200">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-1">
                    Edit Category
                  </h3>
                  <p className="text-sm text-gray-500">Update category information</p>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleEditSubmit} className="space-y-6">
                {/* Category Name */}
                <div>
                  <label
                    htmlFor="edit-name"
                    className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide"
                  >
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="edit-name"
                      name="name"
                      value={editFormData.name}
                      onChange={handleEditInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all ${
                        editFormErrors.name
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      placeholder="Enter category name"
                    />
                  </div>
                  {editFormErrors.name && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {editFormErrors.name}
                    </p>
                  )}
                </div>

                {/* Category Description */}
                <div>
                  <label
                    htmlFor="edit-description"
                    className="block text-sm font-semibold text-gray-700 mb-2 uppercase tracking-wide"
                  >
                    Description <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <textarea
                      id="edit-description"
                      name="description"
                      rows={4}
                      value={editFormData.description}
                      onChange={handleEditInputChange}
                      className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all resize-none ${
                        editFormErrors.description
                          ? "border-red-300 bg-red-50"
                          : "border-gray-200 hover:border-gray-300"
                      }`}
                      placeholder="Enter a detailed description of this category..."
                    />
                  </div>
                  {editFormErrors.description && (
                    <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="w-4 h-4" />
                      {editFormErrors.description}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 justify-end pt-6 mt-8 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="px-6 py-2.5 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:opacity-50 text-white px-6 py-2.5 rounded-lg transition-all shadow-lg font-medium"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {loading ? "Updating..." : "Update Category"}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CategoriesPage;