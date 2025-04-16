import React, { useState, useEffect } from 'react';
import axios from 'axios';

const DOCUMENT_TYPES = {
  PAYROLL: 'payroll',
  PERSONAL: 'personal',
  COMPANY: 'company',
  ONBOARDING: 'onboarding',
  BENEFITS: 'benefits',
  TRAINING: 'training'
};

export default function DocumentUpload() {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [documentType, setDocumentType] = useState('');

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/employees', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
      setError('Failed to load employees');
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!file) {
      setError('Please select a file');
      return;
    }

    if (!documentType) {
      setError('Please select a document type');
      return;
    }

    if (!selectedEmployee) {
      setError('Please select an employee');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('employeeId', selectedEmployee);
    formData.append('documentType', documentType.toLowerCase());

    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3000/api/documents/upload', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      // Reset form
      setFile(null);
      setTitle('');
      setDescription('');
      setSelectedEmployee('');
      setDocumentType('');
      setSuccess('Document uploaded successfully');
      
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
    } catch (error) {
      console.error('Upload error:', error.response?.data || error);
      setError(error.response?.data?.message || 'Error uploading document');
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-6">Upload Document</h2>
      
      <form onSubmit={handleUpload} className="space-y-4 max-w-lg bg-white p-6 rounded-lg shadow">
        {error && <div className="text-red-500 text-sm">{error}</div>}
        {success && <div className="text-green-500 text-sm">{success}</div>}
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Select Employee
          </label>
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="w-full p-2 border rounded focus:ring-indigo-500 focus:border-indigo-500"
            required
          >
            <option value="">Select an employee</option>
            {employees.map((employee) => (
              <option key={employee._id} value={employee.user._id}>
                {employee.name} ({employee.employeeId})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Document Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full p-2 border rounded focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded focus:ring-indigo-500 focus:border-indigo-500"
            rows="3"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Document Type
          </label>
          <select
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            className="w-full p-2 border rounded focus:ring-indigo-500 focus:border-indigo-500"
            required
          >
            <option value="">Select Document Type</option>
            <option value={DOCUMENT_TYPES.PAYROLL}>Payroll</option>
            <option value={DOCUMENT_TYPES.PERSONAL}>Personal</option>
            <option value={DOCUMENT_TYPES.COMPANY}>Company</option>
            <option value={DOCUMENT_TYPES.ONBOARDING}>Onboarding</option>
            <option value={DOCUMENT_TYPES.BENEFITS}>Benefits</option>
            <option value={DOCUMENT_TYPES.TRAINING}>Training</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Upload File
          </label>
          <input
            type="file"
            onChange={(e) => setFile(e.target.files[0])}
            className="w-full p-2 border rounded focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Upload Document
        </button>
      </form>
    </div>
  );
}