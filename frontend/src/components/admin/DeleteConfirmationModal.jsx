import React from 'react';

const DeleteConfirmationModal = ({ employee, onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
        <p className="mb-6">
          Are you sure you want to delete employee <span className="font-semibold">{employee.name}</span> (ID: {employee.employeeId})?
          This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={onConfirm}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Delete
          </button>
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal; 