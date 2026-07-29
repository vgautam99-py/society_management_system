import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Search, UserCheck, CheckCircle2, AlertCircle, Clock, Loader2
} from 'lucide-react';
import { Badge, Spinner, Button, Table, Tbody, Td, Th, Thead, Tr } from '../component/ui';
import toast from 'react-hot-toast';

const ManageAttendance = () => {
  const [staffList, setStaffList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchAttendance = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/users/staff-assignment`, {
        withCredentials: true
      });
      if (res.data?.success) {
        setStaffList(res.data.data);
      }
    } catch (err: any) {
      console.error(err);
      toast.error('Failed to load staff attendance status.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      setUpdatingId(userId);
      const res = await axios.patch(
        `${import.meta.env.VITE_API_URL}/users/${userId}`,
        { attendanceStatus: newStatus },
        { withCredentials: true }
      );
      if (res.data) {
        toast.success('Attendance status updated successfully!');
        fetchAttendance();
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to update attendance status.');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredStaff = staffList.filter((staff) => 
    staff.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    staff.staffRole?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Present & Free':
        return (
          <Badge variant="success" className="flex items-center gap-1 w-fit">
            <CheckCircle2 size={12} /> Present & Free
          </Badge>
        );
      case 'Present & Working':
        return (
          <Badge variant="warning" className="flex items-center gap-1 w-fit bg-amber-50 text-amber-700 border-amber-100">
            <Clock size={12} /> Present & Working
          </Badge>
        );
      case 'Leave':
        return (
          <Badge variant="danger" className="flex items-center gap-1 w-fit">
            <AlertCircle size={12} /> On Leave
          </Badge>
        );
      default:
        return <Badge variant="slate">{status}</Badge>;
    }
  };

  if (loading && staffList.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <UserCheck className="text-blue-600" size={24} /> Staff Attendance
          </h1>
          <p className="text-slate-500 text-sm">Monitor daily staff attendance, task allocation, and active status.</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Search staff by name, email, or role..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="secondary" onClick={fetchAttendance} className="text-xs">
          Refresh
        </Button>
      </div>

      {/* Table Panel */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <Table>
          <Thead>
            <Tr>
              <Th>Staff Member</Th>
              <Th>Role / Position</Th>
              <Th>Current Status</Th>
              <Th>Active Tasks</Th>
              <Th className="text-right">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredStaff.length > 0 ? (
              filteredStaff.map((staff: any) => (
                <Tr key={staff._id}>
                  <Td>
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-semibold text-sm">
                        {staff.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{staff.name}</p>
                        <p className="text-xs text-slate-500">{staff.email}</p>
                      </div>
                    </div>
                  </Td>
                  <Td>
                    <span className="text-slate-700 text-sm font-medium capitalize">
                      {staff.staffRole || 'Other'}
                    </span>
                  </Td>
                  <Td>
                    {getStatusBadge(staff.attendanceStatus)}
                  </Td>
                  <Td>
                    <span className="text-xs font-semibold text-slate-700">
                      {staff.activeTaskCount || 0} active {staff.activeTaskCount === 1 ? 'task' : 'tasks'}
                    </span>
                  </Td>
                  <Td className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      {updatingId === staff._id ? (
                        <Loader2 className="animate-spin text-slate-400" size={16} />
                      ) : (
                        <select
                          value={staff.attendanceStatus || 'Present & Free'}
                          onChange={(e) => handleStatusChange(staff._id, e.target.value)}
                          className="px-2.5 py-1.5 text-xs font-semibold border border-slate-200 rounded-lg outline-none bg-slate-50 hover:bg-slate-100 transition-colors focus:border-blue-500 cursor-pointer"
                        >
                          <option value="Present & Free">Present & Free</option>
                          <option value="Present & Working">Present & Working</option>
                          <option value="Leave">On Leave</option>
                        </select>
                      )}
                    </div>
                  </Td>
                </Tr>
              ))
            ) : (
              <Tr>
                <Td colSpan={5} className="text-center py-12 text-slate-400 italic text-sm">
                  No staff records found.
                </Td>
              </Tr>
            )}
          </Tbody>
        </Table>
      </div>
    </div>
  );
};

export default ManageAttendance;
