import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Building2, GraduationCap, Heart, FileCheck, AlertCircle, Download } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import api from '@/lib/axios';
import { handleApiError } from '@/utils/errorHandler';
import { toast } from '@/hooks/use-toast';
import { cn } from "@/lib/utils";

const documentTypes = [
  { value: 'all', label: 'All Documents', icon: FileText },
  { value: 'personal', label: 'Personal', icon: FileText, color: "blue" },
  { value: 'onboarding', label: 'Onboarding', icon: FileCheck, color: "green" },
  { value: 'company', label: 'Company', icon: Building2, color: "purple" },
  { value: 'training', label: 'Training', icon: GraduationCap, color: "yellow" },
  { value: 'benefits', label: 'Benefits', icon: Heart, color: "red" }
];

const timeFilters = [
  { value: 'all', label: 'All Time' },
  { value: '24h', label: 'Last 24 Hours' },
  { value: '7d', label: 'This Week' },
  { value: '30d', label: 'This Month' },
  { value: '365d', label: 'This Year' }
];

const getDocumentIcon = (type) => {
  const docType = documentTypes.find(dt => dt.value === type);
  const Icon = docType?.icon || AlertCircle;
  return <Icon className="h-5 w-5" />;
};

const getDocumentStyle = (type) => {
  const styles = {
    personal: "bg-blue-500/10 text-blue-500 border-blue-200",
    onboarding: "bg-green-500/10 text-green-500 border-green-200",
    company: "bg-purple-500/10 text-purple-500 border-purple-200",
    training: "bg-yellow-500/10 text-yellow-500 border-yellow-200",
    benefits: "bg-red-500/10 text-red-500 border-red-200"
  };
  return styles[type] || "bg-gray-500/10 text-gray-500 border-gray-200";
};

export default function MyDocuments() {
  const [documents, setDocuments] = useState([]);
  const [selectedType, setSelectedType] = useState('all');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, [selectedType, selectedTimeFilter]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      let response;
      
      if (selectedType === 'all') {
        const fetchPromises = documentTypes
          .filter(type => type.value !== 'all')
          .map(type => 
            api.get(`/documents/type/${type.value}`, {
              params: { timeFilter: selectedTimeFilter }
            })
              .then(response => response.data)
              .catch(() => [])
          );
        
        const results = await Promise.all(fetchPromises);
        const allDocs = results.flat();
        setDocuments(allDocs);
      } else {
        response = await api.get(`/documents/type/${selectedType}`, {
          params: { timeFilter: selectedTimeFilter }
        });
        setDocuments(response.data);
      }
    } catch (error) {
      const { message } = handleApiError(error);
      toast({
        title: "Error",
        description: message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (documentId) => {
    try {
      const response = await api.get(`/documents/download/${documentId}`);
      if (response.data.downloadUrl) {
        window.open(response.data.downloadUrl, '_blank');
      }
    } catch (error) {
      const { message } = handleApiError(error);
      toast({
        title: "Error downloading document",
        description: message,
        variant: "destructive"
      });
    }
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader className="border-b bg-card">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">My Documents</CardTitle>
          <div className="flex items-center gap-3">
            <Select value={selectedTimeFilter} onValueChange={setSelectedTimeFilter}>
              <SelectTrigger className="w-[160px] h-8">
                <SelectValue placeholder="Select time range" />
              </SelectTrigger>
              <SelectContent>
                {timeFilters.map(filter => (
                  <SelectItem key={filter.value} value={filter.value}>
                    {filter.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[160px] h-8">
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map(type => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <type.icon className={cn("h-4 w-4", type.color && `text-${type.color}-500`)} />
                      {type.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {loading ? (
          <div className="flex justify-center py-8">Loading documents...</div>
        ) : documents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No documents found
          </div>
        ) : (
          <div className="space-y-4">
            {documents.map((doc) => (
              <div
                key={doc._id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={cn("rounded-full p-2", getDocumentStyle(doc.documentType))}>
                    {getDocumentIcon(doc.documentType)}
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm">{doc.title}</h4>
                    {doc.description && (
                      <p className="text-sm text-muted-foreground">
                        {doc.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="secondary" 
                        className={cn(
                          "capitalize",
                          doc.documentType && `bg-${doc.documentType}-500/10 text-${doc.documentType}-500`
                        )}
                      >
                        {doc.documentType}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        • {new Date(doc.uploadedAt).toLocaleDateString()}
                      </span>
                      {doc.uploadedBy && (
                        <span className="text-sm text-muted-foreground">
                          • Uploaded by {doc.uploadedBy.name}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownload(doc._id)}
                  className="gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 