"use client";
import React, { useEffect, useState } from "react";
import { 
  Clock, 
  CheckCircle, 
  Briefcase, 
  Calendar, 
  DollarSign,
  Eye,
  AlertCircle,
  Search,
  Users,
  MapPin,
  Mail,
  Phone,
  Building
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSelector } from "react-redux";
import { RootState } from "@/Redux/Store/Store";
import { JobApplicationApi } from "@/services/jobApplicationApi";
import { 
  JobApplicationWithDetails, 
  ApplicationStatus,
  ApplicationListResponse 
} from "@/types/jobApplication.types";

const EmployerApplicationsSection = () => {
  const [applications, setApplications] = useState<JobApplicationWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted'>('all');
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedApplication, setSelectedApplication] = useState<JobApplicationWithDetails | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Get current user/employer info
  const { user, userId } = useSelector((state: RootState) => state.auth);
  const currentUserId = userId || user?.user_id || user?.id;
  
  // Get employer profile to filter applications
  const { userProfile: employerProfile } = useSelector((state: RootState) => state.employerProfiles);

  useEffect(() => {
    if (currentUserId && employerProfile?.id) {
      fetchEmployerApplications();
    }
  }, [currentUserId, employerProfile?.id]);

  const fetchEmployerApplications = async () => {
    if (!employerProfile?.id) {
      console.log('EmployerApplicationsSection Debug: Cannot fetch - no employer profile ID');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      // Fetch all applications
      const response: ApplicationListResponse = await JobApplicationApi.getAllApplications({
        ordering: '-applied_at'
      });
      
      console.log('EmployerApplicationsSection Debug: Fetching detailed data for', response.applications.length, 'applications');
      console.log('EmployerApplicationsSection Debug: Current employer profile ID:', employerProfile.id);
      
      const detailedApplications = await Promise.all(
        response.applications.map(async (app) => {
          try {
            const detailResponse = await JobApplicationApi.getApplicationDetails(app.id);
            return detailResponse.application;
          } catch (error) {
            console.warn('Could not fetch details for application', app.id, error);
            return app; 
          }
        })
      );
      
      
      const employerApplications = detailedApplications.filter((app: any) => {
        // Check if the job's employer ID matches the current employer's profile ID
        const jobEmployerId = app.job?.employer?.id || app.job_details?.employer;
        const isMatch = jobEmployerId === employerProfile.id;
        
        if (!isMatch) {
          console.log(`EmployerApplicationsSection Debug: Filtering out application ${app.id} - job employer ${jobEmployerId} doesn't match current employer ${employerProfile.id}`);
        }
        
        return isMatch;
      });
      
      console.log('EmployerApplicationsSection Debug: Filtered applications count (only this employer\'s jobs):', employerApplications.length);
      console.log('EmployerApplicationsSection Debug: Total applications before filtering:', detailedApplications.length);
      
      setApplications(employerApplications as JobApplicationWithDetails[]);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const filteredApplications = applications.filter(app => {
    // Filter by status
    const statusMatch = filter === 'all' || app.status === filter;
    
    // Get worker name from nested structure
    const workerName = (typeof app.worker !== 'string' ? app.worker?.user?.full_name : undefined) || app.worker_details?.full_name || '';
    // Get job title from nested structure
    const jobTitle = (typeof app.job !== 'string' ? app.job?.title : undefined) || app.job_details?.title || '';
    
    // Filter by search query
    const searchMatch = searchQuery === '' || 
      workerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      jobTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.cover_letter?.toLowerCase().includes(searchQuery.toLowerCase());

    return statusMatch && searchMatch;
  });

  const getStatusColor = (status: ApplicationStatus) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'reviewed':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
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
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Job Applications</h2>
          <p className="text-gray-600 mt-1">Applications received for your job postings</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <Clock className="h-8 w-8 text-yellow-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-yellow-800">Pending Review</p>
              <p className="text-2xl font-bold text-yellow-900">{pendingCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <CheckCircle className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-green-800">Accepted</p>
              <p className="text-2xl font-bold text-green-900">{acceptedCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <Users className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm font-medium text-blue-800">Total Applications</p>
              <p className="text-2xl font-bold text-blue-900">{applications.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white rounded-lg border p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search applications..."
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

      {/* Info Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-medium text-blue-900">Application Management</h3>
            <p className="text-blue-800 text-sm mt-1">
              Applications are reviewed by our admin team. You can view details here, but approval decisions are made by administrators to ensure fair and consistent hiring processes.
            </p>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex items-center gap-2">
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
      <div className="space-y-4">
        {filteredApplications.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg border">
            <Users className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No applications found</h3>
            <p className="text-gray-600">
              {searchQuery || filter !== 'all'
                ? 'Try adjusting your search or filter criteria'
                : 'Applications for your job postings will appear here'
              }
            </p>
          </div>
        ) : (
          filteredApplications.map((application) => (
            <div key={application.id} className="bg-white rounded-lg border hover:shadow-sm transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {(typeof application.worker !== 'string' ? application.worker?.user?.full_name : undefined) || application.worker_details?.full_name || 'Unknown Worker'}
                      </h3>
                      <div className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(application.status)}`}>
                        {getStatusIcon(application.status)}
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                      <span className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        {(typeof application.job !== 'string' ? application.job?.title : undefined) || application.job_details?.title || 'Unknown Job'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Applied: {formatDate(application.applied_at)}
                      </span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        Proposed: {formatCurrency(application.proposed_rate)}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Available: {new Date(application.availability_start).toLocaleDateString()}
                      </span>
                      {((typeof application.job !== 'string' ? application.job?.location : undefined) || application.job_details?.location) && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {(typeof application.job !== 'string' ? application.job?.location : undefined) || application.job_details?.location}
                        </span>
                      )}
                      {application.responded_at && (
                        <span className="flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          Responded: {formatDate(application.responded_at)}
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
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">Cover Letter</h4>
                  <p className="text-gray-700 text-sm leading-relaxed line-clamp-2">
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
                    Application from {(typeof selectedApplication.worker !== 'string' ? selectedApplication.worker?.user?.full_name : undefined) || selectedApplication.worker_details?.full_name || 'Unknown Worker'}
                  </h3>
                  <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(selectedApplication.status)}`}>
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
                        {(typeof selectedApplication.job !== 'string' ? selectedApplication.job?.title : undefined) || selectedApplication.job_details?.title || 'Unknown Job'}
                      </h5>
                      <div className="flex items-center gap-4 text-sm text-blue-700">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {(typeof selectedApplication.job !== 'string' ? selectedApplication.job?.location : undefined) || selectedApplication.job_details?.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign className="w-4 h-4" />
                          Budget: {(typeof selectedApplication.job !== 'string' ? selectedApplication.job?.budget_min : undefined) || selectedApplication.job_details?.budget_min} - {(typeof selectedApplication.job !== 'string' ? selectedApplication.job?.budget_max : undefined) || selectedApplication.job_details?.budget_max}
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
                      <p className="font-medium">{(typeof selectedApplication.worker !== 'string' ? selectedApplication.worker?.user?.full_name : undefined) || selectedApplication.worker_details?.full_name || 'Unknown Worker'}</p>
                      <div className="flex items-center gap-1 text-gray-600">
                        <Mail className="w-4 h-4" />
                        {(typeof selectedApplication.worker !== 'string' ? selectedApplication.worker?.user?.email : undefined) || selectedApplication.worker_details?.email || 'N/A'}
                      </div>
                      {(selectedApplication.worker_details?.phone_number) && (
                        <div className="flex items-center gap-1 text-gray-600">
                          <Phone className="w-4 h-4" />
                          {selectedApplication.worker_details.phone_number}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status Notice */}
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                    <h5 className="font-medium text-yellow-900 mb-1">Status Update</h5>
                    <p className="text-yellow-800 text-xs">
                      Application status is managed by our admin team. You'll be notified of any status changes.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default EmployerApplicationsSection;