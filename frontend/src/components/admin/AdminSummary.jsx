import React from 'react';
import { Users, Building2, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';
import SummaryCard from '../common/SummaryCard';

const AdminSummary = () => {
    return (
        <div className="mt-8">
            <h1 className="text-2xl font-semibold text-gray-800 mb-6">Admin Dashboard</h1>
            
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <SummaryCard 
                    icon={<Users className="h-6 w-6" />}
                    text="Total Employees" 
                    number="42" 
                />
                <SummaryCard 
                    icon={<Building2 className="h-6 w-6" />}
                    text="Departments" 
                    number="8" 
                />
                <SummaryCard 
                    icon={<Calendar className="h-6 w-6" />}
                    text="Leave Requests" 
                    number="12" 
                />
            </div>
            
            {/* Leave Requests Summary */}
            <div className="bg-white rounded-lg shadow mb-8">
                <div className="px-6 py-4 border-b">
                    <h2 className="text-lg font-semibold text-gray-800">Recent Leave Requests</h2>
                </div>
                <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-green-100 text-green-500">
                                <CheckCircle className="h-6 w-6" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-gray-800">8</h3>
                                <p className="text-sm text-gray-500">Approved</p>
                            </div>
                        </div>
                        <div className="flex items-center">
                            <div className="p-3 rounded-full bg-yellow-100 text-yellow-500">
                                <Clock className="h-6 w-6" />
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-gray-800">12</h3>
                                <p className="text-sm text-gray-500">Pending</p>
                            </div>
                        </div>
                        <div className="flex items-center">
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