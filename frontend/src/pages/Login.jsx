import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import companyLogo from '../assets/ACT New Logo HD.png';
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { Label } from "../components/ui/label";

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const {login} = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async(e) => {
        e.preventDefault();
        try {
            console.log('Attempting login with:', { email });
            const response = await axios.post('/api/auth/login', { 
                email, 
                password 
            });
            console.log('Login response:', response.data);
            
            if (response.data.success) {
                login(response.data.user);
                localStorage.setItem('token', response.data.token);
                if(response.data.user.role === 'admin') {
                    navigate('/admin-dashboard');
                } else {
                    navigate('/employee-dashboard');
                }
            } else {
                setError(response.data.error);
            }
        } catch (error) {
            console.error('Login error:', error);
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                setError(error.response.data.error || 'Login failed');
                console.error('Error response:', error.response.data);
            } else if (error.request) {
                // The request was made but no response was received
                setError('No response from server');
            } else {
                // Something happened in setting up the request that triggered an Error
                setError('Error setting up request');
            }
        }
    };
    
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
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