import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Send, Tag, Link as LinkIcon, AlertCircle, CheckCircle } from 'lucide-react';

const AdminNotifications = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployees, setSelectedEmployees] = useState([]);
  const [form, setForm] = useState({ title: '', message: '', tags: [], link: '' });
  const [currentTag, setCurrentTag] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [employeeUsers, setEmployeeUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => { fetchEmployees(); }, []);

  const fetchEmployees = async () => {
    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/employees', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setEmployeeUsers(response.data.map(emp => ({ ...emp, userId: emp.user })));
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setStatus({ type: 'error', message: 'Failed to fetch employees' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  const handleEmployeeSelect = (e) => {
    setSelectedEmployees(Array.from(e.target.selectedOptions, option => option.value));
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
      setStatus({ type: 'error', message: 'Please fill all required fields' });
      return;
    }

    try {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      const userIds = selectedEmployees.map(empId => {
        const employee = employees.find(emp => emp._id === empId);
        return employee?.user?._id;
      }).filter(Boolean);

      if (userIds.length === 0) {
        setStatus({ type: 'error', message: 'No valid recipients selected' });
        return;
      }

      await axios.post('http://localhost:3000/api/notifications', {
        ...form, recipients: userIds
      }, { headers: { 'Authorization': `Bearer ${token}` } });

      setStatus({ type: 'success', message: 'Notification sent successfully' });
      setForm({ title: '', message: '', tags: [], link: '' });
      setSelectedEmployees([]);
    } catch (error) {
      console.error('Error sending notification:', error);
      setStatus({ type: 'error', message: error.response?.data?.error || 'Failed to send notification' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-3 bg-white rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold mb-3 text-gray-800">Send Notifications</h2>
      
      {status.message && (
        <div className={`p-2 mb-3 rounded flex items-center gap-2 text-sm ${
          status.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {status.type === 'success' ? <CheckCircle size={16} /> : <AlertCircle size={16} />}
          {status.message}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label className="text-sm font-medium text-gray-700">Title*</label>
          <input type="text" name="title" value={form.title} onChange={handleInputChange}
            className="mt-1 w-full p-2 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-blue-400" required />
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700">Message*</label>
          <textarea name="message" value={form.message} onChange={handleInputChange}
            className="mt-1 w-full p-2 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-blue-400 h-20" required />
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700">Recipients*</label>
          <select multiple value={selectedEmployees} onChange={handleEmployeeSelect}
            className="mt-1 w-full p-2 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-blue-400 h-28" required>
            {isLoading ? <option disabled>Loading...</option> :
              employees.map(employee => (
                <option key={employee._id} value={employee._id}>{employee.name} ({employee.email})</option>
              ))}
          </select>
          <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700">Tags</label>
          <div className="flex mt-1">
            <input type="text" value={currentTag} onChange={(e) => setCurrentTag(e.target.value)}
              className="flex-1 p-2 text-sm border border-gray-200 rounded-l focus:ring-1 focus:ring-blue-400"
              placeholder="Add a tag" onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())} />
            <button type="button" onClick={addTag}
              className="px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-l-0 border-gray-200 rounded-r">
              <Tag size={16} className="text-gray-600" />
            </button>
          </div>
          
          {form.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {form.tags.map(tag => (
                <span key={tag} className="bg-blue-50 px-2 py-1 rounded-full text-xs flex items-center">
                  {tag}
                  <button type="button" onClick={() => removeTag(tag)}
                    className="ml-1 text-blue-500 hover:text-blue-700">×</button>
                </span>
              ))}
            </div>
          )}
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-700">Link</label>
          <div className="flex items-center relative mt-1">
            <LinkIcon size={16} className="absolute left-2 text-gray-400" />
            <input type="url" name="link" value={form.link} onChange={handleInputChange}
              className="w-full p-2 pl-8 text-sm border border-gray-200 rounded focus:ring-1 focus:ring-blue-400"
              placeholder="https://example.com" />
          </div>
        </div>
        
        <button type="submit" disabled={isLoading}
          className={`w-full p-2 bg-blue-500 text-white rounded flex items-center justify-center gap-2 hover:bg-blue-600 
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
          <Send size={16} />
          {isLoading ? 'Sending...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

export default AdminNotifications;