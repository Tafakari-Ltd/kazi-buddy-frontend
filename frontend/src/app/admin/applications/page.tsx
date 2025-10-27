"use client";
import React, { useEffect, useState } from "react";
import { 
  CheckCircle, 
  Clock, 
  User, 
  Briefcase, 
  Calendar, 
  Mail, 
  Phone, 
  DollarSign,
  Eye,
  AlertCircle,
  Filter,
  Search,
  Users,
  Building,
  MapPin
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { JobApplicationApi } from "@/services/jobApplicationApi";
import { 
  JobApplicationWithDetails, 
  ApplicationStatus,
  ApplicationListResponse 
} from "@/types/jobApplication.types";

const AdminApplicationsPage = () => {
  const [applications, setApplications] = useState<JobApplicationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted'>('all');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApplication, setSelectedApplication] = useState<JobApplicationWithDetails | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      const response: ApplicationListResponse = await JobApplicationApi.getAllApplications({
        ordering: '-applied_at'
      });
      setApplications(response.applications as JobApplicationWithDetails[]);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptApplication = async (applicationId: string) => {
    try {
      setProcessingIds(prev => new Set([...prev, applicationId]));
      
      await JobApplicationApi.updateApplication(applicationId, {
        status: 'accepted'
      });

      // Update local state
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: 'accepted', responded_at: new Date().toISOString() }
            : app
        )
      );

      // Show success message (you can add toast here)
      console.log('Application accepted successfully');
      
    } catch (err: any) {
      setError(err.message || 'Failed to accept application');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(applicationId);
        return newSet;
      });
    }
  };

  const handleRejectApplication = async (applicationId: string) => {
    try {
      setProcessingIds(prev => new Set([...prev, applicationId]));
      
      await JobApplicationApi.updateApplication(applicationId, {
        status: 'rejected'
      });

      // Update local state
      setApplications(prev => 
        prev.map(app => 
          app.id === applicationId 
            ? { ...app, status: 'rejected', responded_at: new Date().toISOString() }
            : app
        )
      );

      console.log('Application rejected successfully');
      
    } catch (err: any) {
      setError(err.message || 'Failed to reject application');
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(applicationId);
        return newSet;
      });
    }
  };
  };

  const filteredApplications = applications.filter(app => {
    // Filter by status
    const statusMatch = filter === 'all' || app.status === filter;
    
    // Get values from nested structure
    const workerName = app.worker?.user?.full_name || app.worker_details?.full_name || '';
    const jobTitle = app.job?.title || app.job_details?.title || '';
    const companyName = app.job?.employer?.company_name || app.employer_details?.company_name || '';
    
    // Filter by search query
    const searchMatch = searchQuery === '' || 
      workerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      companyName.toLowerCase().includes(searchQuery.toLowerCase());

    return statusMatch && searchMatch;
  });

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: ApplicationStatus) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4" />;
      case 'accepted':
        return <CheckCircle className="w-4 h-4" />;
      case 'rejected':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(parseFloat(amount));
  };

  const pendingCount = applications.filter(app => app.status === 'pending').length;
  const acceptedCount = applications.filter(app => app.status === 'accepted').length;

  if (loading) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="grid grid-cols-1 gap-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Job Applications Management</h1>
        <p className="text-gray-600 mt-2">Review and manage all job applications</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Pending Applications</p>
              <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Accepted Applications</p>
              <p className="text-2xl font-bold text-gray-900">{acceptedCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Users className="h-8 w-8 text-blue-600" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Applications</p>
              <p className="text-2xl font-bold text-gray-900">{applications.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm border p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search by worker name, job title, or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
            />
          </div>

          {/* Status Filter */}
          <div className="flex gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === 'all'
                  ? 'bg-red-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              All ({applications.length})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === 'pending'
                  ? 'bg-yellow-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              onClick={() => setFilter('accepted')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                filter === 'accepted'
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              Accepted ({acceptedCount})
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          {error}
          <button
            onClick={() => setError(null)}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {/* Applications List */}
      <div className="space-y-6">
        {filteredApplications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border">
            <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
            <p className="text-gray-600">
              {searchQuery || filter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Applications will appear here when workers apply for jobs'
              }
            </p>
          </div>
        ) : (
          filteredApplications.map((application) => (
            <div key={application.id} className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {application.worker?.user?.full_name || application.worker_details?.full_name || 'Unknown Worker'}
                      </h3>
                      <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(application.status)}`}>
                        {getStatusIcon(application.status)}
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        {application.job?.title || application.job_details?.title || 'Unknown Job'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Building className="w-4 h-4" />
                        {application.job?.employer?.company_name || application.employer_details?.company_name || 'Unknown Company'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Applied: {formatDate(application.applied_at)}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        Proposed: {formatCurrency(application.proposed_rate)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Available: {new Date(application.availability_start).toLocaleDateString()}
                      </span>
                      {(application.job?.location || application.job_details?.location) && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {application.job?.location || application.job_details?.location}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => {
                        setSelectedApplication(application);
                        setShowModal(true);
                      }}
                      className="text-blue-600 hover:text-blue-800 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                      title="View Details"
                    >
                      <Eye className="w-4 h-4" />
                    </button>

                    {application.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleAcceptApplication(application.id)}
                          disabled={processingIds.has(application.id)}
                          className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        >
                          {processingIds.has(application.id) ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                          Accept
                        </button>
                        <button
                          onClick={() => handleRejectApplication(application.id)}
                          disabled={processingIds.has(application.id)}
                          className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        >
                          {processingIds.has(application.id) ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <AlertCircle className="w-4 h-4" />
                          )}
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Cover Letter</h4>
                  <p className="text-gray-700 text-sm leading-relaxed line-clamp-3">
                    {application.cover_letter}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Application Detail Modal */}
      <AnimatePresence>
        {showModal && selectedApplication && (
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
              className="bg-white rounded-xl shadow-2xl border max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-start p-6 border-b">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    Application from {selectedApplication.worker?.user?.full_name || selectedApplication.worker_details?.full_name || 'Unknown Worker'}
                  </h3>
                  <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedApplication.status)}`}>
                    {getStatusIcon(selectedApplication.status)}
                    {selectedApplication.status.charAt(0).toUpperCase() + selectedApplication.status.slice(1)}
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-full transition-colors"
                >
                  ×
                </button>
              </div>

              <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Cover Letter</h4>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {selectedApplication.cover_letter}
                      </p>
                    </div>
                  </div>

                  {selectedApplication.worker_notes && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">Additional Notes</h4>
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-gray-700 leading-relaxed">
                          {selectedApplication.worker_notes}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Job Details */}
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Job Details</h4>
                    <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                      <h5 className="font-medium text-blue-900 mb-2">
                        {selectedApplication.job_details?.title}
                      </h5>
                      <p className="text-blue-800 text-sm mb-2">
                        {selectedApplication.employer_details?.company_name}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-blue-700">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {selectedApplication.job_details?.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          {selectedApplication.job_details?.budget_min} - {selectedApplication.job_details?.budget_max}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Application Info</h4>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Proposed Rate:</span>
                        <span className="font-medium">{formatCurrency(selectedApplication.proposed_rate)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Available From:</span>
                        <span className="font-medium">
                          {new Date(selectedApplication.availability_start).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Applied:</span>
                        <span className="font-medium">{formatDate(selectedApplication.applied_at)}</span>
                      </div>
                      {selectedApplication.responded_at && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Responded:</span>
                          <span className="font-medium">{formatDate(selectedApplication.responded_at)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-semibold text-gray-900 mb-3">Worker Info</h4>
                    <div className="space-y-2 text-sm">
                      <p className="font-medium">{selectedApplication.worker_details?.full_name}</p>
                      <div className="flex items-center gap-1 text-gray-600">
                        <Mail className="w-4 h-4" />
                        {selectedApplication.worker_details?.email}
                      </div>
                      {selectedApplication.worker_details?.phone_number && (
                        <div className="flex items-center gap-1 text-gray-600">
                          <Phone className="w-4 h-4" />
                          {selectedApplication.worker_details.phone_number}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {selectedApplication.status === 'pending' && (
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          handleAcceptApplication(selectedApplication.id);
                          setShowModal(false);
                        }}
                        disabled={processingIds.has(selectedApplication.id)}
                        className="w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Accept Application
                      </button>
                      <button
                        onClick={() => {
                          handleRejectApplication(selectedApplication.id);
                          setShowModal(false);
                        }}
                        disabled={processingIds.has(selectedApplication.id)}
                        className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                      >
                        <AlertCircle className="w-4 h-4" />
                        Reject Application
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminApplicationsPage;