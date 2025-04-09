import React, { useState, useEffect } from 'react';
import axios from 'axios';

const LeaveManagement = () => {
  const [leaveRequests, setLeaveRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchLeaveRequests();
  }, []);

  const fetchLeaveRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/leaves/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setLeaveRequests(response.data);
      setLoading(false);
    } catch (error) {
      setError('Error fetching leave requests');
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        `http://localhost:3000/api/leaves/${id}/status`, 
        { status },
        { headers: { 'Authorization': `Bearer ${token}` }}
      );

      if (response.data.success) {
        // Update the local state immediately
        setLeaveRequests(prevRequests => 
          prevRequests.map(request => 
            request._id === id 
              ? { ...request, status: status }
              : request
          )
        );
      } else {
        setError(response.data.message || 'Error updating leave request');
      }
    } catch (error) {
      console.error('Update error:', error);
      setError(error.response?.data?.message || 'Error updating leave request');
    }
  };

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Leave Management</h2>
      
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Dates</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leaveRequests.map((request) => (
              <tr key={request._id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  {request.employee.name} ({request.employee.employeeId})
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{request.leaveType}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {new Date(request.startDate).toLocaleDateString()} - {new Date(request.endDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{request.totalDays}</td>
                <td className="px-6 py-4 whitespace-nowrap">{request.reason}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${request.status === 'Approved' ? 'bg-green-100 text-green-800' : 
                      request.status === 'Rejected' ? 'bg-red-100 text-red-800' : 
                      'bg-yellow-100 text-yellow-800'}`}>
                    {request.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {request.status === 'Pending' && (
                    <div className="space-x-2">
                      <button
                        onClick={() => handleStatusUpdate(request._id, 'Approved')}
                        className="bg-green-500 text-white px-3 py-1 rounded-md text-sm hover:bg-green-600"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleStatusUpdate(request._id, 'Rejected')}
                        className="bg-red-500 text-white px-3 py-1 rounded-md text-sm hover:bg-red-600"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default LeaveManagement; 