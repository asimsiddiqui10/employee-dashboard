import React from 'react';

const EmployeeModal = ({ employee, isEditing, onClose, onSave }) => {
  const [form, setForm] = React.useState(employee);

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

  const handleSave = () => {
    onSave(form);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center overflow-y-auto">
      <div className="bg-white p-6 rounded shadow-lg w-3/4 my-8">
        <h2 className="text-xl font-bold mb-4">{isEditing ? 'Edit Employee' : 'Employee Details'}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Basic Information */}
          <div className="col-span-full">
            <h3 className="text-lg font-semibold mb-2">Basic Information</h3>
          </div>
          <input className="border p-2 rounded" name="employeeId" value={form.employeeId || ''} onChange={handleInputChange} placeholder="Employee ID" disabled />
          <input className="border p-2 rounded" name="name" value={form.name || ''} onChange={handleInputChange} placeholder="Name" disabled={!isEditing} />
          <select className="border p-2 rounded" name="gender" value={form.gender || ''} onChange={handleInputChange} disabled={!isEditing}>
            <option value="">Select Gender</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>
          <input className="border p-2 rounded" name="email" value={form.email || ''} onChange={handleInputChange} placeholder="Email" disabled={!isEditing} />
          <input className="border p-2 rounded" name="phoneNumber" value={form.phoneNumber || ''} onChange={handleInputChange} placeholder="Phone Number" disabled={!isEditing} />
          <input className="border p-2 rounded" name="dateOfBirth" type="date" value={form.dateOfBirth ? new Date(form.dateOfBirth).toISOString().split('T')[0] : ''} onChange={handleInputChange} disabled={!isEditing} />
          <input className="border p-2 rounded" name="address" value={form.address || ''} onChange={handleInputChange} placeholder="Address" disabled={!isEditing} />
          <input className="border p-2 rounded" name="ssn" value={form.ssn || ''} onChange={handleInputChange} placeholder="SSN" disabled={!isEditing} />
          <input className="border p-2 rounded" name="nationality" value={form.nationality || ''} onChange={handleInputChange} placeholder="Nationality" disabled={!isEditing} />

          {/* Education & Certifications */}
          <div className="col-span-full">
            <h3 className="text-lg font-semibold mb-2">Education & Certifications</h3>
          </div>
          <input className="border p-2 rounded" name="educationLevel" value={form.educationLevel || ''} onChange={handleInputChange} placeholder="Education Level" disabled={!isEditing} />
          <input className="border p-2 rounded" name="certifications" value={form.certifications ? form.certifications.join(', ') : ''} onChange={handleInputChange} placeholder="Certifications (comma-separated)" disabled={!isEditing} />

          {/* Emergency Contact */}
          <div className="col-span-full">
            <h3 className="text-lg font-semibold mb-2">Emergency Contact</h3>
          </div>
          <input className="border p-2 rounded" name="emergencyContact.name" value={form.emergencyContact?.name || ''} onChange={handleInputChange} placeholder="Emergency Contact Name" disabled={!isEditing} />
          <input className="border p-2 rounded" name="emergencyContact.phone" value={form.emergencyContact?.phone || ''} onChange={handleInputChange} placeholder="Emergency Contact Phone" disabled={!isEditing} />

          {/* Employment Information */}
          <div className="col-span-full">
            <h3 className="text-lg font-semibold mb-2">Employment Information</h3>
          </div>
          <input className="border p-2 rounded" name="department" value={form.department || ''} onChange={handleInputChange} placeholder="Department" disabled={!isEditing} />
          <input className="border p-2 rounded" name="position" value={form.position || ''} onChange={handleInputChange} placeholder="Position" disabled={!isEditing} />
          <input className="border p-2 rounded" name="dateOfHire" type="date" value={form.dateOfHire ? new Date(form.dateOfHire).toISOString().split('T')[0] : ''} onChange={handleInputChange} disabled={!isEditing} />
          <select className="border p-2 rounded" name="employmentType" value={form.employmentType || ''} onChange={handleInputChange} disabled={!isEditing}>
            <option value="">Select Employment Type</option>
            <option value="Full-time">Full-time</option>
            <option value="Part-time">Part-time</option>
            <option value="Contract">Contract</option>
            <option value="Consultant">Consultant</option>
          </select>
          <select className="border p-2 rounded" name="employmentStatus" value={form.employmentStatus || ''} onChange={handleInputChange} disabled={!isEditing}>
            <option value="">Select Status</option>
            <option value="Active">Active</option>
            <option value="On leave">On leave</option>
            <option value="Terminated">Terminated</option>
          </select>
          <input className="border p-2 rounded" name="workEmail" value={form.workEmail || ''} onChange={handleInputChange} placeholder="Work Email" disabled={!isEditing} />
          <input className="border p-2 rounded" name="workPhoneNumber" value={form.workPhoneNumber || ''} onChange={handleInputChange} placeholder="Work Phone" disabled={!isEditing} />
          <input className="border p-2 rounded" name="totalCompensation" type="number" value={form.totalCompensation || ''} onChange={handleInputChange} placeholder="Total Compensation" disabled={!isEditing} />
        </div>
        
        <div className="flex justify-end mt-6">
          {isEditing && (
            <button onClick={handleSave} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 mr-2">
              Save Changes
            </button>
          )}
          <button onClick={onClose} className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmployeeModal;