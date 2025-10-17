// "use client";
// import React, { useState, useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   Plus,
//   Edit,
//   Trash2,
//   X,
//   CheckCircle,
//   AlertCircle,
//   Search,
//   Filter,
// } from "lucide-react";
// import { motion, AnimatePresence } from "framer-motion";
// import { toast } from "sonner";

// import { AppDispatch, RootState } from "@/Redux/Store/Store";
// import {
//   listJobSkills,
//   createJobSkill,
//   updateJobSkill,
//   deleteJobSkill,
//   clearSkillsState,
// } from "@/Redux/Features/jobs/jobSkillsSlice";
// import { SKILL_LEVEL_OPTIONS } from "@/types/job.types";

// interface JobSkillsManagerProps {
//   jobId?: string;
//   readonly?: boolean;
// }

// const JobSkillsManager: React.FC<JobSkillsManagerProps> = ({
//   jobId,
//   readonly = false,
// }) => {
//   const dispatch = useDispatch<AppDispatch>();
//   const { skills, loading, error, successMessage } = useSelector(
//     (state: RootState) => state.jobSkills
//   );

//   // Local state
//   const [showCreateModal, setShowCreateModal] = useState(false);
//   const [showEditModal, setShowEditModal] = useState(false);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [selectedSkill, setSelectedSkill] = useState<any>(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [filterRequired, setFilterRequired] = useState<"all" | "required" | "optional">("all");
//   const [filterLevel, setFilterLevel] = useState<string>("all");

//   // Form state
//   const [formData, setFormData] = useState({
//     skill: "",
//     is_required: true,
//     experience_level: "intermediate",
//   });

//   const [formErrors, setFormErrors] = useState<Record<string, string>>({});

//   // Load skills on component mount
//   useEffect(() => {
//     dispatch(listJobSkills());
//   }, [dispatch]);

//   // Handle success messages
//   useEffect(() => {
//     if (successMessage) {
//       toast.success(successMessage);
//       dispatch(clearSkillsState());
//       setShowCreateModal(false);
//       setShowEditModal(false);
//       setShowDeleteModal(false);
//       resetForm();
//     }
//   }, [successMessage, dispatch]);

//   // Handle errors
//   useEffect(() => {
//     if (error) {
//       toast.error(error);
//       dispatch(clearSkillsState());
//     }
//   }, [error, dispatch]);

//   const resetForm = () => {
//     setFormData({
//       skill: "",
//       is_required: true,
//       experience_level: "intermediate",
//     });
//     setFormErrors({});
//     setSelectedSkill(null);
//   };

//   const validateForm = () => {
//     const errors: Record<string, string> = {};
    
//     if (!formData.skill.trim()) {
//       errors.skill = "Skill name is required";
//     }
    
//     if (!formData.experience_level) {
//       errors.experience_level = "Experience level is required";
//     }

//     setFormErrors(errors);
//     return Object.keys(errors).length === 0;
//   };

//   const handleCreateSkill = async () => {
//     if (!validateForm() || !jobId) return;

//     const result = await dispatch(
//       createJobSkill({
//         jobId,
//         skill: formData.skill.trim(),
//         is_required: formData.is_required,
//         experience_level: formData.experience_level,
//       })
//     );

//     if (createJobSkill.fulfilled.match(result)) {
//       // Success handling is done in useEffect
//     }
//   };

//   const handleUpdateSkill = async () => {
//     if (!validateForm() || !selectedSkill) return;

//     const result = await dispatch(
//       updateJobSkill({
//         skillId: selectedSkill.id,
//         experience_level: formData.experience_level,
//         is_required: formData.is_required,
//       })
//     );

//     if (updateJobSkill.fulfilled.match(result)) {
//       // Success handling is done in useEffect
//     }
//   };

//   const handleDeleteSkill = async () => {
//     if (!selectedSkill) return;

//     const result = await dispatch(deleteJobSkill(selectedSkill.id));

//     if (deleteJobSkill.fulfilled.match(result)) {
//       // Success handling is done in useEffect
//     }
//   };

//   const openEditModal = (skill: any) => {
//     setSelectedSkill(skill);
//     setFormData({
//       skill: skill.skill || skill.skill_name,
//       is_required: skill.is_required,
//       experience_level: skill.experience_level || skill.required_level,
//     });
//     setShowEditModal(true);
//   };

//   const openDeleteModal = (skill: any) => {
//     setSelectedSkill(skill);
//     setShowDeleteModal(true);
//   };

//   // Filter skills
//   const filteredSkills = skills.filter((skill) => {
//     const matchesSearch = (skill.skill || skill.skill_name || "")
//       .toLowerCase()
//       .includes(searchTerm.toLowerCase());
    
//     const matchesRequired =
//       filterRequired === "all" ||
//       (filterRequired === "required" && skill.is_required) ||
//       (filterRequired === "optional" && !skill.is_required);
    
