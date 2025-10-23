import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Copy, X } from 'lucide-react';
import api from '../../lib/axios';
import { useToast } from "@/hooks/use-toast";

// Utility function to convert 24-hour time to 12-hour format
const formatTime12Hour = (time24) => {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${hour12}:${minutes} ${ampm}`;
};

const TemplateManagement = ({ open, onClose, jobCodes = [] }) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    jobCode: '',
    daysOfWeek: {
      monday: true,
      tuesday: true,
      wednesday: true,
      thursday: true,
      friday: true,
      saturday: false,
      sunday: false
    },
    hoursPerDay: '8',
    startTime: '09:00',
    endTime: '17:00',
    notes: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      fetchTemplates();
    }
  }, [open]);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await api.get('/schedule-templates');
      setTemplates(response.data);
    } catch (error) {
      console.error('Error fetching templates:', error);
      toast({
        title: "Error",
        description: "Failed to load templates",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      jobCode: '',
      daysOfWeek: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false
      },
      hoursPerDay: '8',
      startTime: '09:00',
      endTime: '17:00',
      notes: ''
    });
    setEditingTemplate(null);
  };

  const handleEdit = (template) => {
    setEditingTemplate(template);
    setFormData({
      name: template.name,
      description: template.description || '',
      jobCode: template.jobCode || '',
      daysOfWeek: template.daysOfWeek || {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false
      },
      hoursPerDay: template.hoursPerDay.toString(),
      startTime: template.startTime,
      endTime: template.endTime,
      notes: template.notes || ''
    });
    setShowForm(true);
  };

  const handleDuplicate = async (template) => {
    try {
      await api.post(`/schedule-templates/${template._id}/duplicate`);
      toast({
        title: "Success",
        description: "Template duplicated successfully"
      });
      fetchTemplates();
    } catch (error) {
      console.error('Error duplicating template:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to duplicate template",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      await api.delete(`/schedule-templates/${id}`);
      toast({
        title: "Success",
        description: "Template deleted successfully"
      });
      fetchTemplates();
    } catch (error) {
      console.error('Error deleting template:', error);
      toast({
        title: "Error",
        description: "Failed to delete template",
        variant: "destructive"
      });
    }
  };

  const validateTimeRange = () => {
    const startTime = formData.startTime;
    const endTime = formData.endTime;
    
    if (!startTime || !endTime) return true;
    
    const startMinutes = parseInt(startTime.split(':')[0]) * 60 + parseInt(startTime.split(':')[1]);
    const endMinutes = parseInt(endTime.split(':')[0]) * 60 + parseInt(endTime.split(':')[1]);
    
    return endMinutes > startMinutes;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.hoursPerDay || !formData.startTime || !formData.endTime) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    if (!validateTimeRange()) {
      toast({
        title: "Error",
        description: "End time must be after start time",
        variant: "destructive"
      });
      return;
    }

    try {
      if (editingTemplate) {
        await api.put(`/schedule-templates/${editingTemplate._id}`, formData);
        toast({
          title: "Success",
          description: "Template updated successfully"
        });
      } else {
        await api.post('/schedule-templates', formData);
        toast({
          title: "Success",
          description: "Template created successfully"
        });
      }
      
      fetchTemplates();
      setShowForm(false);
      resetForm();
    } catch (error) {
      console.error('Error saving template:', error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to save template",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schedule Templates (Company Defaults)</DialogTitle>
          <DialogDescription>
            Create and manage reusable schedule templates. Job codes are optional.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Create Template Button */}
          {!showForm && (
            <div className="flex justify-end">
              <Button onClick={() => setShowForm(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create Template
              </Button>
            </div>
          )}

          {/* Template Form */}
          {showForm && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>{editingTemplate ? 'Edit Template' : 'Create New Template'}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setShowForm(false);
                      resetForm();
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Template Name */}
                  <div className="space-y-2">
                    <Label htmlFor="name">Template Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g., Standard 9-5, Part-Time Evening"
                      required
                    />
                  </div>

                  {/* Description */}
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Brief description of this template"
                    />
                  </div>

                  {/* Job Code (Optional) */}
                  <div className="space-y-2">
                    <Label htmlFor="jobCode">Job Code (Optional)</Label>
                    <Select
                      value={formData.jobCode || "none"}
                      onValueChange={(value) => setFormData({ ...formData, jobCode: value === "none" ? "" : value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select job code (optional)" />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        <SelectItem value="none">-- No Job Code --</SelectItem>
                        {jobCodes.map(jc => (
                          <SelectItem key={jc._id || jc.code} value={jc.code}>
                            <div className="flex flex-col">
                              <span className="font-medium">{jc.code}</span>
                              {jc.description && (
                                <span className="text-xs text-muted-foreground">{jc.description}</span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">
                      Leave empty if this template can be used with any job code
                    </p>
                  </div>

                  {/* Time Configuration */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="hoursPerDay">Hours Per Day *</Label>
                      <Input
                        id="hoursPerDay"
                        type="number"
                        min="0"
                        max="24"
                        step="0.5"
                        value={formData.hoursPerDay}
                        onChange={(e) => setFormData({ ...formData, hoursPerDay: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="startTime">Start Time *</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        required
                        className={!validateTimeRange() && formData.startTime && formData.endTime ? "border-red-500" : ""}
                      />
                      {!validateTimeRange() && formData.startTime && formData.endTime && (
                        <p className="text-sm text-red-600">End time must be after start time</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endTime">End Time *</Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        required
                        className={!validateTimeRange() && formData.startTime && formData.endTime ? "border-red-500" : ""}
                      />
                    </div>
                  </div>

                  {/* Days of Week */}
                  <div className="space-y-3">
                    <Label>Days of Week</Label>
                    <div className="flex gap-2">
                      {[
                        { key: 'monday', label: 'M' },
                        { key: 'tuesday', label: 'T' },
                        { key: 'wednesday', label: 'W' },
                        { key: 'thursday', label: 'T' },
                        { key: 'friday', label: 'F' },
                        { key: 'saturday', label: 'S' },
                        { key: 'sunday', label: 'S' }
                      ].map(({ key, label }) => (
                        <div key={key} className="flex flex-col items-center gap-1">
                          <Label htmlFor={key} className="text-xs text-muted-foreground cursor-pointer">
                            {label}
                          </Label>
                          <Checkbox
                            id={key}
                            checked={formData.daysOfWeek[key]}
                            onCheckedChange={(checked) => setFormData({
                              ...formData,
                              daysOfWeek: {
                                ...formData.daysOfWeek,
                                [key]: checked
                              }
                            })}
                          />
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      M T W T F are selected by default
                    </p>
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="Additional notes about this template..."
                      rows={3}
                    />
                  </div>

                  {/* Actions */}
                  <div className="flex justify-end gap-2 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowForm(false);
                        resetForm();
                      }}
                    >
                      Cancel
                    </Button>
                    <Button type="submit">
                      {editingTemplate ? 'Update' : 'Create'} Template
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Templates Table */}
          <Card>
            <CardHeader>
              <CardTitle>Existing Templates</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Loading templates...</div>
              ) : templates.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No templates created yet. Create your first template above.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Job Code</TableHead>
                        <TableHead>Hours/Day</TableHead>
                        <TableHead>Time</TableHead>
                        <TableHead>Days</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {templates.map((template) => (
                        <TableRow key={template._id}>
                          <TableCell className="font-medium">{template.name}</TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {template.description || '-'}
                          </TableCell>
                          <TableCell>
                            {template.jobCode ? (
                              <Badge variant="secondary">{template.jobCode}</Badge>
                            ) : (
                              <span className="text-sm text-muted-foreground">Any</span>
                            )}
                          </TableCell>
                          <TableCell>{template.hoursPerDay}h</TableCell>
                          <TableCell className="text-sm">
                            {formatTime12Hour(template.startTime)} - {formatTime12Hour(template.endTime)}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1 text-xs">
                              {template.daysOfWeek?.monday && <span>M</span>}
                              {template.daysOfWeek?.tuesday && <span>T</span>}
                              {template.daysOfWeek?.wednesday && <span>W</span>}
                              {template.daysOfWeek?.thursday && <span>T</span>}
                              {template.daysOfWeek?.friday && <span>F</span>}
                              {template.daysOfWeek?.saturday && <span>S</span>}
                              {template.daysOfWeek?.sunday && <span>S</span>}
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEdit(template)}
                                title="Edit template"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDuplicate(template)}
                                title="Duplicate template"
                              >
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(template._id)}
                                title="Delete template"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TemplateManagement;

