import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';

const DeleteConfirmationModal = ({ employee, onClose, onConfirm }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    try {
      await onConfirm();
    } catch (error) {
      setIsDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded shadow-lg w-96">
        <h2 className="text-xl font-bold mb-4">Confirm Delete</h2>
        <p className="mb-6">
          Are you sure you want to delete employee <span className="font-semibold">{employee.name}</span> (ID: {employee.employeeId})?
          This action cannot be undone.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={handleConfirm}
            disabled={isDeleting}
            className={`bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[80px] ${isDeleting ? 'cursor-not-allowed' : 'hover:bg-red-600'}`}
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </button>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationModal; 