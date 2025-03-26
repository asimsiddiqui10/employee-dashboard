import React from 'react';

const Payroll = () => {
  const payrollHistory = [
    { id: 1, period: 'April 2023', amount: '$4,500.00', date: '04/30/2023', status: 'Paid' },
    { id: 2, period: 'March 2023', amount: '$4,500.00', date: '03/31/2023', status: 'Paid' },
    { id: 3, period: 'February 2023', amount: '$4,500.00', date: '02/28/2023', status: 'Paid' },
    { id: 4, period: 'January 2023', amount: '$4,500.00', date: '01/31/2023', status: 'Paid' },
    { id: 5, period: 'December 2022', amount: '$4,500.00', date: '12/31/2022', status: 'Paid' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-800">Payroll</h1>
      
      {/* Current Pay Period */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Current Pay Period</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Gross Salary</p>
            <p className="text-xl font-bold text-gray-800">$5,000.00</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Deductions</p>
            <p className="text-xl font-bold text-gray-800">$500.00</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-500">Net Salary</p>
            <p className="text-xl font-bold text-gray-800">$4,500.00</p>
          </div>
        </div>
        <div className="mt-6">
          <p className="text-sm text-gray-500">Next payment date: <span className="font-medium text-gray-700">May 31, 2023</span></p>
        </div>
      </div>
      
      {/* Salary Breakdown */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Salary Breakdown</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-md font-medium text-gray-700 mb-3">Earnings</h3>
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span className="text-gray-600">Basic Salary</span>
                <span className="font-medium">$4,000.00</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Housing Allowance</span>
                <span className="font-medium">$500.00</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Transport Allowance</span>
                <span className="font-medium">$300.00</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Bonus</span>
                <span className="font-medium">$200.00</span>
              </li>
              <li className="flex justify-between pt-2 border-t">
                <span className="font-medium">Total Earnings</span>
                <span className="font-bold">$5,000.00</span>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-md font-medium text-gray-700 mb-3">Deductions</h3>
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span className="text-gray-600">Income Tax</span>
                <span className="font-medium">$300.00</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Health Insurance</span>
                <span className="font-medium">$150.00</span>
              </li>
              <li className="flex justify-between">
                <span className="text-gray-600">Retirement Fund</span>
                <span className="font-medium">$50.00</span>
              </li>
              <li className="flex justify-between pt-2 border-t">
                <span className="font-medium">Total Deductions</span>
                <span className="font-bold">$500.00</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Payroll History */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Payroll History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Pay Period
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {payrollHistory.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {item.period}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.amount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {item.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900">View Slip</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Payroll; 