//     const matchesLevel =
//       filterLevel === "all" ||
//       (skill.experience_level || skill.required_level) === filterLevel;

//     return matchesSearch && matchesRequired && matchesLevel;
//   });

//   const getExperienceLevelColor = (level: string) => {
//     switch (level) {
//       case "beginner":
//         return "bg-green-100 text-green-800";
//       case "intermediate":
//         return "bg-blue-100 text-blue-800";
//       case "advanced":
//         return "bg-purple-100 text-purple-800";
//       case "expert":
//         return "bg-red-100 text-red-800";
//       default:
//         return "bg-gray-100 text-gray-800";
//     }
//   };

//   return (
//     <div className="space-y-6">
//       {/* Header */}
//       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//         <div>
//           <h2 className="text-2xl font-bold text-gray-900">Job Skills</h2>
//           <p className="text-gray-600">Manage required skills for this position</p>
//         </div>
        
//         {!readonly && jobId && (
//           <button
//             onClick={() => setShowCreateModal(true)}
//             className="flex items-center gap-2 bg-red-800 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
//           >
//             <Plus className="w-4 h-4" />
//             Add Skill
//           </button>
//         )}
//       </div>

//       {/* Filters */}
//       <div className="flex flex-col sm:flex-row gap-4">
//         <div className="relative flex-1">
//           <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
//           <input
//             type="text"
//             placeholder="Search skills..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-800"
//           />
//         </div>
        
//         <select
//           value={filterRequired}
//           onChange={(e) => setFilterRequired(e.target.value as any)}
//           className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-800"
//         >
//           <option value="all">All Skills</option>
//           <option value="required">Required Only</option>
//           <option value="optional">Optional Only</option>
//         </select>
        
//         <select
//           value={filterLevel}
//           onChange={(e) => setFilterLevel(e.target.value)}
//           className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-800"
//         >
//           <option value="all">All Levels</option>
//           {SKILL_LEVEL_OPTIONS.map((level) => (
//             <option key={level.value} value={level.value}>
//               {level.label}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* Skills List */}
//       <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
//         {loading ? (
//           <div className="p-8 text-center">
//             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-800 mx-auto"></div>
//             <p className="text-gray-600 mt-2">Loading skills...</p>
//           </div>
//         ) : filteredSkills.length === 0 ? (
//           <div className="p-8 text-center">
//             <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
//             <p className="text-gray-600">
//               {searchTerm || filterRequired !== "all" || filterLevel !== "all"
//                 ? "No skills match your filters"
//                 : "No skills added yet"}
//             </p>
//             {!readonly && jobId && searchTerm === "" && filterRequired === "all" && filterLevel === "all" && (
//               <button
//                 onClick={() => setShowCreateModal(true)}
//                 className="mt-4 text-red-800 hover:text-red-700 font-medium"
//               >
//                 Add your first skill
//               </button>
//             )}
//           </div>
//         ) : (
//           <div className="divide-y divide-gray-200">
//             {filteredSkills.map((skill, index) => (
//               <motion.div
//                 key={skill.id}
//                 initial={{ opacity: 0, y: 20 }}
//                 animate={{ opacity: 1, y: 0 }}
//                 transition={{ delay: index * 0.05 }}
//                 className="p-4 hover:bg-gray-50 transition-colors"
//               >
//                 <div className="flex items-center justify-between">
//                   <div className="flex-1">
//                     <div className="flex items-center gap-3">
//                       <h3 className="font-semibold text-gray-900">
//                         {skill.skill || skill.skill_name}
//                       </h3>
//                       <span
//                         className={`px-2 py-1 rounded-full text-xs font-medium ${getExperienceLevelColor(
//                           skill.experience_level || skill.required_level
//                         )}`}
//                       >
//                         {SKILL_LEVEL_OPTIONS.find(
//                           (opt) => opt.value === (skill.experience_level || skill.required_level)
//                         )?.label || (skill.experience_level || skill.required_level)}
//                       </span>
//                       {skill.is_required && (
//                         <span className="flex items-center gap-1 text-xs text-green-700">
//                           <CheckCircle className="w-3 h-3" />
//                           Required
//                         </span>
//                       )}
//                     </div>
//                   </div>
                  
//                   {!readonly && (
//                     <div className="flex items-center gap-2">
//                       <button
//                         onClick={() => openEditModal(skill)}
//                         className="p-1 text-gray-600 hover:text-blue-600 rounded"
//                         title="Edit skill"
//                       >
//                         <Edit className="w-4 h-4" />
//                       </button>
//                       <button
//                         onClick={() => openDeleteModal(skill)}
//                         className="p-1 text-gray-600 hover:text-red-600 rounded"
//                         title="Delete skill"
//                       >
//                         <Trash2 className="w-4 h-4" />
//                       </button>
//                     </div>
//                   )}
//                 </div>
//               </motion.div>
//             ))}
//           </div>
//         )}
//       </div>

