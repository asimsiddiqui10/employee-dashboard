import React from 'react';
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import axios from '@/lib/axios';
import { useToast } from "@/hooks/use-toast";

const HoursDownload = ({ timeEntry }) => {
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);

  const handleDownload = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/time-clock/timesheets/${timeEntry._id}/download`, {
        responseType: 'blob'
      });

      // Create a blob from the response data
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `hours-${timeEntry._id}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: "Hours record downloaded successfully",
      });
    } catch (error) {
      console.error('Error downloading hours record:', error);
      toast({
        title: "Error",
        description: "Failed to download hours record",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Only show download button for approved hours records
  if (timeEntry.status !== 'approved') {
    return null;
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleDownload}
      disabled={loading}
      className="flex items-center gap-2"
    >
      <Download className="h-4 w-4" />
      {loading ? "Downloading..." : "Download"}
    </Button>
  );
};

export default HoursDownload; 