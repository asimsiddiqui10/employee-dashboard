import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Pencil, Plus, User } from 'lucide-react';
import AddEmployeeModal from './AddEmployeeModal';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table";

const EmployeeList = () => {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const navigate = useNavigate();

  const handleViewDetails = (employee) => {
    navigate(`/admin-dashboard/employees/${employee.employeeId}`);
  };

  const handleEdit = (employee) => {
    setSelectedEmployee(employee);
    setIsEditing(true);
  };

  const columns = [
    {
      accessorKey: "employee",
      header: "Employee",
      cell: ({ row }) => {
        const employee = row.original;
        return (
          <div className="flex items-center">
            <div className="flex-shrink-0 h-10 w-10">
              {employee.profilePic ? (
                <img
                  src={`http://localhost:3000${employee.profilePic}`}
                  alt={employee.name}
                  className="h-10 w-10 rounded-full object-cover"
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                  <User size={20} className="text-gray-400" />
                </div>
              )}
            </div>
            <div className="ml-3">
              <div className="text-sm font-medium text-gray-900">
                {employee.name}
              </div>
              <div className="text-sm text-gray-500">
                ID: {employee.employeeId}
              </div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "position",
      header: "Position",
    },
    {
      accessorKey: "department",
      header: "Department",
    },
    {
      accessorKey: "contact",
      header: "Contact",
      cell: ({ row }) => {
        const employee = row.original;
        return (
          <div>
            <div className="text-sm text-gray-900">{employee.email}</div>
            <div className="text-sm text-gray-500">{employee.phone}</div>
          </div>
        );
      },
    },
    {
      accessorKey: "employmentType",
      header: "Employment Type",
      cell: ({ row }) => {
        const type = row.getValue("employmentType");
        return (
          <span className={`px-2 inline-flex text-sm leading-5 font-semibold rounded-full 
            ${type === 'Full-time' ? 'bg-blue-100 text-blue-800' : 
              type === 'Part-time' ? 'bg-yellow-100 text-yellow-800' : 
              type === 'Contract' ? 'bg-purple-100 text-purple-800' :
              'bg-gray-100 text-gray-800'}`}>
            {type || 'Not Set'}
          </span>
        );
      },
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => {
        const employee = row.original;
        return (
          <div className="text-right">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleViewDetails(employee);
              }}
              className="text-blue-600 hover:text-blue-900 mr-3"
            >
              View
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleEdit(employee);
              }}
              className="text-indigo-600 hover:text-indigo-900"
            >
              <Pencil size={16} />
            </button>
          </div>
        );
      },
    },
  ];

  const table = useReactTable({
    data: employees,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  useEffect(() => {
    fetchEmployees();
  }, []);

  const fetchEmployees = async () => {
    try {
      console.log('Fetching employees from API...');
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:3000/api/employees', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('API response:', response.data);
      setEmployees(response.data);
    } catch (error) {
      console.error('Error fetching employees:', error);
    }
  };

  const handleAddEmployee = async (formData) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3000/api/employees', formData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setShowAddModal(false);
      fetchEmployees();
    } catch (error) {
      console.error('Error:', error);
      alert(error.response?.data?.message || 'An error occurred');
    }
  };

  return (
    <div className="container mx-auto px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Employees</h1>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center"
        >
          <Plus size={20} className="mr-2" />
          Add Employee
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleViewDetails(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {showAddModal && (
        <AddEmployeeModal
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddEmployee}
        />
      )}
    </div>
  );
};

export default EmployeeList;
