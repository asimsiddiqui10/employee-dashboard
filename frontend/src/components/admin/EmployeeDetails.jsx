import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '@/lib/axios';
import { handleApiError } from '@/utils/errorHandler';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { Upload, User, ArrowLeft, Pencil, Trash2, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const EmployeeDetails = () => {
  const { employeeId } = useParams();
  const navigate = useNavigate();
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [documents, setDocuments] = useState({
    personal: [],
    payroll: [],
    company: [],
    onboarding: [],
    benefits: [],
    training: []
  });

  useEffect(() => {
    fetchEmployeeDetails();
    fetchAllDocuments();
  }, [employeeId]);

  const fetchEmployeeDetails = async () => {
    try {
      const response = await api.get(`/employees/${employeeId}`);
      setEmployee(response.data);
      setLoading(false);
    } catch (error) {
      const { message } = handleApiError(error);
      setError(message);
      setLoading(false);
    }
  };

  const fetchAllDocuments = async () => {
    try {
      const response = await api.get(`/documents/employee/${employeeId}`);
      // Group documents by type
      const grouped = response.data.reduce((acc, doc) => {
        if (!acc[doc.documentType]) acc[doc.documentType] = [];
        acc[doc.documentType].push(doc);
        return acc;
      }, {
        personal: [],
        payroll: [],
        company: [],
        onboarding: [],
        benefits: [],
        training: []
      });
      setDocuments(grouped);
    } catch (error) {
      const { message } = handleApiError(error);
      console.error(message);
    }
  };

  const handleDownload = async (documentId, fileName) => {
    try {
      const response = await api.get(`/documents/download/${documentId}`, {
        responseType: 'blob'
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      const { message } = handleApiError(error);
      console.error(message);
    }
  };

  const DocumentList = ({ documents }) => (
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
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDownload(doc._id, doc.fileName)}
          >
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
        </div>
      ))}
      {documents.length === 0 && (
        <p className="text-gray-500 text-center py-4">No documents found</p>
      )}
    </div>
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <Button
        variant="ghost"
        onClick={() => navigate(-1)}
        className="mb-6"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back
      </Button>

      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Avatar className="h-20 w-20">
            {employee?.profileImage ? (
              <AvatarImage src={employee.profileImage} alt={employee.name} />
            ) : (
              <AvatarFallback>
                <User className="h-10 w-10" />
              </AvatarFallback>
            )}
          </Avatar>
          <div>
            <h1 className="text-2xl font-bold">{employee?.name}</h1>
            <p className="text-gray-500">{employee?.employeeId}</p>
          </div>
        </div>
        <div className="space-x-2">
          <Button onClick={() => navigate(`/admin-dashboard/employees/edit/${employeeId}`)}>
            <Pencil className="mr-2 h-4 w-4" />
            Edit
          </Button>
          <Button variant="destructive" onClick={() => setShowDeleteModal(true)}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList>
          <TabsTrigger value="personal">Personal</TabsTrigger>
          <TabsTrigger value="work">Work</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="benefits">Benefits</TabsTrigger>
          <TabsTrigger value="training">Training</TabsTrigger>
        </TabsList>

        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Full Name</Label>
                  <p className="text-gray-700">{employee?.name}</p>
                </div>
                <div>
                  <Label>Email</Label>
                  <p className="text-gray-700">{employee?.email}</p>
                </div>
                <div>
                  <Label>Phone</Label>
                  <p className="text-gray-700">{employee?.phone}</p>
                </div>
                <div>
                  <Label>Address</Label>
                  <p className="text-gray-700">{employee?.address}</p>
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold mb-4">Personal Documents</h3>
                <DocumentList documents={documents.personal} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="work">
          <Card>
            <CardHeader>
              <CardTitle>Work Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Department</Label>
                  <p className="text-gray-700">{employee?.department}</p>
                </div>
                <div>
                  <Label>Position</Label>
                  <p className="text-gray-700">{employee?.position}</p>
                </div>
                <div>
                  <Label>Join Date</Label>
                  <p className="text-gray-700">
                    {new Date(employee?.joinDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge>{employee?.status}</Badge>
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold mb-4">Onboarding Documents</h3>
                <DocumentList documents={documents.onboarding} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payroll">
          <Card>
            <CardHeader>
              <CardTitle>Payroll Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <DocumentList documents={documents.payroll} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader>
              <CardTitle>Company Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <DocumentList documents={documents.company} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="benefits">
          <Card>
            <CardHeader>
              <CardTitle>Benefits Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Health Insurance</Label>
                  <p className="text-gray-700">{employee?.benefits?.healthInsurance}</p>
                </div>
                <div>
                  <Label>Retirement Plan</Label>
                  <p className="text-gray-700">{employee?.benefits?.retirementPlan}</p>
                </div>
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold mb-4">Benefits Documents</h3>
                <DocumentList documents={documents.benefits} />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="training">
          <Card>
            <CardHeader>
              <CardTitle>Training Documents</CardTitle>
            </CardHeader>
            <CardContent>
              <DocumentList documents={documents.training} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <DeleteConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={() => {/* Add delete logic */}}
      />
    </div>
  );
};

export default EmployeeDetails; 