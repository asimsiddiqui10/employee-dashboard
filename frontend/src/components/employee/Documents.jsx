import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { handleApiError } from '@/utils/errorHandler';
import { Download } from 'lucide-react';

const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await api.get('/documents/employee-documents');
      setDocuments(response.data);
    } catch (error) {
      const { message } = handleApiError(error);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (documentId) => {
    try {
      const response = await api.get(`/documents/download/${documentId}`, {
        responseType: 'blob'
      });
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `document-${documentId}.pdf`); // or use the actual filename from response
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      const { message } = handleApiError(error);
      setError(message);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">My Documents</h2>
      <div className="grid gap-4">
        {documents.map((doc) => (
          <div key={doc._id} className="border p-4 rounded flex justify-between items-center">
            <div>
              <h3 className="font-semibold">{doc.title}</h3>
              <p className="text-sm text-gray-600">{doc.description}</p>
              <p className="text-xs text-gray-500">
                Uploaded on {new Date(doc.uploadDate).toLocaleDateString()}
              </p>
            </div>
            <button
              onClick={() => handleDownload(doc._id)}
              className="flex items-center text-blue-600 hover:text-blue-800"
            >
              <Download size={16} className="mr-1" />
              Download
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Documents; 