import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import companyLogo from '../assets/ACT New Logo HD.png';


const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);
    const {login} = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async(e) => {
        e.preventDefault();
        try {
            const response = await axios.post('http://localhost:3000/api/auth/login', { email, password });
            console.log(response.data);
            if (response.data.success) {
                login(response.data.user);
                localStorage.setItem('token', response.data.token);
                if(response.data.user.role === 'admin') {
                    navigate('/admin-dashboard');
                } else {
                    navigate('/employee-dashboard');
                }
            } else {
                setError(response.data.error)
            }
        } catch (error) {
            if(error.response && !error.response.data.success) {
                setError(error.response.data.error)
            } else {
                setError("Server Error")
            }
        }
    };
    
  return (
    <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="w-full max-w-md">
          <h2 className="text-3xl font-bold text-black text-center mb-6">American Completion Tools</h2>
          {error && <p className="text-red-500 text-center mb-4">{error}</p>}
          <form onSubmit={handleSubmit} className="bg-white border border-gray-300 rounded-lg shadow-lg p-8">
              <h2 className="text-xl font-semibold text-black mb-6 text-center">Login</h2>
              <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input 
                    type="text" 
                    placeholder="Enter Email" 
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
              </div>
              <div className="mb-6">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                  <input 
                    type="password" 
                    placeholder="Enter Password" 
                    className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
              </div>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <input type="checkbox" className="h-4 w-4 bg-gray-100 border border-gray-300 rounded focus:ring-blue-500"/>
                  <label htmlFor="remember" className="ml-2 text-sm text-gray-700">
                    <span className="text-gray-700">Remember me</span>
                  </label>
                </div>
                <a href="#" className="text-sm text-blue-500 hover:text-blue-400 underline">
                  Forgot password?
                </a>
              </div>
              
              <button 
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
              >
                Login
              </button>
          </form> 
          <div className="flex justify-center">
            <img src={companyLogo} alt="Company Logo" className="w-40 h-12 mx-auto mb-4 pt-4" />
          </div>
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>American Completion Tools 2025</p>
            <p className="mt-2">For queries, reach out to <a href="mailto:support@americancompletiontools.com" className="text-blue-500 hover:underline">support@americancompletiontools.com</a></p>
          </div>
        </div>
    </div>
  )
}

export default Login;