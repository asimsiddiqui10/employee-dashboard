import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FileText, Building2, GraduationCap, Heart, FileCheck, AlertCircle, Download, Folder, ArrowLeft, DollarSign } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import api from '@/lib/axios';
import { handleApiError } from '@/utils/errorHandler';
import { toast } from '@/hooks/use-toast';
import { cn } from "@/lib/utils";

const documentTypes = [
  { value: 'payroll', label: 'Payroll', icon: DollarSign, color: "green" },
  { value: 'onboarding', label: 'Onboarding', icon: FileCheck, color: "blue" },
  { value: 'personal', label: 'Personal', icon: FileText, color: "purple" },
  { value: 'company', label: 'Company', icon: Building2, color: "indigo" },
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
    payroll: "bg-green-500/10 text-green-500 border-green-200",
    onboarding: "bg-blue-500/10 text-blue-500 border-blue-200",
    personal: "bg-purple-500/10 text-purple-500 border-purple-200",
    company: "bg-indigo-500/10 text-indigo-500 border-indigo-200",
    training: "bg-yellow-500/10 text-yellow-500 border-yellow-200",
    benefits: "bg-red-500/10 text-red-500 border-red-200"
  };
  return styles[type] || "bg-gray-500/10 text-gray-500 border-gray-200";
};

export default function MyDocuments() {
  // Navigation state
  const [currentView, setCurrentView] = useState('folders'); // 'folders' or 'documents'
  const [selectedFolder, setSelectedFolder] = useState(null);

  // Data state
  const [documents, setDocuments] = useState([]);
  const [filteredDocuments, setFilteredDocuments] = useState([]);
  const [documentCounts, setDocumentCounts] = useState({});
  const [selectedTimeFilter, setSelectedTimeFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentView === 'folders') {
      fetchAllDocumentCounts();
    } else if (selectedFolder) {
      fetchDocumentsForFolder();
    }
  }, [currentView, selectedFolder, selectedTimeFilter]);

  const fetchAllDocumentCounts = async () => {
    try {
      setLoading(true);
      const counts = {};
      
      // Fetch counts for each document type
      const fetchPromises = documentTypes.map(async (type) => {
        try {
          let response;
          if (type.value === 'payroll') {
            response = await api.get('/payroll/my-documents');
          } else {
            response = await api.get(`/documents/type/${type.value}`);
          }
          counts[type.value] = response.data.length;
        } catch (error) {
          counts[type.value] = 0;
        }
      });

      await Promise.all(fetchPromises);
      setDocumentCounts(counts);
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

  const fetchDocumentsForFolder = async () => {
    try {
      setLoading(true);
      let response;
      
      if (selectedFolder === 'payroll') {
        response = await api.get('/payroll/my-documents');
      } else {
        response = await api.get(`/documents/type/${selectedFolder}`, {
          params: { timeFilter: selectedTimeFilter }
        });
      }
      
      setDocuments(response.data);
      setFilteredDocuments(response.data);
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
      let response;
      if (selectedFolder === 'payroll') {
        response = await api.get(`/payroll/download/${documentId}`);
      } else {
        response = await api.get(`/documents/download/${documentId}`);
      }
      
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

  const renderFoldersView = () => (
    <div className="space-y-6">
      <Card>
        <CardContent className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {documentTypes.map((type) => (
                <Card 
                  key={type.value} 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => {
                    setSelectedFolder(type.value);
                    setCurrentView('documents');
                  }}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <div className={cn("rounded-full p-2", getDocumentStyle(type.value))}>
                        <type.icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1">
                        <div className="font-medium">{type.label}</div>
                        <div className="text-sm text-muted-foreground">
                          {documentCounts[type.value] || 0} documents
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const renderDocumentsView = () => {
    const folderInfo = documentTypes.find(type => type.value === selectedFolder);

  return (
      <div className="space-y-6">
        {/* Header with back button */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
            <div className="flex items-center gap-4">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentView('folders')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Folders
              </Button>
          <div className="flex items-center gap-3">
                <div className={cn("rounded-full p-2", getDocumentStyle(selectedFolder))}>
                  <folderInfo.icon className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold">{folderInfo.label}</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    {filteredDocuments.length} documents
                  </p>
                </div>
              </div>
            </div>
            {selectedFolder !== 'payroll' && (
            <Select value={selectedTimeFilter} onValueChange={setSelectedTimeFilter}>
                <SelectTrigger className="w-[160px]">
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
            )}
      </CardHeader>
        </Card>

        {/* Documents Display */}
        <Card>
      <CardContent className="p-6">
        {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : filteredDocuments.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-muted-foreground mb-2">No documents found</h3>
                <p className="text-sm text-muted-foreground">
                  No {folderInfo.label.toLowerCase()} documents available yet.
                </p>
          </div>
        ) : (
          <div className="space-y-4">
                {filteredDocuments.map((doc) => (
              <div
                key={doc._id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                      <div className={cn("rounded-full p-2", getDocumentStyle(selectedFolder))}>
                        <folderInfo.icon className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-medium text-sm">{doc.title}</h4>
                    {doc.description && (
                      <p className="text-sm text-muted-foreground">
                        {doc.description}
                      </p>
                    )}
                        {selectedFolder === 'payroll' && doc.payPeriodStart && doc.payPeriodEnd && (
                          <p className="text-sm text-muted-foreground">
                            Pay Period: {new Date(doc.payPeriodStart).toLocaleDateString()} - {new Date(doc.payPeriodEnd).toLocaleDateString()}
                          </p>
                        )}
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="secondary" 
                            className={cn("capitalize", getDocumentStyle(selectedFolder))}
                      >
                            {folderInfo.label}
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
      </div>
    );
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader className="border-b bg-card">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <FileText className="h-5 w-5" />
          My Documents
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        {currentView === 'folders' ? renderFoldersView() : renderDocumentsView()}
      </CardContent>
    </Card>
  );
} 