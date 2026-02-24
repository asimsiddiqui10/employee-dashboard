import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Badge } from '../components/ui/badge';
import { Separator } from '../components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  LogIn, 
  LogOut, 
  Coffee, 
  RotateCcw,
  Calendar,
  Building2,
  User,
  Timer,
  Activity,
  Loader2
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
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header Navigation Bar - matching dashboard */}
      <nav className="flex h-16 shrink-0 items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Timer size={20} className="text-primary" />
            <h2 className="text-lg font-semibold">Timeclock Kiosk</h2>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Building2 size={20} className="text-muted-foreground" />
          <h1 className="text-lg font-semibold hidden sm:block">American Completion Tools</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Calendar size={16} />
            <span className="hidden sm:inline">{getCurrentDate()}</span>
            <Separator orientation="vertical" className="h-4" />
            <Clock size={16} />
            <span className="font-mono tabular-nums">{getCurrentTime()}</span>
          </div>
          {user && (
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="gap-1">
                <User size={12} />
                {user.name}
              </Badge>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={handleLogout}
                className="flex items-center gap-2"
              >
                <LogOut size={16} />
                Logout
              </Button>
            </div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-2xl">
          {/* Company Logo */}
          <div className="text-center mb-8">
            <img 
              src={companyLogo} 
              alt="American Completion Tools" 
              className="h-20 w-auto mx-auto mb-4" 
            />
          </div>

          {/* Main Kiosk Card */}
          <Card className="border shadow-lg">
            <CardHeader className="text-center space-y-2">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Activity className="text-primary" size={28} />
                <CardTitle className="text-2xl">Employee Time Clock</CardTitle>
              </div>
              <CardDescription className="text-base">
                Enter your employee ID and select your desired action
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {/* ID Input Section */}
              <div className="space-y-4">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">Employee ID</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Please enter your identification number
                  </p>
                </div>
                
                <Input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="Enter Employee ID"
                  className="text-center text-xl h-16 font-mono tracking-wider font-semibold border-2"
                  disabled={loading}
                  autoFocus
                />
              </div>

              <Separator />

              {/* Action Buttons Grid */}
              <div className="space-y-4">
                <div className="text-center mb-4">
                  <h3 className="text-lg font-semibold">Select Action</h3>
                </div>
                
                {/* Primary Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button
                    onClick={() => handleAction('clockIn')}
                    disabled={loading}
                    size="lg"
                    className="h-16 text-lg font-semibold bg-green-600 hover:bg-green-700"
                  >
                    <LogIn size={24} className="mr-3" />
                    Clock In
                  </Button>
                  
                  <Button
                    onClick={() => handleAction('clockOut')}
                    disabled={loading}
                    size="lg"
                    variant="destructive"
                    className="h-16 text-lg font-semibold"
                  >
                    <LogOut size={24} className="mr-3" />
                    Clock Out
                  </Button>
                </div>

                {/* Break Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Button
                    onClick={() => handleAction('startBreak')}
                    disabled={loading}
                    size="lg"
                    variant="outline"
                    className="h-14 text-base font-medium border-2 hover:bg-orange-50 hover:border-orange-200"
                  >
                    <Coffee size={20} className="mr-2" />
                    Start Break
                  </Button>
                  
                  <Button
                    onClick={() => handleAction('endBreak')}
                    disabled={loading}
                    size="lg"
                    variant="outline" 
                    className="h-14 text-base font-medium border-2 hover:bg-blue-50 hover:border-blue-200"
                  >
                    <RotateCcw size={20} className="mr-2" />
                    End Break
                  </Button>
                </div>
              </div>

              {/* Loading State */}
              {loading && (
                <div className="flex items-center justify-center gap-3 py-6">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="text-base font-medium">Processing your request...</span>
                </div>
              )}

              {/* Message Display */}
              {message && (
                <Alert variant={messageType === 'success' ? 'default' : 'destructive'}>
                  <div className="flex items-center gap-2">
                    {messageType === 'success' ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <XCircle className="h-5 w-5" />
                    )}
                    <AlertDescription className="text-base font-medium">
                      {message}
                    </AlertDescription>
                  </div>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Help Footer */}
          <div className="text-center mt-8">
            <p className="text-sm text-muted-foreground">
              Having trouble? Contact your supervisor or IT support for assistance.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Timeclock;