//       {/* Create/Edit Modal */}
//       <AnimatePresence>
//         {(showCreateModal || showEditModal) && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
//           >
//             <motion.div
//               initial={{ scale: 0.9, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0.9, opacity: 0 }}
//               className="bg-white rounded-lg w-full max-w-md"
//             >
//               <div className="p-6 border-b">
//                 <div className="flex items-center justify-between">
//                   <h3 className="text-lg font-semibold text-gray-900">
//                     {showCreateModal ? "Add New Skill" : "Edit Skill"}
//                   </h3>
//                   <button
//                     onClick={() => {
//                       setShowCreateModal(false);
//                       setShowEditModal(false);
//                       resetForm();
//                     }}
//                     className="text-gray-400 hover:text-gray-600"
//                   >
//                     <X className="w-5 h-5" />
//                   </button>
//                 </div>
//               </div>

//               <div className="p-6 space-y-4">
//                 {/* Skill Name */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Skill Name *
//                   </label>
//                   <input
//                     type="text"
//                     value={formData.skill}
//                     onChange={(e) =>
//                       setFormData({ ...formData, skill: e.target.value })
//                     }
//                     disabled={showEditModal} // Can't edit skill name
//                     className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-800 ${
//                       formErrors.skill ? "border-red-500" : "border-gray-300"
//                     } ${showEditModal ? "bg-gray-100" : ""}`}
//                     placeholder="e.g., JavaScript, Python, Project Management"
//                   />
//                   {formErrors.skill && (
//                     <p className="text-xs text-red-600 mt-1">{formErrors.skill}</p>
//                   )}
//                 </div>

//                 {/* Experience Level */}
//                 <div>
//                   <label className="block text-sm font-medium text-gray-700 mb-1">
//                     Experience Level *
//                   </label>
//                   <select
//                     value={formData.experience_level}
//                     onChange={(e) =>
//                       setFormData({ ...formData, experience_level: e.target.value })
//                     }
//                     className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-800 focus:border-red-800 ${
//                       formErrors.experience_level ? "border-red-500" : "border-gray-300"
//                     }`}
//                   >
//                     {SKILL_LEVEL_OPTIONS.map((level) => (
//                       <option key={level.value} value={level.value}>
//                         {level.label}
//                       </option>
//                     ))}
//                   </select>
//                   {formErrors.experience_level && (
//                     <p className="text-xs text-red-600 mt-1">{formErrors.experience_level}</p>
//                   )}
//                 </div>

//                 {/* Is Required */}
//                 <div className="flex items-center">
//                   <input
//                     type="checkbox"
//                     id="is_required"
//                     checked={formData.is_required}
//                     onChange={(e) =>
//                       setFormData({ ...formData, is_required: e.target.checked })
//                     }
//                     className="h-4 w-4 text-red-800 focus:ring-red-800 border-gray-300 rounded"
//                   />
//                   <label htmlFor="is_required" className="ml-2 text-sm text-gray-700">
//                     This skill is required for the job
//                   </label>
//                 </div>
//               </div>

//               <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
//                 <button
//                   onClick={() => {
//                     setShowCreateModal(false);
//                     setShowEditModal(false);
//                     resetForm();
//                   }}
//                   className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
//                 >
//                   Cancel
//                 </button>
//                 <button
//                   onClick={showCreateModal ? handleCreateSkill : handleUpdateSkill}
//                   disabled={loading}
//                   className="px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
//                 >
//                   {loading ? "Saving..." : showCreateModal ? "Add Skill" : "Update Skill"}
//                 </button>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Delete Confirmation Modal */}
//       <AnimatePresence>
//         {showDeleteModal && selectedSkill && (
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
//           >
//             <motion.div
//               initial={{ scale: 0.9, opacity: 0 }}
//               animate={{ scale: 1, opacity: 1 }}
//               exit={{ scale: 0.9, opacity: 0 }}
//               className="bg-white rounded-lg w-full max-w-sm"
//             >
//               <div className="p-6">
//                 <div className="text-center">
//                   <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
//                   <h3 className="text-lg font-semibold text-gray-900 mb-2">
//                     Delete Skill
//                   </h3>
//                   <p className="text-gray-600 mb-6">
//                     Are you sure you want to delete "{selectedSkill.skill || selectedSkill.skill_name}"? 
//                     This action cannot be undone.
//                   </p>
//                 </div>

//                 <div className="flex justify-end gap-3">
//                   <button
//                     onClick={() => {
//                       setShowDeleteModal(false);
//                       setSelectedSkill(null);
//                     }}
//                     className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
//                   >
//                     Cancel
//                   </button>
//                   <button
//                     onClick={handleDeleteSkill}
//                     disabled={loading}
//                     className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
//                   >
//                     {loading ? "Deleting..." : "Delete"}
//                   </button>
//                 </div>
//               </div>
//             </motion.div>
//           </motion.div>
//         )}
//       </AnimatePresence>
//     </div>
//   );
// };

// export default JobSkillsManager;