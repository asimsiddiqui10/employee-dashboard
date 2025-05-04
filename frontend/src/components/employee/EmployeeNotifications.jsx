import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { Bell, ExternalLink } from 'lucide-react';
import { handleApiError } from '@/utils/errorHandler';

const EmployeeNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get('/notifications/me');
      setNotifications(response.data);
    } catch (error) {
      const { message } = handleApiError(error);
      console.error(message);
    }
  };

  const markAsRead = async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      fetchNotifications();
    } catch (error) {
      const { message } = handleApiError(error);
      console.error(message);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">My Notifications</h2>
      
      <div className="space-y-4">
        {notifications.length === 0 ? (
          <p className="text-gray-500">You have no notifications.</p>
        ) : (
          notifications.map(notification => (
            <div 
              key={notification._id} 
              className={`p-4 border rounded ${notification.isRead ? 'bg-gray-50' : 'bg-blue-50 border-blue-200'}`}
            >
              <div className="flex items-start">
                <Bell size={20} className={`mr-3 mt-1 ${notification.isRead ? 'text-gray-400' : 'text-blue-500'}`} />
                <div className="flex-1">
                  <h3 className="font-semibold text-lg">{notification.title}</h3>
                  <p className="text-sm text-gray-500">
                    From: {notification.sender?.name || 'Admin'} • 
                    {new Date(notification.createdAt).toLocaleString()}
                  </p>
                  
                  {notification.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 my-2">
                      {notification.tags.map(tag => (
                        <span key={tag} className="bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <p className="my-2">{notification.message}</p>
                  
                  {notification.link && (
                    <a 
                      href={notification.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline flex items-center mt-2"
                    >
                      <ExternalLink size={14} className="mr-1" />
                      Attached Link
                    </a>
                  )}
                  
                  {!notification.isRead && (
                    <button
                      onClick={() => markAsRead(notification._id)}
                      className="text-sm text-blue-500 hover:underline mt-2"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default EmployeeNotifications; 