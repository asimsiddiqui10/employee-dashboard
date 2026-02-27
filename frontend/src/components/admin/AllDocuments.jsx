import React, { useEffect, useState } from 'react';
import api from '@/lib/axios';
import { handleApiError } from '@/utils/errorHandler';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

const formatType = (type) => {
  if (!type) return 'Unknown';
  return type.charAt(0).toUpperCase() + type.slice(1);
};

const getTypeBadgeClass = (type) => {
  switch (type) {
    case 'personal':
      return 'bg-blue-50 text-blue-700 border-blue-100';
    case 'company':
      return 'bg-emerald-50 text-emerald-700 border-emerald-100';
    case 'onboarding':
      return 'bg-amber-50 text-amber-700 border-amber-100';
    case 'benefits':
      return 'bg-purple-50 text-purple-700 border-purple-100';
    case 'training':
      return 'bg-rose-50 text-rose-700 border-rose-100';
    default:
      return 'bg-slate-50 text-slate-700 border-slate-200';
  }
};

const AllDocuments = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const response = await api.get('/documents/all');
        setDocuments(response.data || []);
      } catch (err) {
        const { message } = handleApiError(err);
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">All Documents</CardTitle>
            <CardDescription className="text-xs mt-1">
              Most recent uploads first
            </CardDescription>
          </div>
          <Badge variant="secondary" className="text-xs">
            {documents.length} total
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <div className="h-full overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Document</TableHead>
                <TableHead>Employee</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-muted-foreground">
                    Loading documents...
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-destructive text-sm">
                    {error}
                  </TableCell>
                </TableRow>
              ) : documents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-6 text-muted-foreground text-sm">
                    No documents found.
                  </TableCell>
                </TableRow>
              ) : (
                documents.map((doc) => (
                  <TableRow
                    key={doc._id}
                    className="cursor-pointer hover:bg-muted/40"
                    onClick={async () => {
                      try {
                        const response = await api.get(`/documents/download/${doc._id}`);
                        const url = response.data?.downloadUrl;
                        if (url) {
                          window.open(url, '_blank', 'noopener,noreferrer');
                        }
                      } catch (err) {
                        // Optional: you could integrate toast here if desired
                        console.error('Error opening document:', err);
                      }
                    }}
                  >
                    <TableCell className="font-medium text-sm">
                      {doc.title || doc.fileName}
                    </TableCell>
                    <TableCell className="text-sm">
                      {doc.employeeId?.name || 'Unknown'}
                    </TableCell>
                    <TableCell className="text-sm">
                      <Badge
                        variant="outline"
                        className={`text-xs border ${getTypeBadgeClass(doc.documentType)}`}
                      >
                        {formatType(doc.documentType)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {doc.uploadedAt ? format(new Date(doc.uploadedAt), 'MMM d, yyyy') : '—'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default AllDocuments;

