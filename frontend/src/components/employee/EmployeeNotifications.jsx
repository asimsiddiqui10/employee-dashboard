import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bell, ExternalLink } from 'lucide-react';

const EmployeeNotifications = () => {
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('Fetching notifications...'); // Debug log
      
      const response = await axios.get('http://localhost:3000/api/notifications/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('Received notifications:', response.data); // Debug log
      setNotifications(response.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      // Add user feedback
      if (error.response?.status === 404) {
        setNotifications([]);
      }
    }
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await axios.patch(`http://localhost:3000/api/notifications/${id}/read`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Update local state
      setNotifications(notifications.map(notification => 
        notification._id === id ? { ...notification, isRead: true } : notification
      ));
    } catch (error) {
      console.error('Error marking notification as read:', error);
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