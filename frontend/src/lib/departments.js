import { 
  Code, 
  Factory, 
  Building2, 
  Users, 
  Store, 
  HelpCircle 
} from 'lucide-react';

export const departments = {
  Engineering: {
    icon: Code,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/50',
    label: 'Engineering'
  },
  Production: {
    icon: Factory,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/50',
    label: 'Production'
  },
  Administration: {
    icon: Building2,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/50',
    label: 'Administration'
  },
  Management: {
    icon: Users,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/50',
    label: 'Management'
  },
  Sales: {
    icon: Store,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/50',
    label: 'Sales'
  },
  Other: {
    icon: HelpCircle,
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-900/50',
    label: 'Other'
  }
};

export const getDepartmentConfig = (department) => {
  return departments[department] || departments.Other;
}; 