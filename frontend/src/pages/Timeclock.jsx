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
    <div className="min-h-screen bg-background">
      {/* Simple Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">Timeclock</span>
          </div>
          
          <div className="text-xs font-mono text-muted-foreground tabular-nums">
            {getCurrentTime()}
          </div>
          
          {user && (
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto space-y-6">
          
          {/* Logo */}
          <div className="text-center">
            <img 
              src={companyLogo} 
              alt="American Completion Tools" 
              className="h-12 w-auto mx-auto" 
            />
          </div>

          {/* Main Card */}
          <Card>
            <CardHeader className="text-center pb-4">
              <CardTitle className="text-xl">Employee Time Clock</CardTitle>
              <CardDescription>
                Enter your ID and select an action
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-6">
              
              {/* Employee ID Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Employee ID</label>
                <Input
                  type="text"
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  placeholder="Enter your ID"
                  className="text-center h-12 font-mono"
                  disabled={loading}
                  autoFocus
                />
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3">
                <Button
                  onClick={() => handleAction('clockIn')}
                  disabled={loading}
                  className="h-12"
                >
                  <LogIn className="h-4 w-4 mr-2" />
                  Clock In
                </Button>
                
                <Button
                  onClick={() => handleAction('clockOut')}
                  disabled={loading}
                  variant="destructive"
                  className="h-12"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Clock Out
                </Button>
                
                <Button
                  onClick={() => handleAction('startBreak')}
                  disabled={loading}
                  variant="outline"
                  className="h-10"
                >
                  <Coffee className="h-4 w-4 mr-2" />
                  Start Break
                </Button>
                
                <Button
                  onClick={() => handleAction('endBreak')}
                  disabled={loading}
                  variant="outline"
                  className="h-10"
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  End Break
                </Button>
              </div>

              {/* Loading */}
              {loading && (
                <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing...
                </div>
              )}

              {/* Messages */}
              {message && (
                <Alert variant={messageType === 'success' ? 'default' : 'destructive'}>
                  <AlertDescription>{message}</AlertDescription>
                </Alert>
              )}
              
            </CardContent>
          </Card>

          {/* Footer */}
          <p className="text-center text-xs text-muted-foreground">
            Need help? Contact your supervisor
          </p>
          
        </div>
      </main>
    </div>
  );
};

export default Timeclock;
