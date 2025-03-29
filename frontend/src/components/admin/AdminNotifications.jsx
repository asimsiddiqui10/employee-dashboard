import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Send, Tag, Link as LinkIcon } from 'lucide-react';

const AdminNotifications = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [form, setForm] = useState({
    title: '',
    message: '',
    tags: [],
    link: ''
  });
  const [currentTag, setCurrentTag] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [employeeUsers, setEmployeeUsers] = useState([]);

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/employees', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setEmployeeUsers(response.data.map(emp => ({
        ...emp,
        userId: emp.user
      })));
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setStatus({ type: 'error', message: 'Failed to fetch employees' });
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleEmployeeSelect = (e) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedEmployees(selectedOptions);
  };

  const addTag = () => {
    if (currentTag.trim() && !form.tags.includes(currentTag.trim())) {
      setForm({ ...form, tags: [...form.tags, currentTag.trim()] });
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove) => {
    setForm({ ...form, tags: form.tags.filter(tag => tag !== tagToRemove) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!form.title || !form.message || selectedEmployees.length === 0) {
      setStatus({ type: 'error', message: 'Please fill all required fields and select at least one recipient' });
      return;
    }

    try {
      const token = localStorage.getItem('token');
      // Map selected employee IDs to their corresponding user IDs
      const userIds = selectedEmployees.map(empId => {
        const employee = employees.find(emp => emp._id === empId);
        return employee?.user?._id;
      }).filter(Boolean);

      console.log('Selected user IDs:', userIds); // Debug log

      if (userIds.length === 0) {
        setStatus({ type: 'error', message: 'No valid recipients selected' });
        return;
      }

      const response = await axios.post('http://localhost:3000/api/notifications', {
        ...form,
        recipients: userIds
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      console.log('Notification response:', response.data); // Debug log

      setStatus({ type: 'success', message: 'Notification sent successfully' });
      setForm({ title: '', message: '', tags: [], link: '' });
      setSelectedEmployees([]);
    } catch (error) {
      console.error('Error sending notification:', error);
      setStatus({ type: 'error', message: error.response?.data?.error || 'Failed to send notification' });
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Send Notifications</h2>
      
      {status.message && (
        <div className={`p-4 mb-4 rounded ${status.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {status.message}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Title*</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Message*</label>
          <textarea
            name="message"
            value={form.message}
            onChange={handleInputChange}
            className="w-full p-2 border rounded h-32"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Recipients*</label>
          <select
            multiple
            value={selectedEmployees}
            onChange={handleEmployeeSelect}
            className="w-full p-2 border rounded h-32"
            required
          >
            {employees.map(employee => (
              <option key={employee._id} value={employee._id}>
                {employee.name} ({employee.email})
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple employees</p>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
          <div className="flex">
            <input
              type="text"
              value={currentTag}
              onChange={(e) => setCurrentTag(e.target.value)}
              className="flex-1 p-2 border rounded-l"
              placeholder="Add a tag"
            />
            <button
              type="button"
              onClick={addTag}
              className="bg-gray-200 px-4 py-2 rounded-r hover:bg-gray-300 flex items-center"
            >
              <Tag size={16} className="mr-1" /> Add
            </button>
          </div>
          
          {form.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {form.tags.map(tag => (
                <span key={tag} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm flex items-center">
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="ml-1 text-blue-800 hover:text-blue-900"
                  >
                    &times;
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Attach Link</label>
          <div className="flex items-center">
            <LinkIcon size={16} className="mr-2 text-gray-500" />
            <input
              type="url"
              name="link"
              value={form.link}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              placeholder="https://example.com"
            />
          </div>
        </div>
        
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center gap-2"
        >
          <Send size={16} />
          Send Notification
        </button>
      </form>
    </div>
  );
};

export default AdminNotifications; 