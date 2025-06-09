import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { handleApiError } from '@/utils/errorHandler';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Download } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function PayrollDocuments() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPayrollDocuments();
  }, []);

  const fetchPayrollDocuments = async () => {
    try {
      const response = await api.get('/payroll/my-documents');
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
      const response = await api.get(`/payroll/download/${documentId}`);
      
      // Open the download URL in a new tab
      if (response.data.downloadUrl) {
        window.open(response.data.downloadUrl, '_blank');
      } else {
        setError('Download URL not found');
      }
    } catch (error) {
      const { message } = handleApiError(error);
      setError(message);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Payroll Documents</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {loading ? (
          <p className="text-muted-foreground">Loading documents...</p>
        ) : documents.length === 0 ? (
          <p className="text-muted-foreground">No payroll documents found</p>
        ) : (
          <div className="space-y-4">
            {documents.map((doc) => (
              <div key={doc._id} className="flex justify-between items-center p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">{doc.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    Pay Period: {new Date(doc.payPeriodStart).toLocaleDateString()} - {new Date(doc.payPeriodEnd).toLocaleDateString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
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