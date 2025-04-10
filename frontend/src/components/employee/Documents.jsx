import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Download } from 'lucide-react';

const Documents = () => {
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/documents/employee-documents', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setDocuments(response.data);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const handleDownload = async (documentId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:3000/api/documents/download/${documentId}`, {
        headers: { 'Authorization': `Bearer ${token}` },
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'document');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Download error:', error);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">My Documents</h2>
      <div className="grid gap-4">
        {documents.map(doc => (
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
              className="bg-blue-500 text-white p-2 rounded"
            >
              <Download size={20} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Documents; 