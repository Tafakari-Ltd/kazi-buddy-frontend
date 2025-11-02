"use client";
import React, { useEffect, useState } from "react";
import { 
  CheckCircle, 
  AlertCircle, 
  Clock,
  X,
  Briefcase,
  Building,
  Calendar,
  DollarSign,
  Bell
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

interface NotificationItem {
  id: string;
  type: 'accepted' | 'rejected' | 'updated';
  application: JobApplicationWithDetails;
  timestamp: string;
  read: boolean;
}

const ApplicationNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(false);

  // Get current user info
  const { user, userId } = useSelector((state: RootState) => state.auth);
  const currentUserId = userId || user?.user_id || user?.id;

  useEffect(() => {
    if (currentUserId) {
      fetchApplicationUpdates();
      
      const interval = setInterval(fetchApplicationUpdates, 30000);
      return () => clearInterval(interval);
    }
  }, [currentUserId]);

  const fetchApplicationUpdates = async () => {
    try {
      setLoading(true);
      const response: ApplicationListResponse = await JobApplicationApi.getMyApplications({
        ordering: '-responded_at'
      });
      
      // Filter applications that have been accepted
      const respondedApplications = response.applications.filter(app => 
        app.responded_at && 
        (app.status === 'accepted' || app.status === 'rejected')
      );

      // Convert to notifications
      const newNotifications: NotificationItem[] = respondedApplications.map(app => ({
        id: `${app.id}-${app.responded_at}`,
        type: app.status === 'accepted' ? 'accepted' : 'rejected',
        application: app as unknown as JobApplicationWithDetails,
        timestamp: app.responded_at || app.applied_at,
        read: false
      }));

      //  (most recent first)
      newNotifications.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

      setNotifications(newNotifications.slice(0, 10)); // Keep last 10 notifications
    } catch (error) {
      console.error('Error fetching application updates:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = (notificationId: string) => {
    setNotifications(prev =>
      prev.map(notif =>
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const dismissNotification = (notificationId: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
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

  const getNotificationIcon = (type: 'accepted' | 'rejected' | 'updated') => {
    switch (type) {
      case 'accepted':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'rejected':
        return <AlertCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-blue-600" />;
    }
  };

  const getNotificationColor = (type: 'accepted' | 'rejected' | 'updated') => {
    switch (type) {
      case 'accepted':
        return 'border-green-200 bg-green-50';
      case 'rejected':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-blue-200 bg-blue-50';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        title="Application Notifications"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-medium">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Dropdown */}
      <AnimatePresence>
        {showNotifications && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-2xl border border-gray-200 z-50 max-h-96 overflow-hidden"
          >
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Application Updates</h3>
                <button
                  onClick={() => setShowNotifications(false)}
                  className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="max-h-80 overflow-y-auto">
              {loading && (
                <div className="p-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600 mx-auto"></div>
                  <p className="text-gray-600 text-sm mt-2">Loading notifications...</p>
                </div>
              )}

              {!loading && notifications.length === 0 && (
                <div className="p-6 text-center">
                  <Bell className="w-12 h-12 mx-auto text-gray-400 mb-3" />
                  <h4 className="text-gray-900 font-medium mb-1">No notifications</h4>
                  <p className="text-gray-600 text-sm">
                    You'll receive notifications when employers respond to your applications
                  </p>
                </div>
              )}

              {!loading && notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`p-4 border-l-4 border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${getNotificationColor(notification.type)} ${
                    !notification.read ? 'font-medium' : ''
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="text-sm font-medium text-gray-900">
                          Application {notification.type === 'accepted' ? 'Accepted' : 'Update'}
                        </h4>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            dismissNotification(notification.id);
                          }}
                          className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-200 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>

                      <div className="space-y-1 text-sm text-gray-700">
                        <div className="flex items-center gap-1">
                          <Briefcase className="w-3 h-3" />
                          <span className="font-medium">{notification.application.job_details?.title}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <Building className="w-3 h-3" />
                          <span>{notification.application.employer_details?.company_name}</span>
                        </div>

                        {notification.type === 'accepted' && (
                          <div className="flex items-center gap-1 text-green-700">
                            <DollarSign className="w-3 h-3" />
                            <span>Rate: {formatCurrency(notification.application.proposed_rate)}</span>
                          </div>
                        )}

                        <div className="flex items-center gap-1 text-gray-500 text-xs mt-2">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDate(notification.timestamp)}</span>
                        </div>
                      </div>

                      {notification.type === 'accepted' && (
                        <div className="mt-3 p-2 bg-green-100 border border-green-200 rounded-lg">
                          <p className="text-green-800 text-xs font-medium">
                            🎉 Congratulations! Your application has been approved by the admin team.
                            The employer will contact you soon to discuss next steps.
                          </p>
                        </div>
                      )}

                      {notification.type === 'rejected' && (
                        <div className="mt-3 p-2 bg-red-100 border border-red-200 rounded-lg">
                          <p className="text-red-800 text-xs">
                            Your application was not selected this time. Keep applying to other opportunities!
                          </p>
                        </div>
                      )}

                      {!notification.read && (
                        <div className="absolute left-1 top-4 w-2 h-2 bg-red-600 rounded-full"></div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>

            {notifications.length > 0 && (
              <div className="p-3 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => {
                    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                  }}
                  className="text-sm text-red-600 hover:text-red-800 font-medium transition-colors"
                >
                  Mark all as read
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close */}
      {showNotifications && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowNotifications(false)}
        />
      )}
    </div>
  );
};

export default ApplicationNotifications;