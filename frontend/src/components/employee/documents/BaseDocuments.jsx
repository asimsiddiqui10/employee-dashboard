import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";

// Changed to default export
export default function BaseDocuments({ documentType, title }) {
  const [documents, setDocuments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, [documentType]);

  const fetchDocuments = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // More detailed debugging
      console.log('Fetching documents...');
      console.log('Token:', token);
      console.log('Document type:', documentType);

      const response = await axios.get(`http://localhost:3000/api/documents/type/${documentType}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('Documents response:', response.data);
      setDocuments(response.data);
    } catch (error) {
      console.error('Document fetch error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        documentType,
        error: error
      });
      setError(error.response?.data?.message || 'Error fetching documents');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (doc) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:3000/api/documents/download/${doc._id}`,
        {
          headers: { 'Authorization': `Bearer ${token}` },
          responseType: 'blob'
        }
      );

      const blob = new Blob([response.data], { type: doc.fileType });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', doc.fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading documents...</p>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : documents.length === 0 ? (
          <p>No documents found</p>
        ) : (
          <div className="space-y-4">
            {documents.map((doc) => (
              <div key={doc._id} className="flex justify-between items-center p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">{doc.title}</h3>
                  <p className="text-sm text-gray-500">{doc.description}</p>
                  <p className="text-xs text-gray-400">
                    Uploaded on {new Date(doc.uploadedAt).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDownload(doc)}
                  className="p-2 hover:bg-gray-100 rounded-full dark:hover:bg-gray-800"
                  title="Download document"
                >
                  <Download className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Add named export as well for backward compatibility
export { BaseDocuments };
