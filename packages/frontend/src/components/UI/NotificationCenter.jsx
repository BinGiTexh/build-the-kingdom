import React, { useState, useEffect, useRef } from 'react';
import { 
  CheckCircle, 
  Info, 
  AlertTriangle, 
  X, 
  ExternalLink,
  Clock,
  Bell,
  BellOff
} from 'lucide-react';

const NotificationCenter = ({ isOpen, onClose, notifications = [] }) => {
  const [filter, setFilter] = useState('all');
  const notificationRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'error':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  // Filter notifications
  const filteredNotifications = notifications.filter(notification => {
    if (filter === 'all') return true;
    if (filter === 'unread') return notification.unread;
    return notification.type === filter;
  });

  const unreadCount = notifications.filter(n => n.unread).length;

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 mt-2 w-96 max-w-sm bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 animate-slide-down z-50" ref={notificationRef}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            Notifications
            {unreadCount > 0 && (
              <span className="ml-2 bg-accent-500 text-white text-xs rounded-full px-2 py-1 font-medium">
                {unreadCount}
              </span>
            )}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 mt-3">
          {['all', 'unread', 'success', 'info', 'warning'].map((filterType) => (
            <button
              key={filterType}
              onClick={() => setFilter(filterType)}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-all duration-200 ${
                filter === filterType
                  ? 'bg-primary-100 dark:bg-primary-900 text-primary-800 dark:text-primary-200'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              {filterType.charAt(0).toUpperCase() + filterType.slice(1)}
              {filterType === 'unread' && unreadCount > 0 && (
                <span className="ml-1 text-xs">({unreadCount})</span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-96 overflow-y-auto scrollbar-hide">
        {filteredNotifications.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <BellOff className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {filter === 'unread' ? 'No unread notifications' : 'No notifications found'}
            </p>
          </div>
        ) : (
          <div className="py-2">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors border-l-4 ${
                  notification.unread
                    ? 'border-primary-500 bg-primary-50/30 dark:bg-primary-900/10'
                    : 'border-transparent'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <p className={`text-sm ${
                        notification.unread 
                          ? 'font-medium text-gray-900 dark:text-gray-100' 
                          : 'text-gray-700 dark:text-gray-300'
                      }`}>
                        {notification.message}
                      </p>
                      {notification.unread && (
                        <div className="flex-shrink-0 ml-2">
                          <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        {notification.time}
                      </p>
                      
                      {notification.actionUrl && (
                        <button className="text-xs text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium flex items-center">
                          View
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-b-xl border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between text-sm">
            <button className="text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 font-medium">
              Mark all as read
            </button>
            <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
              View all notifications
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationCenter;
