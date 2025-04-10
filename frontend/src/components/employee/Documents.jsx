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

  const handleDownload = async (doc) => {
    console.log('Starting download for document:', {
      id: doc._id,
      title: doc.title,
      type: doc.fileType,
      url: doc.fileUrl
    });

    try {
      const token = localStorage.getItem('token');
      
      const response = await axios.get(
        `http://localhost:3000/api/documents/download/${doc._id}`,
        {
          headers: { 
            'Authorization': `Bearer ${token}`
          },
          responseType: 'blob',
          timeout: 30000
        }
      );

      // Check if the response is actually a blob
      if (!(response.data instanceof Blob)) {
        throw new Error('Response is not a blob');
      }

      // Create blob with the correct type
      const blob = new Blob([response.data], { type: doc.fileType });
      
      if (blob.size === 0) {
        throw new Error('Downloaded file is empty');
      }

      const url = window.URL.createObjectURL(blob);
      const link = window.document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.fileName);
      
      window.document.body.appendChild(link);
      link.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      link.remove();

    } catch (error) {
      console.error('Download error details:', {
        message: error.message,
        response: error.response,
        data: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      
      let errorMessage = 'Failed to download document. ';
      if (error.response?.data instanceof Blob) {
        const text = await error.response.data.text();
        try {
          const errorData = JSON.parse(text);
          errorMessage += errorData.message;
        } catch (e) {
          errorMessage += 'Unknown error occurred.';
        }
      } else {
        errorMessage += error.response?.data?.message || 'Please try again later.';
      }
      
      alert(errorMessage);
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
              onClick={() => handleDownload(doc)}
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