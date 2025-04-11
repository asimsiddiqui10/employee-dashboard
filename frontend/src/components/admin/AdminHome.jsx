import React from 'react';
import { Users, Building2, Calendar, CheckCircle, Clock, XCircle, TrendingUp, BarChart } from 'lucide-react';
import SummaryCard from '../common/SummaryCard';

const AdminSummary = () => {
    // Add this data for the growth chart
    const growthData = [
        { month: 'Jan', count: 35, growth: '+2' },
        { month: 'Feb', count: 38, growth: '+3' },
        { month: 'Mar', count: 40, growth: '+2' },
        { month: 'Apr', count: 37, growth: '-3' },
        { month: 'May', count: 42, growth: '+5' },
        { month: 'Jun', count: 45, growth: '+3' },
        { month: 'Jul', count: 42, growth: '-3' }
    ];

    return (
        <div className="mt-8">
            <h1 className="text-2xl font-semibold text-gray-800 mb-6">Admin Dashboard</h1>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <SummaryCard 
                    icon={<Users className="h-6 w-6" />}
                    text="Total Employees" 
                    number="42"
                    trend="+12% from last month"
                />
                <SummaryCard 
                    icon={<Building2 className="h-6 w-6" />}
                    text="Departments" 
                    number="8"
                    trend="No change"
                />
                <SummaryCard 
                    icon={<Calendar className="h-6 w-6" />}
                    text="Leave Requests" 
                    number="12"
                    trend="+3 new requests"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Employee Growth Chart */}
                <div className="bg-white rounded-xl shadow-lg p-8 hover:shadow-xl transition-shadow duration-300">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">Employee Growth</h2>
                        <TrendingUp className="h-6 w-6 text-blue-500" />
                    </div>
                    <div className="h-64 flex items-end justify-between space-x-3">
                        {growthData.map((data, i) => (
                            <div key={i} className="w-full flex flex-col items-center">
                                <div className={`text-xs font-medium mb-1 ${
                                    data.growth.startsWith('+') ? 'text-green-500' : 'text-red-500'
                                }`}>
                                    {data.growth}
                                </div>
                                <div 
                                    style={{height: `${(data.count/45)*240}px`}}
                                    className={`w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg hover:from-blue-700 hover:to-blue-500 transition-all duration-300 relative group`}
                                >
                                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-3 py-1.5 rounded-full text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-lg backdrop-blur-sm">
                                        {data.count} employees
                                    </div>
                                </div>
                                <div className="text-xs font-medium text-gray-600 mt-2">
                                    {data.month}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Department Distribution */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-semibold text-gray-800">Department Distribution</h2>
                        <BarChart className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="space-y-4">
                        {[
                            {dept: 'Engineering', count: 15, color: 'bg-indigo-500'},
                            {dept: 'Marketing', count: 8, color: 'bg-green-500'},
                            {dept: 'Sales', count: 12, color: 'bg-yellow-500'},
                            {dept: 'HR', count: 4, color: 'bg-red-500'},
                            {dept: 'Operations', count: 3, color: 'bg-purple-500'}
                        ].map((item, i) => (
                            <div key={i}>
                                <div className="flex justify-between text-sm mb-1">
                                    <span>{item.dept}</span>
                                    <span>{item.count} employees</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                        className={`${item.color} rounded-full h-2`}
                                        style={{width: `${(item.count/42)*100}%`}}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            {/* Leave Requests Summary */}
            <div className="bg-white rounded-lg shadow">
                <div className="px-6 py-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-800">Leave Requests Overview</h2>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex items-center p-4 bg-green-50 rounded-lg">
                            <div className="p-3 rounded-full bg-green-100 text-green-500">
                                <CheckCircle className="h-6 w-6" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-gray-800">8</h3>
                                <p className="text-sm text-gray-500">Approved</p>
                            </div>
                        </div>
                        <div className="flex items-center p-4 bg-yellow-50 rounded-lg">
                            <div className="p-3 rounded-full bg-yellow-100 text-yellow-500">
                                <Clock className="h-6 w-6" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-gray-800">12</h3>
                                <p className="text-sm text-gray-500">Pending</p>
                            </div>
                        </div>
                        <div className="flex items-center p-4 bg-red-50 rounded-lg">
                            <div className="p-3 rounded-full bg-red-100 text-red-500">
                                <XCircle className="h-6 w-6" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-gray-800">3</h3>
                                <p className="text-sm text-gray-500">Rejected</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminSummary;