import React from 'react';
import { useAuth } from '../../context/authContext';

const EmployeeSummary = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">Employee Dashboard</h1>
      
      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-500">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="font-semibold text-gray-700">Hours Worked</h2>
              <p className="text-2xl font-bold text-gray-800">160</p>
              <p className="text-sm text-gray-500">This month</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-500">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="font-semibold text-gray-700">Salary</h2>
              <p className="text-2xl font-bold text-gray-800">$4,500</p>
              <p className="text-sm text-gray-500">Next payment: 15th</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-500">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="font-semibold text-gray-700">Leave Balance</h2>
              <p className="text-2xl font-bold text-gray-800">15 days</p>
              <p className="text-sm text-gray-500">Annual leave</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-500">
              <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <div className="ml-4">
              <h2 className="font-semibold text-gray-700">Notifications</h2>
              <p className="text-2xl font-bold text-gray-800">3</p>
              <p className="text-sm text-gray-500">Unread</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Recent Activity</h3>
        </div>
        <div className="p-6">
          <ul className="divide-y divide-gray-200">
            <li className="py-3">
              <div className="flex items-center">
                <div className="bg-blue-100 p-2 rounded-full">
                  <svg className="h-5 w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">Timesheet submitted</p>
                  <p className="text-sm text-gray-500">Yesterday at 2:30 PM</p>
                </div>
              </div>
            </li>
            <li className="py-3">
              <div className="flex items-center">
                <div className="bg-green-100 p-2 rounded-full">
                  <svg className="h-5 w-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">Leave request approved</p>
                  <p className="text-sm text-gray-500">May 15, 2023</p>
                </div>
              </div>
            </li>
            <li className="py-3">
              <div className="flex items-center">
                <div className="bg-yellow-100 p-2 rounded-full">
                  <svg className="h-5 w-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-900">Training reminder</p>
                  <p className="text-sm text-gray-500">May 10, 2023</p>
                </div>
              </div>
            </li>
          </ul>
        </div>
      </div>
      
      {/* Upcoming Events */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold text-gray-800">Upcoming Events</h3>
        </div>
        <div className="p-6">
          <ul className="divide-y divide-gray-200">
            <li className="py-3">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Team Meeting</p>
                  <p className="text-sm text-gray-500">Discussion about new project</p>
                </div>
                <p className="text-sm text-gray-500">Tomorrow, 10:00 AM</p>
              </div>
            </li>
            <li className="py-3">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Monthly Review</p>
                  <p className="text-sm text-gray-500">Performance evaluation</p>
                </div>
                <p className="text-sm text-gray-500">May 30, 2:00 PM</p>
              </div>
            </li>
            <li className="py-3">
              <div className="flex justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">Company Picnic</p>
                  <p className="text-sm text-gray-500">Annual team building event</p>
                </div>
                <p className="text-sm text-gray-500">June 15, 11:00 AM</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EmployeeSummary; 