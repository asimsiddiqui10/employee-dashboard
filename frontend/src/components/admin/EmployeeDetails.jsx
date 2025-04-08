import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { Upload } from 'lucide-react';

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
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setForm({
        ...form,
        [parent]: { ...form[parent], [child]: value }
      });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:3000/api/employees/${employeeId}`, form, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setIsEditing(false);
      fetchEmployeeDetails();
    } catch (error) {
      console.error('Error updating employee:', error);
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

  const handleFileSelect = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUploadProfilePic = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('profilePic', selectedFile);

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
      setForm({ ...form, profilePic: response.data.profilePic });
      setSelectedFile(null);
    } catch (error) {
      console.error('Error uploading profile picture:', error);
    }
  };

  if (!form) return <div>Loading...</div>;

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Employee Details</h2>
        <div className="space-x-2">
          {!isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Edit
              </button>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="border border-red-500 text-red-500 px-4 py-2 rounded hover:text-red-600 hover:border-red-600"
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
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Back to List
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="col-span-full flex flex-col items-center gap-4">
          <div className="w-32 h-32 rounded-full overflow-hidden border-2 border-gray-200">
            <img
              src={form.profilePic ? `http://localhost:3000${form.profilePic}` : '/default-profile.png'}
              alt="Profile"
              className="w-full h-full object-cover"
            />
          </div>
          {isEditing && (
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
                id="profile-pic-input"
              />
              <label
                htmlFor="profile-pic-input"
                className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded flex items-center gap-2"
              >
                <Upload size={16} />
                Choose File
              </label>
              {selectedFile && (
                <button
                  onClick={handleUploadProfilePic}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Upload
                </button>
              )}
            </div>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Basic Information</h3>
          <input className="border p-2 rounded w-full mb-2" name="employeeId" value={form.employeeId || ''} onChange={handleInputChange} placeholder="Employee ID" disabled />
          <input className="border p-2 rounded w-full mb-2" name="name" value={form.name || ''} onChange={handleInputChange} placeholder="Name" disabled={!isEditing} />
          <select className="border p-2 rounded w-full mb-2" name="gender" value={form.gender || ''} onChange={handleInputChange} disabled={!isEditing}>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          <input className="border p-2 rounded w-full mb-2" name="email" value={form.email || ''} onChange={handleInputChange} placeholder="Email" disabled={!isEditing} />
          <input className="border p-2 rounded w-full mb-2" name="phoneNumber" value={form.phoneNumber || ''} onChange={handleInputChange} placeholder="Phone Number" disabled={!isEditing} />
          <input className="border p-2 rounded w-full mb-2" name="dateOfBirth" type="date" value={form.dateOfBirth ? new Date(form.dateOfBirth).toISOString().split('T')[0] : ''} onChange={handleInputChange} disabled={!isEditing} />
          <input className="border p-2 rounded w-full mb-2" name="address" value={form.address || ''} onChange={handleInputChange} placeholder="Address" disabled={!isEditing} />
          <input className="border p-2 rounded w-full mb-2" name="ssn" value={form.ssn || ''} onChange={handleInputChange} placeholder="SSN" disabled={!isEditing} />
          <input className="border p-2 rounded w-full mb-2" name="nationality" value={form.nationality || ''} onChange={handleInputChange} placeholder="Nationality" disabled={!isEditing} />
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Education & Certifications</h3>
          <input className="border p-2 rounded w-full mb-2" name="educationLevel" value={form.educationLevel || ''} onChange={handleInputChange} placeholder="Education Level" disabled={!isEditing} />
          <input className="border p-2 rounded w-full mb-2" name="certifications" value={form.certifications ? form.certifications.join(', ') : ''} onChange={handleInputChange} placeholder="Certifications (comma-separated)" disabled={!isEditing} />
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Emergency Contact</h3>
          <input className="border p-2 rounded w-full mb-2" name="emergencyContact.name" value={form.emergencyContact?.name || ''} onChange={handleInputChange} placeholder="Emergency Contact Name" disabled={!isEditing} />
          <input className="border p-2 rounded w-full mb-2" name="emergencyContact.phone" value={form.emergencyContact?.phone || ''} onChange={handleInputChange} placeholder="Emergency Contact Phone" disabled={!isEditing} />
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Employment Information</h3>
          <input className="border p-2 rounded w-full mb-2" name="department" value={form.department || ''} onChange={handleInputChange} placeholder="Department" disabled={!isEditing} />
          <input className="border p-2 rounded w-full mb-2" name="position" value={form.position || ''} onChange={handleInputChange} placeholder="Position" disabled={!isEditing} />
          <input className="border p-2 rounded w-full mb-2" name="dateOfHire" type="date" value={form.dateOfHire ? new Date(form.dateOfHire).toISOString().split('T')[0] : ''} onChange={handleInputChange} disabled={!isEditing} />
          <select className="border p-2 rounded w-full mb-2" name="employmentType" value={form.employmentType || ''} onChange={handleInputChange} disabled={!isEditing}>
            <option value="">Select Employment Type</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Consultant">Consultant</option>
          </select>
          <select className="border p-2 rounded w-full mb-2" name="employmentStatus" value={form.employmentStatus || ''} onChange={handleInputChange} disabled={!isEditing}>
            <option value="">Select Status</option>
            <option value="Active">Active</option>
            <option value="On leave">On leave</option>
            <option value="Terminated">Terminated</option>
          </select>
          <input className="border p-2 rounded w-full mb-2" name="workEmail" value={form.workEmail || ''} onChange={handleInputChange} placeholder="Work Email" disabled={!isEditing} />
          <input className="border p-2 rounded w-full mb-2" name="workPhoneNumber" value={form.workPhoneNumber || ''} onChange={handleInputChange} placeholder="Work Phone" disabled={!isEditing} />
          <select 
            className="border p-2 rounded w-full mb-2" 
            name="compensationType" 
            value={form.compensationType || ''} 
            onChange={handleInputChange} 
            disabled={!isEditing}
          >
            <option value="Monthly Salary">Monthly Salary</option>
            <option value="Hourly Rate">Hourly Rate</option>
            <option value="Total Compensation">Total Compensation</option>
          </select>
          <input 
            className="border p-2 rounded w-full mb-2" 
            name="compensationValue" 
            type="number" 
            value={form.compensationValue || ''} 
            onChange={handleInputChange} 
            placeholder={`${form.compensationType || 'Compensation'} Amount`}
            disabled={!isEditing} 
          />
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