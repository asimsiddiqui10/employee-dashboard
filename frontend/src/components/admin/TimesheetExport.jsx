import React from 'react';
import { Button } from "@/components/ui/button";
import { 
  FileSpreadsheet, 
  FileText, 
  Download,
  FileDown
} from "lucide-react";
import api from '@/lib/axios';
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format } from 'date-fns';

const TimesheetExport = ({ 
  data,
  filters,
  isLoading,
  onExportStart,
  onExportComplete 
}) => {
  const { toast } = useToast();
  const [showDialog, setShowDialog] = React.useState(false);
  const [selectedFormat, setSelectedFormat] = React.useState(null);

  const handleExport = async (format) => {
    try {
      setSelectedFormat(format);
      onExportStart?.();

      // Get the current date for filename
      const dateStr = format(new Date(), 'yyyy-MM-dd');
      
      // Build filename based on filters
      let filename = `timesheets_${dateStr}`;
      if (filters?.startDate && filters?.endDate) {
        filename = `timesheets_${filters.startDate}_to_${filters.endDate}`;
      }
      if (filters?.department && filters.department !== 'all') {
        filename += `_${filters.department}`;
      }
      
      const response = await api.get('/time-clock/timesheets/export', {
        params: {
          ...filters,
          format,
        },
        responseType: 'blob'
      });

      // Determine file type and extension
      const fileTypes = {
        pdf: 'application/pdf',
        excel: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        csv: 'text/csv'
      };
      const fileExtensions = {
        pdf: 'pdf',
        excel: 'xlsx',
        csv: 'csv'
      };

      // Create and download file
      const blob = new Blob([response.data], { type: fileTypes[format] });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}.${fileExtensions[format]}`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: `Timesheets exported successfully as ${format.toUpperCase()}`,
      });

      setShowDialog(false);
    } catch (error) {
      console.error('Error exporting timesheets:', error);
      toast({
        title: "Error",
        description: `Failed to export timesheets as ${format.toUpperCase()}`,
        variant: "destructive",
      });
    } finally {
      setSelectedFormat(null);
      onExportComplete?.();
    }
  };

  const getExportSummary = () => {
    let summary = `${data.length} timesheet${data.length !== 1 ? 's' : ''}`;
    
    if (filters?.startDate && filters?.endDate) {
      summary += ` from ${format(new Date(filters.startDate), 'MMM d, yyyy')} to ${format(new Date(filters.endDate), 'MMM d, yyyy')}`;
    }
    
    if (filters?.department && filters.department !== 'all') {
      summary += ` in ${filters.department} department`;
    }
    
    if (filters?.status && filters.status !== 'all') {
      summary += ` with status "${filters.status}"`;
    }

    return summary;
  };

  return (
    <Dialog open={showDialog} onOpenChange={setShowDialog}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isLoading || data.length === 0}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          <span>Export</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Export Timesheets</DialogTitle>
          <DialogDescription>
            Export {getExportSummary()}
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 gap-4 py-4">
          <Button
            variant="outline"
            onClick={() => handleExport('pdf')}
            disabled={isLoading || selectedFormat}
            className="flex items-center justify-start gap-2 h-20"
          >
            <FileText className="h-8 w-8 text-red-500" />
            <div className="text-left">
              <div className="font-semibold">PDF Document</div>
              <div className="text-sm text-muted-foreground">
                Export as a formatted PDF with company logo
              </div>
            </div>
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport('excel')}
            disabled={isLoading || selectedFormat}
            className="flex items-center justify-start gap-2 h-20"
          >
            <FileSpreadsheet className="h-8 w-8 text-green-500" />
            <div className="text-left">
              <div className="font-semibold">Excel Spreadsheet</div>
              <div className="text-sm text-muted-foreground">
                Export as Excel with formulas and formatting
              </div>
            </div>
          </Button>
          <Button
            variant="outline"
            onClick={() => handleExport('csv')}
            disabled={isLoading || selectedFormat}
            className="flex items-center justify-start gap-2 h-20"
          >
            <FileDown className="h-8 w-8 text-blue-500" />
            <div className="text-left">
              <div className="font-semibold">CSV File</div>
              <div className="text-sm text-muted-foreground">
                Export as CSV for data processing
              </div>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TimesheetExport; 