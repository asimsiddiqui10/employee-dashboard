import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { handleApiError } from '@/utils/errorHandler';
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
      const response = await api.get(`/documents/type/${documentType}`);
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
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      window.open(response.data.downloadUrl, '_blank');
    } catch (error) {
      const { message } = handleApiError(error);
      setError(message);
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
                  onClick={() => handleDownload(doc._id)}
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
