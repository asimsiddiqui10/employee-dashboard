import { 
  format, 
  parse, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  addWeeks,
  subWeeks,
  isSameDay,
  isWithinInterval,
  startOfDay,
  endOfDay,
  getDay
} from 'date-fns';

// Format date to display string
export const formatDate = (date, formatStr = 'MMM dd, yyyy') => {
  if (!date) return '';
  return format(new Date(date), formatStr);
};

// Format time to 12-hour format
export const formatTime12Hour = (time24) => {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':');
  const hour = parseInt(hours, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${hour12}:${minutes} ${ampm}`;
};

// Get start of week (Monday as first day - ISO week)
export const getStartOfWeek = (date) => {
  return startOfWeek(date, { weekStartsOn: 1 }); // 1 = Monday
};

// Get end of week (Sunday as last day - ISO week)
export const getEndOfWeek = (date) => {
  return endOfWeek(date, { weekStartsOn: 1 });
};

// Check if a day should be included based on daysOfWeek object
export const isDayEnabled = (date, daysOfWeek) => {
  const dayOfWeek = getDay(date); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  const dayMap = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const dayName = dayMap[dayOfWeek];
  return daysOfWeek && daysOfWeek[dayName] === true;
};

// Get effective dates for a schedule
export const getEffectiveDates = (schedule) => {
  if (schedule.scheduleType === 'specific_dates') {
    return schedule.specificDates
      .filter(sd => sd.enabled)
      .map(sd => new Date(sd.date));
  }
  
  // Calculate from pattern
  const dates = [];
  const excludedSet = new Set(
    (schedule.excludedDates || []).map(d => startOfDay(new Date(d)).getTime())
  );
  
  let current = new Date(schedule.startDate);
  const end = new Date(schedule.endDate);
  
  while (current <= end) {
    const currentTime = startOfDay(current).getTime();
    
    // Skip if excluded
    if (!excludedSet.has(currentTime) && isDayEnabled(current, schedule.daysOfWeek)) {
      dates.push(new Date(current));
    }
    current = addDays(current, 1);
  }
  
  return dates;
};

// Generate week days array (Monday to Sunday or Monday to Friday)
export const generateWeekDays = (startDate, includeWeekends = true) => {
  const days = [];
  const totalDays = includeWeekends ? 7 : 5;
  for (let i = 0; i < totalDays; i++) {
    days.push(addDays(startDate, i));
  }
  return days;
};

// Navigation helpers
export const goToPreviousWeek = (currentDate) => subWeeks(currentDate, 1);
export const goToNextWeek = (currentDate) => addWeeks(currentDate, 1);
export const goToPreviousDay = (currentDate) => addDays(currentDate, -1);
export const goToNextDay = (currentDate) => addDays(currentDate, 1);

export { 
  isSameDay, 
  isWithinInterval, 
  startOfDay, 
  endOfDay, 
  addDays,
  getDay
};

