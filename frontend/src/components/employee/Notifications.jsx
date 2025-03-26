import React from 'react';

const Notifications = () => {
  const notifications = [
    { 
      id: 1, 
      title: 'Leave Request Approved', 
      message: 'Your leave request for April 10-14 has been approved by the manager.',
      date: '2023-04-05T10:30:00',
      read: true,
      type: 'success'
    },
    { 
      id: 2, 
      title: 'New Company Policy', 
      message: 'Please review the updated company policy on remote work arrangements.',
      date: '2023-04-03T14:15:00',
      read: false,
      type: 'info'
    },
    { 
      id: 3, 
      title: 'Timesheet Reminder', 
      message: 'Please submit your timesheet for the previous week by end of day today.',
      date: '2023-04-03T09:00:00',
      read: false,
      type: 'warning'
    },
    { 
      id: 4, 
      title: 'Team Building Event', 
      message: 'Join us for the quarterly team building event on Friday, April 28th at 3:00 PM.',
      date: '2023-04-01T11:45:00',
      read: true,
      type: 'info'
    },
    { 
      id: 5, 
      title: 'Performance Review Scheduled', 
      message: 'Your quarterly performance review has been scheduled for April 15th at 10:00 AM.',
      date: '2023-03-30T16:20:00',
      read: true,
      type: 'info'
    }
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTypeIcon = (type) => {
    switch(type) {
      case 'success':
        return (
          <div className="p-2 rounded-full bg-green-100 text-green-500">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'warning':
        return (
          <div className="p-2 rounded-full bg-yellow-100 text-yellow-500">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
      case 'info':
      default:
        return (
          <div className="p-2 rounded-full bg-blue-100 text-blue-500">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">Notifications</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-800">Recent Notifications</h2>
          <button className="text-sm text-blue-600 hover:text-blue-800">Mark all as read</button>
        </div>
        <div className="divide-y divide-gray-200">
          {notifications.map((notification) => (
            <div 
              key={notification.id} 
              className={`p-6 ${notification.read ? 'bg-white' : 'bg-blue-50'}`}
            >
              <div className="flex items-start">
                {getTypeIcon(notification.type)}
                <div className="ml-4 flex-1">
                  <div className="flex justify-between items-start">
                    <h3 className={`text-sm font-medium ${notification.read ? 'text-gray-900' : 'text-blue-800'}`}>
                      {notification.title}
                    </h3>
                    <span className="text-xs text-gray-500">{formatDate(notification.date)}</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">{notification.message}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex justify-center">
        <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
          Load More
        </button>
      </div>
    </div>
  );
};

export default Notifications; 