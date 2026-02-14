import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  LogIn, 
  LogOut, 
  Coffee, 
  RotateCcw,
  Calendar,
  Building2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import api from '@/lib/axios';
import companyLogo from '../assets/ACT New Logo HD.png';

const Timeclock = () => {
  const [employeeId, setEmployeeId] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const [currentTime, setCurrentTime] = useState(new Date());
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Auto-clear messages after success/error
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => {
        setMessage(null);
        setMessageType('');
        if (messageType === 'success') {
          setEmployeeId('');
        }
      }, messageType === 'success' ? 3000 : 5000);
      return () => clearTimeout(timer);
    }
  }, [message, messageType]);

  const handleAction = async (action) => {
    if (!employeeId.trim()) {
      setMessage('Please enter an Employee ID');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      let response;
      let endpoint;
      
      switch (action) {
        case 'clockIn':
          endpoint = '/time-clock/kiosk/clock-in';
          break;
        case 'clockOut':
          endpoint = '/time-clock/kiosk/clock-out';
          break;
        case 'startBreak':
          endpoint = '/time-clock/kiosk/break/start';
          break;
        case 'endBreak':
          endpoint = '/time-clock/kiosk/break/end';
          break;
        default:
          throw new Error('Invalid action');
      }

      response = await api.post(endpoint, {
        employeeId: employeeId.trim()
      });

      if (response.data.success) {
        setMessage(response.data.message);
        setMessageType('success');
      } else {
        setMessage(response.data.message || 'Action failed');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Action error:', error);
      const errorMessage = error.response?.data?.message || 'Action failed. Please try again.';
      setMessage(errorMessage);
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentTime = () => {
    return currentTime.toLocaleTimeString('en-US', {
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const getCurrentDate = () => {
    return currentTime.toLocaleDateString('en-US', {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleLogout = () => {
    logout();
    localStorage.removeItem('token');
    navigate('/timeclock-login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex flex-col items-center justify-center p-6">
      {/* Logout Button */}
      <div className="absolute top-6 right-6 flex items-center gap-4">
        {user && (
          <Badge variant="secondary" className="px-3 py-1 text-xs font-medium bg-white/80 text-slate-700 backdrop-blur-sm">
            {user.name}
          </Badge>
        )}
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleLogout}
          className="h-9 px-3 bg-white/80 backdrop-blur-sm border border-slate-200 hover:bg-white/90 text-slate-700 shadow-sm"
        >
          <LogOut size={16} className="mr-2" />
          Logout
        </Button>
      </div>

      {/* Logo - Smaller and more subtle */}
      <div className="mb-6">
        <img 
          src={companyLogo} 
          alt="American Completion Tools" 
          className="h-12 w-auto mx-auto drop-shadow-sm opacity-90" 
          style={{ maxWidth: '220px' }}
        />
      </div>

      {/* Date and Time Display */}
      <div className="text-center mb-10 space-y-3">
        <div className="flex items-center justify-center gap-2 text-slate-600 dark:text-slate-300">
          <Calendar size={18} />
          <span className="text-lg font-medium tracking-wide">
            {getCurrentDate()}
          </span>
        </div>
        <div className="relative">
          <div className="text-4xl sm:text-5xl font-mono font-bold text-slate-800 dark:text-slate-100 tracking-wider animate-pulse">
            {getCurrentTime()}
          </div>
          <div className="absolute -inset-2 bg-gradient-to-r from-blue-500/20 via-indigo-500/20 to-purple-500/20 blur-xl -z-10 rounded-lg opacity-60"></div>
        </div>
      </div>

      {/* Main Timeclock Card */}
      <Card className="w-full max-w-lg shadow-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-0 ring-1 ring-white/20 dark:ring-slate-700/50 mx-4 relative overflow-hidden">
        {/* Glassmorphism background effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-slate-100/20 dark:from-slate-800/30 dark:to-slate-900/20"></div>
        
        <CardContent className="relative p-6 sm:p-8 space-y-8">
          {/* ID Number Input - More Prominent */}
          <div className="space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                Enter Your ID
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                Please enter your employee identification number
              </p>
            </div>
            <div className="relative">
              <Input
                type="text"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                placeholder="Employee ID"
                className="text-center text-2xl sm:text-3xl py-6 sm:py-8 h-16 sm:h-20 border-3 border-slate-300/50 focus:border-blue-400 focus:ring-blue-400/30 focus:ring-4 rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm transition-all duration-300 font-mono tracking-wider font-bold shadow-lg focus:shadow-xl"
                disabled={loading}
                autoFocus
              />
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 -z-10 blur-sm"></div>
            </div>
          </div>

          {/* Main Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button
              onClick={() => handleAction('clockIn')}
              disabled={loading}
              className="h-14 sm:h-16 text-base sm:text-lg font-semibold bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogIn size={20} className="mr-2" />
              Clock In
            </Button>
            <Button
              onClick={() => handleAction('clockOut')}
              disabled={loading}
              className="h-14 sm:h-16 text-base sm:text-lg font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border-0 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogOut size={20} className="mr-2" />
              Clock Out
            </Button>
          </div>

          {/* Break Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button
              onClick={() => handleAction('startBreak')}
              disabled={loading}
              variant="outline"
              className="h-12 sm:h-14 text-sm sm:text-base font-medium border-2 border-slate-200 hover:border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/20 text-slate-700 dark:text-slate-200 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Coffee size={18} className="mr-2" />
              Start Break
            </Button>
            <Button
              onClick={() => handleAction('endBreak')}
              disabled={loading}
              variant="outline"
              className="h-12 sm:h-14 text-sm sm:text-base font-medium border-2 border-slate-200 hover:border-teal-300 hover:bg-teal-50 dark:hover:bg-teal-950/20 text-slate-700 dark:text-slate-200 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RotateCcw size={18} className="mr-2" />
              End Break
            </Button>
          </div>

          {/* Loading Indicator */}
          {loading && (
            <div className="flex items-center justify-center gap-3 py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
              <span className="text-sm text-slate-600 dark:text-slate-300 font-medium">Processing your request...</span>
            </div>
          )}

          {/* Message Display */}
          {message && (
            <Alert className={`${messageType === 'success' 
              ? 'border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-200' 
              : 'border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/20 dark:text-red-200'
            } text-center rounded-xl border-2`}>
              <div className="flex items-center justify-center gap-3">
                {messageType === 'success' ? (
                  <CheckCircle2 className="text-emerald-600 dark:text-emerald-400" size={22} />
                ) : (
                  <XCircle className="text-red-600 dark:text-red-400" size={22} />
                )}
                <AlertDescription className="text-base font-medium">
                  {message}
                </AlertDescription>
              </div>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="mt-8 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
          Need assistance? Contact your administrator
        </p>
      </div>
    </div>
  );
};

export default Timeclock;
