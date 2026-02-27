import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import companyLogo from '../assets/ACT New Logo HD.png';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { Label } from "../components/ui/label";
import { handleApiError } from '@/utils/errorHandler';
import { ThemeToggle } from "@/components/ui/theme-toggle";

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const {login} = useAuth();
    const navigate = useNavigate();

    // Debug: Log API URL when component mounts
    useEffect(() => {
        console.log('API URL:', import.meta.env.VITE_API_URL);
        console.log('API Base URL:', api.defaults.baseURL);
    }, []);

    const handleSubmit = async(e) => {
        e.preventDefault();
        setError('');
        try {
            // Add detailed logging of the request
            console.log('Login attempt with:', {
                email,
                apiUrl: api.defaults.baseURL,
                environment: import.meta.env.MODE,
                headers: api.defaults.headers
            });
            
            const response = await api.post('/auth/login', { 
                email, 
                password 
            });
            
            console.log('Login response:', response.data);
            
            if (response.data.token) {
                // Ensure kiosk flag is cleared for normal logins
                localStorage.removeItem('kioskSession');

                login(response.data.user);
                localStorage.setItem('token', response.data.token);
                
                // Enhanced navigation logic for multiple roles
                const user = response.data.user;
                const userRoles = user.roles || (user.role ? [user.role] : []);
                const activeRole = user.activeRole || user.role;
                
                // Navigate based on active role, with fallback to primary role
                if (activeRole === 'admin' || (!activeRole && userRoles.includes('admin'))) {
                    navigate('/admin-dashboard');
                } else if (activeRole === 'employee' || userRoles.includes('employee')) {
                    navigate('/employee-dashboard');
                } else {
                    // Fallback to admin dashboard if user has admin role
                    if (userRoles.includes('admin')) {
                    navigate('/admin-dashboard');
                } else {
                    navigate('/employee-dashboard');
                    }
                }
            } else {
                const { message } = handleApiError(response.data);
                setError(message);
            }
        } catch (error) {
            // Enhanced error logging
            console.error('Login error details:', {
                message: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                headers: error.response?.headers,
                config: {
                    url: error.config?.url,
                    method: error.config?.method,
                    baseURL: error.config?.baseURL,
                    headers: error.config?.headers
                }
            });
            const { message } = handleApiError(error);
            setError(message);
        }
    };
    
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="absolute top-4 right-4">
            <ThemeToggle />
        </div>
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-foreground text-center mb-6">American Completion Tools</h2>
          {error && <div className="bg-destructive/10 text-destructive p-3 rounded-md mb-4">{error}</div>}
          <Card>
            <CardHeader>
              <CardTitle className="text-xl text-center">Login</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    type="email"
                    id="email"
                    placeholder="Enter Email"
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    type="password"
                    id="password"
                    placeholder="Enter Password"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="remember" />
                    <Label htmlFor="remember" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Remember me
                    </Label>
                  </div>
                  <Button variant="link" className="text-sm">
                    Forgot password?
                  </Button>
                </div>

                <Button type="submit" className="w-full">
                  Login
                </Button>
              </form>
              
              {/* Timeclock Access Link */}
              <div className="mt-4 text-center">
                <Button 
                  variant="link" 
                  className="text-sm text-muted-foreground hover:text-primary"
                  onClick={() => navigate('/timeclock-login')}
                >
                  Timeclock (Admin Only)
                </Button>
              </div>
            </CardContent>
          </Card>
          <div className="flex justify-center">
            <img src={companyLogo} alt="Company Logo" className="w-40 h-12 mx-auto mb-4 pt-4" />
          </div>
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>American Completion Tools 2025</p>
            <p className="mt-2">For queries, reach out to <a href="mailto:support@americancompletiontools.com" className="text-primary hover:underline">support@americancompletiontools.com</a></p>
          </div>
        </div>
    </div>
  )
}

export default Login;