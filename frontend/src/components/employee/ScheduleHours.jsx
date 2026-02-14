import React, { useState } from 'react';
import { Calendar, Clock, Plus, CalendarDays, List, Grid3X3, Edit, Save, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, isToday, addWeeks, subWeeks } from 'date-fns';
import { toast } from '@/hooks/use-toast';
import api from '@/lib/axios';
import { handleApiError } from '@/utils/errorHandler';

const ScheduleHours = () => {
  const [activeTab, setActiveTab] = useState('week');
  const [viewMode, setViewMode] = useState('calendar');
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [editMode, setEditMode] = useState(false);
  const [weekData, setWeekData] = useState({});
  const [loading, setLoading] = useState(false);

  // Initialize week data structure
  const initializeWeekData = () => {
    const start = startOfWeek(currentWeek, { weekStartsOn: 1 });
    const end = endOfWeek(currentWeek, { weekStartsOn: 1 });
    const days = eachDayOfInterval({ start, end });
    
    const newWeekData = {};
    days.forEach(day => {
      const dateKey = format(day, 'yyyy-MM-dd');
      newWeekData[dateKey] = {
        date: day,
        hours: '8.0',
        enabled: true
      };
    });
    setWeekData(newWeekData);
  };

  const getWeekDays = () => {
    const start = startOfWeek(currentWeek, { weekStartsOn: 1 });
    const end = endOfWeek(currentWeek, { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  };

  const navigateWeek = (direction) => {
    if (direction === 'prev') {
      setCurrentWeek(prev => subWeeks(prev, 1));
    } else {
      setCurrentWeek(prev => addWeeks(currentWeek, 1));
    }
  };

  const handleHoursChange = (dateKey, value) => {
    // Allow decimal input like "8.5" for 8.5 hours
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setWeekData(prev => ({
        ...prev,
        [dateKey]: {
          ...prev[dateKey],
          hours: value
        }
      }));
    }
  };

  const handleToggleDay = (dateKey) => {
    setWeekData(prev => ({
      ...prev,
      [dateKey]: {
        ...prev[dateKey],
        enabled: !prev[dateKey].enabled
      }
    }));
  };

  const calculateWeekTotal = () => {
    return Object.values(weekData).reduce((total, day) => {
      if (day.enabled && day.hours) {
        const hours = parseFloat(day.hours) || 0;
        return total + hours;
      }
      return total;
    }, 0);
  };

  const handleSaveSchedule = async () => {
    try {
      setLoading(true);
      
      const schedules = Object.values(weekData)
        .filter(day => day.enabled && day.hours)
        .map(day => ({
          date: day.date,
          startTime: new Date(day.date.setHours(9, 0, 0, 0)), // Default 9 AM start
          endTime: new Date(day.date.setHours(9 + parseFloat(day.hours), 0, 0, 0)), // Calculate end time
          jobCode: 'General',
          rate: 25, // Default rate
          notes: ''
        }));

      if (schedules.length === 0) {
        toast({
          title: "Error",
          description: "Please add hours for at least one day",
          variant: "destructive",
        });
        return;
      }

      // Create schedules for each day
      for (const schedule of schedules) {
        await api.post('/scheduled-work', schedule);
      }

      toast({
        title: "Success",
        description: "Weekly schedule saved successfully!",
      });
      
      setEditMode(false);
      setWeekData({});
    } catch (error) {
      const { message } = handleApiError(error);
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSet = (hours) => {
    const newWeekData = {};
    Object.keys(weekData).forEach(dateKey => {
      newWeekData[dateKey] = {
        ...weekData[dateKey],
        hours: hours.toString(),
        enabled: true
      };
    });
    setWeekData(newWeekData);
  };

  const weekDays = getWeekDays();

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold">Work Schedule</h1>
            <p className="text-muted-foreground mt-1">
              Schedule your hours for automatic timesheet generation
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {!editMode ? (
            <Button onClick={() => {
              initializeWeekData();
              setEditMode(true);
            }} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add Schedule
            </Button>
          ) : (
            <>
              <Button onClick={handleSaveSchedule} disabled={loading} size="sm">
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : 'Save Schedule'}
              </Button>
              <Button onClick={() => setEditMode(false)} variant="outline" size="sm">
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* View Mode Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button 
              variant={viewMode === 'calendar' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('calendar')}
              className="flex items-center gap-2"
            >
              <Grid3X3 className="h-4 w-4" />
              Calendar View
            </Button>
            <Button 
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="flex items-center gap-2"
            >
              <List className="h-4 w-4" />
              List View
            </Button>
          </div>

          {/* Calendar View Tabs (only show in calendar mode) */}
          {viewMode === 'calendar' && (
            <div className="flex items-center gap-2">
              <Button 
                variant={activeTab === 'day' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('day')}
                className="flex items-center gap-2"
              >
                <Calendar className="h-4 w-4" />
                Day View
              </Button>
              <Button 
                variant={activeTab === 'week' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveTab('week')}
                className="flex items-center gap-2"
              >
                <CalendarDays className="h-4 w-4" />
                Week View
              </Button>
            </div>
          )}
        </div>

        {/* Content Based on View Mode and Active Tab */}
        {viewMode === 'calendar' ? (
          <>
            {activeTab === 'day' && (
              <div className="text-center py-8 text-muted-foreground">
                Day view functionality will be implemented here
              </div>
            )}
            
            {activeTab === 'week' && (
              <div className="space-y-6">
                {/* Week Navigation */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigateWeek('prev')}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => navigateWeek('next')}
                        className="h-8 w-8 p-0"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <h2 className="text-lg font-semibold">
                      Week of {format(weekDays[0], 'MMM d')} - {format(weekDays[6], 'MMM d, yyyy')}
                    </h2>
                  </div>
                </div>

                {/* Weekly Schedule Input */}
                <Card>
                  <CardContent className="p-6">
                                         {editMode && (
                       <div className="mb-4 flex items-center gap-4">
                         <span className="text-sm font-medium text-muted-foreground">Quick Set:</span>
                         <Button onClick={() => handleQuickSet(8)} variant="outline" size="sm">8h</Button>
                         <Button onClick={() => handleQuickSet(8.5)} variant="outline" size="sm">8.5h</Button>
                         <Button onClick={() => handleQuickSet(9)} variant="outline" size="sm">9h</Button>
                         <Button onClick={() => handleQuickSet(10)} variant="outline" size="sm">10h</Button>
                         <Button onClick={() => handleQuickSet(0)} variant="outline" size="sm">Clear All</Button>
                       </div>
                     )}
                    
                    <div className="grid grid-cols-7 gap-4">
                      {weekDays.map((day, index) => {
                        const dateKey = format(day, 'yyyy-MM-dd');
                                                 const dayData = weekData[dateKey] || { hours: '0.0', enabled: false };
                        const isCurrentDay = isToday(day);
                        
                        return (
                          <div key={index} className="text-center">
                            <div className={`text-sm font-medium mb-2 ${
                              isCurrentDay ? 'text-orange-600' : 'text-muted-foreground'
                            }`}>
                              {format(day, 'EEE')}
                            </div>
                            <div className="text-xs text-muted-foreground mb-2">
                              {format(day, 'd MMM')}
                            </div>
                            
                                                         {editMode ? (
                               <div className="space-y-2">
                                 <Input
                                   type="text"
                                   value={dayData.hours}
                                   onChange={(e) => handleHoursChange(dateKey, e.target.value)}
                                   className="w-16 h-8 text-center text-sm mx-auto"
                                   placeholder="8.0"
                                 />
                                 <Button
                                   variant={dayData.enabled ? "default" : "outline"}
                                   size="sm"
                                   onClick={() => handleToggleDay(dateKey)}
                                   className="w-full h-6 text-xs"
                                 >
                                   {dayData.enabled ? "Enabled" : "Disabled"}
                                 </Button>
                               </div>
                             ) : (
                               <div className="flex items-center justify-center gap-1">
                                 <span className="text-sm font-semibold">{dayData.hours}</span>
                                 <Clock className="h-3 w-3 text-muted-foreground" />
                               </div>
                             )}
                            
                            {isCurrentDay && (
                              <div className="w-full h-0.5 bg-orange-500 mt-2"></div>
                            )}
                          </div>
                        );
                      })}
                      
                      {/* Week Total */}
                      <div className="text-center border-l pl-4">
                        <div className="text-sm font-medium text-muted-foreground mb-1">
                          Week total
                        </div>
                        <div className="text-lg font-bold">
                          {calculateWeekTotal().toFixed(2)}h
                        </div>
                        {editMode && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setWeekData({})}
                            className="mt-2 h-6 w-6 p-0 text-red-500 hover:text-red-700"
                          >
                            ×
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            List view functionality will be implemented here
          </div>
        )}
      </div>
    </div>
  );
};

export default ScheduleHours; 