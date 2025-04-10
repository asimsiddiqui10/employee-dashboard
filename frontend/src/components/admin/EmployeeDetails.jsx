import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { Upload, User } from 'lucide-react';

const EmployeeDetails = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    fetchEmployeeDetails();
  }, [employeeId]);

  const fetchEmployeeDetails = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:3000/api/employees/${employeeId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setForm(response.data);
    } catch (error) {
      console.error('Error fetching employee details:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prevForm => {
      if (name.includes('.')) {
        const [parent, child] = name.split('.');
        return {
          ...prevForm,
          [parent]: { ...prevForm[parent], [child]: value }
        };
      }
      return { ...prevForm, [name]: value };
    });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:3000/api/employees/${employeeId}`, form, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setIsEditing(false);
      fetchEmployeeDetails();
    } catch (error) {
      console.error('Error updating employee:', error);
      alert('Failed to update employee details');
    }
  };

  const handleDelete = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3000/api/employees/${employeeId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      navigate('/admin-dashboard/employees');
    } catch (error) {
      console.error('Error deleting employee:', error);
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('profilePic', file);

    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `http://localhost:3000/api/employees/${employeeId}/profile-pic`,
        formData,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      
      // Update the form state with the new profile pic URL
      setForm(prev => ({ ...prev, profilePic: response.data.profilePic }));
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      alert('Failed to upload profile picture');
    }
  };

  if (!form) return <div>Loading...</div>;

  return (
    <div className="bg-white shadow rounded-lg">
      {/* Header Section */}
      <div className="relative h-48 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-t-lg">
        <div className="absolute w-full h-full flex justify-between items-center px-8">
          {/* Left side: Profile Picture and Info */}
          <div className="flex items-center space-x-6">
            {/* Profile Picture Container */}
            <div className="relative group">
              {form?.profilePic ? (
                <img
                  src={`http://localhost:3000${form.profilePic}`}
                  alt={form.name}
                  className="w-32 h-32 rounded-full border-4 border-white bg-white object-cover"
                />
              ) : (
                <div className="w-32 h-32 rounded-full border-4 border-white bg-gray-100 flex items-center justify-center">
                  <User size={64} className="text-gray-400" />
                </div>
              )}
              
              {/* Upload Button - Positioned over the image when editing */}
              {isEditing && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <input
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="profile-upload"
                    accept="image/*"
                  />
                  <label
                    htmlFor="profile-upload"
                    className="bg-black/50 hover:bg-black/70 text-white px-3 py-2 rounded-full text-sm cursor-pointer flex items-center"
                  >
                    <Upload size={14} className="mr-1" />
                    Update
                  </label>
                </div>
              )}
            </div>

            {/* Name and Job Title */}
            <div className="text-white">
              <h1 className="text-3xl font-bold mb-2">{form?.name || 'Employee Name'}</h1>
              <p className="text-xl opacity-90">
                {form?.position} - {form?.department}
              </p>
            </div>
          </div>

          {/* Right side: Action Buttons */}
          <div className="flex space-x-3">
            {!isEditing ? (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="bg-white text-blue-600 px-4 py-2 rounded hover:bg-blue-50"
                >
                  Edit
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="bg-white text-red-600 px-4 py-2 rounded hover:bg-red-50"
                >
                  Delete
                </button>
              </>
            ) : (
              <button
                onClick={handleSave}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Save
              </button>
            )}
            <button
              onClick={() => navigate('/admin-dashboard/employees')}
              className="bg-white text-gray-700 px-4 py-2 rounded hover:bg-gray-50"
            >
              Back to List
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-8">
        {/* Personal Information */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Personal Information</h2>
          <div className="grid grid-cols-2 gap-4">
            {isEditing ? (
              <>
                <input
                  type="text"
                  name="employeeId"
                  value={form?.employeeId || ''}
                  onChange={handleInputChange}
                  className="p-2 border rounded"
                  placeholder="Employee ID"
                />
                <input
                  type="email"
                  name="email"
                  value={form?.email || ''}
                  onChange={handleInputChange}
                  className="p-2 border rounded"
                  placeholder="Email"
                />
                <div>
                  <p className="text-sm text-gray-600">Phone Number</p>
                  <input
                    type="text"
                    name="phoneNumber"
                    value={form?.phoneNumber || ''}
                    onChange={handleInputChange}
                    className="p-2 border rounded"
                    placeholder="Phone Number"
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date of Birth</p>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={form?.dateOfBirth ? new Date(form.dateOfBirth).toISOString().split('T')[0] : ''}
                    onChange={handleInputChange}
                    className="p-2 border rounded"
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Gender</p>
                  <input
                    type="text"
                    name="gender"
                    value={form?.gender || ''}
                    onChange={handleInputChange}
                    className="p-2 border rounded"
                    placeholder="Gender"
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Nationality</p>
                  <input
                    type="text"
                    name="nationality"
                    value={form?.nationality || ''}
                    onChange={handleInputChange}
                    className="p-2 border rounded"
                    placeholder="Nationality"
                  />
                </div>
              </>
            ) : (
              <>
                <div>
                  <p className="text-sm text-gray-600">Employee ID</p>
                  <p className="font-medium">{form?.employeeId}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{form?.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Phone Number</p>
                  <p className="font-medium">{form?.phoneNumber || 'Not provided'}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Date of Birth</p>
                  <p className="font-medium">
                    {form?.dateOfBirth ? new Date(form.dateOfBirth).toLocaleDateString() : 'Not provided'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Gender</p>
                  <p className="font-medium">{form?.gender}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Nationality</p>
                  <p className="font-medium">{form?.nationality || 'Not provided'}</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Work Information */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Work Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Position</p>
              <p className="font-medium">{form?.position}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Department</p>
              <p className="font-medium">{form?.department}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Employment Type</p>
              <p className="font-medium">{form?.employmentType}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Date of Hire</p>
              <p className="font-medium">
                {form?.dateOfHire ? new Date(form.dateOfHire).toLocaleDateString() : 'Not provided'}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Work Email</p>
              <p className="font-medium">{form?.workEmail || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Work Phone</p>
              <p className="font-medium">{form?.workPhoneNumber || 'Not provided'}</p>
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Contact Information</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <p className="text-sm text-gray-600">Address</p>
              <p className="font-medium">{form?.address || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">City</p>
              <p className="font-medium">{form?.city || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">State</p>
              <p className="font-medium">{form?.state || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Zip Code</p>
              <p className="font-medium">{form?.zipCode || 'Not provided'}</p>
            </div>
          </div>
        </div>

        {/* Emergency Contact */}
        <div>
          <h2 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2">Emergency Contact</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-medium">{form?.emergencyContact?.name || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Phone</p>
              <p className="font-medium">{form?.emergencyContact?.phone || 'Not provided'}</p>
            </div>
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <DeleteConfirmationModal
          employee={form}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDelete}
        />
      )}
    </div>
  );
};

export default EmployeeDetails; 