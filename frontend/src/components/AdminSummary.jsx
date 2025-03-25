import React from 'react';
import { Users, Building2, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';
import SummaryCard from './SummaryCard';

const AdminSummary = () => {
    return (
        <div className="mt-8">
            <h3 className='text-2xl font-bold mb-4'>Dashboard Overview</h3>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
                <SummaryCard icon={<Users />} text="Total Users" number={62}/>
                <SummaryCard icon={<Building2 />} text="Total Departments" number={8}/>
            </div>
            
            <h3 className='text-2xl font-bold mb-4 mt-8'>Leave Details</h3>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4'>
                <SummaryCard icon={<Calendar />} text="Leave Applied" number={24}/>
                <SummaryCard icon={<CheckCircle />} text="Leave Approved" number={18}/>
                <SummaryCard icon={<Clock />} text="Leave Pending" number={4}/>
                <SummaryCard icon={<XCircle />} text="Leave Rejected" number={2}/>
            </div>
        </div>
    );
};

export default AdminSummary;