import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import companyLogo from '../assets/ACT New Logo HD.png';
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Label } from "../components/ui/label";
import { Alert, AlertDescription } from "../components/ui/alert";
import { Badge } from '../components/ui/badge';
import { 
  Clock, 
  ArrowLeft, 
  LogIn, 
  Mail, 
  Lock,
  Calendar 
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

                // Login the user
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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800 flex flex-col items-center justify-center p-6">
            {/* Theme Toggle and Back Button */}
            <div className="absolute top-6 right-6">
                <ThemeToggle />
            </div>
            <div className="absolute top-6 left-6">
                <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => navigate('/login')}
                    className="h-9 px-3 bg-white/80 backdrop-blur-sm border border-slate-200 hover:bg-white/90 text-slate-700 shadow-sm"
                >
                    <ArrowLeft size={16} className="mr-2" />
                    Back to Login
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

            {/* Main Login Card */}
            <Card className="w-full max-w-lg shadow-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-0 ring-1 ring-white/20 dark:ring-slate-700/50 mx-4 relative overflow-hidden">
                {/* Glassmorphism background effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-slate-100/20 dark:from-slate-800/30 dark:to-slate-900/20"></div>
                
                <CardContent className="relative p-6 sm:p-8 space-y-8">
                    {/* Header */}
                    <div className="space-y-2 text-center">
                        <div className="flex items-center justify-center gap-2 mb-2">
                            <Clock className="text-blue-600 dark:text-blue-400" size={28} />
                            <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">
                                Timeclock Access
                            </h2>
                        </div>
                        <p className="text-sm text-slate-600 dark:text-slate-400 font-medium">
                            Administrator Login Required
                        </p>
                    </div>

                    {/* Error Display */}
                    {error && (
                        <Alert className="border-red-200 bg-red-50 text-red-800 dark:border-red-800 dark:bg-red-950/20 dark:text-red-200 text-center rounded-xl border-2">
                            <AlertDescription className="text-base font-medium">
                                {error}
                            </AlertDescription>
                        </Alert>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2">
                                    <Mail size={16} />
                                    Email Address
                                </Label>
                                <Input
                                    type="email"
                                    id="email"
                                    placeholder="Enter admin email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={loading}
                                    className="h-12 border-2 border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm transition-all duration-200"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm font-medium text-slate-600 dark:text-slate-300 flex items-center gap-2">
                                    <Lock size={16} />
                                    Password
                                </Label>
                                <Input
                                    type="password"
                                    id="password"
                                    placeholder="Enter password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={loading}
                                    className="h-12 border-2 border-slate-200 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm transition-all duration-200"
                                />
                            </div>
                        </div>

                        <Button 
                            type="submit" 
                            disabled={loading}
                            className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 border-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                    Signing In...
                                </div>
                            ) : (
                                <>
                                    <LogIn size={20} className="mr-2" />
                                    Access Timeclock
                                </>
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Footer */}
            <div className="mt-8 text-center">
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
                    Need assistance? Contact <a href="mailto:support@americancompletiontools.com" className="text-blue-600 hover:text-blue-700 hover:underline">support@americancompletiontools.com</a>
                </p>
            </div>
        </div>
    );
};

export default TimeclockLogin;
