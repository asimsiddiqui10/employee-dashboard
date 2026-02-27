import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import companyLogo from '../assets/ACT New Logo HD.png';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Badge } from '../components/ui/badge';
import { Separator } from "../components/ui/separator";
import { 
  Clock, 
  ArrowLeft, 
  LogIn, 
  Mail, 
  Lock,
  Calendar,
  Shield,
  Building2
} from 'lucide-react';
import { handleApiError } from '@/utils/errorHandler';
import { ThemeToggle } from "@/components/ui/theme-toggle";

const TimeclockLogin = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [currentTime, setCurrentTime] = useState(new Date());
    const { login, user } = useAuth();
    const navigate = useNavigate();

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // If user is already logged in and is admin, redirect to timeclock
    useEffect(() => {
        if (user) {
            const userRoles = user.roles || (user.role ? [user.role] : []);
            const isAdmin = userRoles.includes('admin') || user.role === 'admin';
            
            if (isAdmin) {
                navigate('/timeclock');
            } else {
                setError('Only administrators can access the timeclock system');
            }
        }
    }, [user, navigate]);

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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        
        try {
            const response = await api.post('/auth/login', { 
                email, 
                password 
            });
            
            if (response.data.token) {
                const userData = response.data.user;
                const userRoles = userData.roles || (userData.role ? [userData.role] : []);
                const isAdmin = userRoles.includes('admin') || userData.role === 'admin';
                
                if (!isAdmin) {
                    setError('Only administrators can access the timeclock system');
                    setLoading(false);
                    return;
                }

                // Mark this as a kiosk session
                localStorage.setItem('kioskSession', 'true');

                // Login the user for kiosk-only access
                login(userData);
                localStorage.setItem('token', response.data.token);
                
                // Redirect to timeclock page
                navigate('/timeclock');
            } else {
                const { message } = handleApiError(response.data);
                setError(message);
            }
        } catch (error) {
            console.error('Login error:', error);
            const { message } = handleApiError(error);
            setError(message);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header Navigation Bar - matching dashboard */}
            <nav className="flex h-16 shrink-0 items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
                <div className="flex items-center gap-4">
                    <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => navigate('/login')}
                        className="flex items-center gap-2"
                    >
                        <ArrowLeft size={16} />
                        Back to Login
                    </Button>
                </div>
                
                <div className="flex items-center gap-2">
                    <Building2 size={20} className="text-muted-foreground" />
                    <h1 className="text-lg font-semibold">American Completion Tools</h1>
                </div>

                <div className="flex items-center gap-4">
                    <Badge variant="secondary" className="gap-2">
                        <Shield size={14} />
                        Admin Access
                    </Badge>
                    <ThemeToggle />
                </div>
            </nav>

            {/* Main Content */}
            <div className="flex-1 flex items-center justify-center p-6">
                <div className="w-full max-w-md">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <img 
                            src={companyLogo} 
                            alt="American Completion Tools" 
                            className="h-16 w-auto mx-auto mb-4" 
                        />
                        <div className="space-y-1">
                            <div className="flex items-center justify-center gap-2 text-muted-foreground text-sm">
                                <Calendar size={14} />
                                <span>{getCurrentDate()}</span>
                            </div>
                            <div className="text-2xl font-mono font-semibold tracking-wider">
                                {getCurrentTime()}
                            </div>
                        </div>
                    </div>

                    {/* Login Card */}
                    <Card className="border shadow-sm">
                        <CardHeader className="space-y-1">
                            <div className="flex items-center justify-center gap-2">
                                <Clock className="text-primary" size={24} />
                                <CardTitle className="text-xl">Timeclock Access</CardTitle>
                            </div>
                            <CardDescription className="text-center">
                                Administrator credentials required for timeclock system access
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {/* Error Display */}
                            {error && (
                                <Alert variant="destructive">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            {/* Login Form */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="email" className="flex items-center gap-2">
                                        <Mail size={16} />
                                        Email Address
                                    </Label>
                                    <Input
                                        type="email"
                                        id="email"
                                        placeholder="Enter your admin email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        disabled={loading}
                                        className="h-11"
                                    />
                                </div>
                                
                                <div className="space-y-2">
                                    <Label htmlFor="password" className="flex items-center gap-2">
                                        <Lock size={16} />
                                        Password
                                    </Label>
                                    <Input
                                        type="password"
                                        id="password"
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                        disabled={loading}
                                        className="h-11"
                                    />
                                </div>

                                <Separator className="my-4" />

                                <Button 
                                    type="submit" 
                                    disabled={loading}
                                    className="w-full h-11"
                                    size="default"
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-2">
                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent"></div>
                                            Authenticating...
                                        </div>
                                    ) : (
                                        <>
                                            <LogIn size={16} className="mr-2" />
                                            Access Timeclock System
                                        </>
                                    )}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>

                    {/* Footer */}
                    <div className="text-center mt-6 text-sm text-muted-foreground">
                        Need help? Contact{' '}
                        <a 
                            href="mailto:support@americancompletiontools.com" 
                            className="text-primary hover:underline"
                        >
                            support@americancompletiontools.com
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TimeclockLogin;
