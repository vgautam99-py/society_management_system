import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';
import { 
  fetchComplaints, 
  createComplaint, 
  updateComplaint, 
  deleteComplaint,
  clearComplaintError,
  clearComplaintMessage
} from '../redux/slice/complaintSlice';
import { 
  Table, Thead, Tbody, Tr, Th, Td, 
  Button, Badge, Dialog, Input, Spinner 
} from '../component/ui';
import { ShieldAlert, Search, PlusCircle, Edit2, Trash2, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import axios from 'axios';

function ManageComplaints() {
  const dispatch = useDispatch<any>();
  const { 
    complaints, 
    loading, 
    error, 
    message,
    totalResults,
    totalPages,
    page,
    limit 
  } = useSelector((state: any) => state.complaint);
  const userRole = useSelector((state: any) => state.auth.role) || Cookies.get('role');
  const isAdmin = userRole?.toLowerCase() === 'admin';
  const isStaff = userRole?.toLowerCase() === 'staff';

  const [searchParams, setSearchParams] = useSearchParams();
  const openComplaintId = searchParams.get('openComplaintId');

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isStatusDialogOpen, setIsStatusDialogOpen] = useState(false);
  const [isAssignDialogOpen, setIsAssignDialogOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [activeAssignmentComplaint, setActiveAssignmentComplaint] = useState<any | null>(null);
  const [assignmentStaff, setAssignmentStaff] = useState<any[]>([]);
  const [loadingAssignment, setLoadingAssignment] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [selectedStatus, setSelectedStatus] = useState('');

  // Fetch staff list for assignment dropdown (Admin only)
  const [staffList, setStaffList] = useState<any[]>([]);
  useEffect(() => {
    if (isAdmin && isStatusDialogOpen) {
      axios.get(`${import.meta.env.VITE_API_URL}/users`, {
        params: { role: 'Staff' },
        withCredentials: true
      }).then((res) => {
        if (res.data?.data) {
          setStaffList(res.data.data);
        }
      }).catch((err) => console.error(err));
    }
  }, [isAdmin, isStatusDialogOpen]);

  const fetchStaffAssignment = async () => {
    try {
      setLoadingAssignment(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/users/staff-assignment`, {
        withCredentials: true
      });
      if (res.data?.success) {
        setAssignmentStaff(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch staff assignment status:', err);
    } finally {
      setLoadingAssignment(false);
    }
  };

  const handleOpenAssignDialog = (complaint: any) => {
    setActiveAssignmentComplaint(complaint);
    fetchStaffAssignment();
    setIsAssignDialogOpen(true);
  };

  const handleAssignTask = async (staffId: string) => {
    try {
      const res = await axios.patch(
        `${import.meta.env.VITE_API_URL}/complaints/${activeAssignmentComplaint._id}`,
        { assignedTo: staffId, status: 'assigned' },
        { withCredentials: true }
      );
      if (res.data) {
        toast.success('Task successfully assigned to staff!');
        setIsAssignDialogOpen(false);
        setSearchParams({});
        dispatch(fetchComplaints({ page: pageNumber }));
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to assign task');
    }
  };

  // Watch openComplaintId search query param and open assignment dialog automatically
  useEffect(() => {
    if (openComplaintId && complaints && complaints.length > 0) {
      const complaintToOpen = complaints.find((c: any) => c._id === openComplaintId);
      if (complaintToOpen) {
        handleOpenAssignDialog(complaintToOpen);
      }
    }
  }, [openComplaintId, complaints]);

  // React Hook Form for Create/Edit Complaint
  const { 
    register, 
    handleSubmit, 
    reset, 
    formState: { errors } 
  } = useForm({
    defaultValues: {
      title: '',
      description: ''
    }
  });

  // React Hook Form for Status Updates (Admin only)
  const { 
    register: registerStatus, 
    handleSubmit: handleSubmitStatus, 
    setValue: setStatusValue 
  } = useForm();

  // Dynamic real-time backend filtering and pagination
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      dispatch(fetchComplaints({
        page: pageNumber,
        search: searchTerm,
        status: selectedStatus || undefined
      }));
    }, 300); // 300ms debounce to prevent layout thrashing

    return () => clearTimeout(delayDebounce);
  }, [dispatch, pageNumber, searchTerm, selectedStatus]);

  // Handle toast notifications
  useEffect(() => {
    if (error) {
      toast.error(error.message || 'Something went wrong');
      dispatch(clearComplaintError());
    }
    if (message) {
      toast.success(message);
      dispatch(clearComplaintMessage());
    }
  }, [error, message, dispatch]);

  const handleOpenCreateDialog = () => {
    reset({ title: '', description: '' });
    setIsDialogOpen(true);
  };

  const handleOpenStatusDialog = (complaint: any) => {
    setSelectedComplaint(complaint);
    setStatusValue('status', complaint.status);
    setStatusValue('assignedTo', complaint.assignedTo?._id || complaint.assignedTo || '');
    setIsStatusDialogOpen(true);
  };

  const onSubmitComplaint = (data: any) => {
    dispatch(createComplaint(data)).then(() => {
      dispatch(fetchComplaints({ page: 1 }));
      setIsDialogOpen(false);
    });
  };

  const onSubmitStatus = (data: any) => {
    if (!selectedComplaint) return;
    dispatch(updateComplaint({ 
      id: selectedComplaint._id, 
      complaintData: { 
        status: data.status,
        assignedTo: data.assignedTo || null
      } 
    })).then(() => {
      dispatch(fetchComplaints({ page: pageNumber }));
      setIsStatusDialogOpen(false);
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this complaint?')) {
      dispatch(deleteComplaint(id)).then(() => {
        dispatch(fetchComplaints({ page: pageNumber }));
      });
    }
  };

  // The complaints are already filtered and paginated on the backend
  const filteredComplaints = complaints || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'resolved':
      case 'completed':
        return <CheckCircle2 className="text-emerald-500 mr-1" size={14} />;
      case 'in-progress':
        return <Clock className="text-amber-500 mr-1" size={14} />;
      default:
        return <AlertCircle className="text-rose-500 mr-1" size={14} />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'resolved':
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'warning';
      default:
        return 'danger';
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="text-rose-500" size={24} />
            {isAdmin ? 'Manage Society Complaints' : 'My Complaints'}
          </h1>
          <p className="text-slate-500 text-sm">
            {isAdmin 
              ? 'View, track, and update resident filed complaints.' 
              : 'File new complaints or view the status of your reported issues.'}
          </p>
        </div>
        {!isAdmin && (
          <Button 
            leftIcon={<PlusCircle size={18} />} 
            onClick={handleOpenCreateDialog}
            className="bg-blue-600 hover:bg-blue-700"
          >
            File a Complaint
          </Button>
        )}
      </div>

      {/* Filters & Actions */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Search complaints by title, details..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPageNumber(1);
            }}
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Status:</span>
          <select
            className="px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            value={selectedStatus}
            onChange={(e) => {
              setSelectedStatus(e.target.value);
              setPageNumber(1);
            }}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center"><Spinner size="md" /></div>
        ) : (
          <Table>
            <Thead>
              <Tr hover={false}>
                <Th>Complaint Details</Th>
                {isAdmin && <Th>Filed By</Th>}
                <Th>Assigned Staff</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredComplaints.length > 0 ? (
                filteredComplaints.map((c: any) => (
                  <Tr key={c._id}>
                    <Td className="max-w-md">
                      <div>
                        <p className="font-semibold text-slate-900 text-[14px]">{c.title}</p>
                        <p className="text-slate-500 text-xs mt-1 leading-relaxed">{c.description}</p>
                      </div>
                    </Td>
                    {isAdmin && (
                      <Td>
                        <div className="flex flex-col">
                          <span className="font-medium text-slate-800 text-xs">{c.resident?.name || 'Unknown'}</span>
                          <span className="text-[10px] text-slate-400">{c.resident?.email}</span>
                        </div>
                      </Td>
                    )}
                    <Td>
                      {c.assignedTo ? (
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800 text-xs">{c.assignedTo.name}</span>
                          <span className="text-[10px] text-slate-400">{c.assignedTo.email}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-xs">Unassigned</span>
                      )}
                    </Td>
                    <Td>
                      <div className="flex items-center">
                        {getStatusIcon(c.status)}
                        <Badge variant={getStatusVariant(c.status)} className="capitalize">
                          {c.status}
                        </Badge>
                      </div>
                    </Td>
                    <Td className="text-right">
                      <div className="flex justify-end items-center gap-2">
                        {isAdmin && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => handleOpenAssignDialog(c)}
                            className="text-[10px] px-2 py-1 h-7 border-blue-200 text-blue-600 hover:bg-blue-50"
                          >
                            Assign Task
                          </Button>
                        )}
                        {(isAdmin || isStaff) ? (
                          <button 
                            onClick={() => handleOpenStatusDialog(c)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"
                            title="Update Status"
                          >
                            <Edit2 size={16} />
                          </button>
                        ) : null}
                        {(isAdmin || c.status === 'pending') && (
                          <button 
                            onClick={() => handleDelete(c._id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Delete Complaint"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </Td>
                  </Tr>
                ))
              ) : (
                <Tr hover={false}>
                  <Td colSpan={isAdmin ? 4 : 3} className="text-center py-12 text-slate-500">
                    No complaints found.
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        )}
        
        {/* Dynamic Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
            <div className="text-xs text-slate-500">
              Showing <span className="font-semibold text-slate-700">{filteredComplaints.length}</span> of{' '}
              <span className="font-semibold text-slate-700">{totalResults}</span> complaints
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={pageNumber <= 1}
                onClick={() => setPageNumber((prev) => Math.max(prev - 1, 1))}
              >
                Previous
              </Button>
              <div className="flex items-center justify-center px-3 text-xs font-semibold text-slate-700">
                Page {pageNumber} of {totalPages}
              </div>
              <Button
                variant="secondary"
                size="sm"
                disabled={pageNumber >= totalPages}
                onClick={() => setPageNumber((prev) => Math.min(prev + 1, totalPages))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* File Complaint Dialog (Residents Only) */}
      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="File a New Complaint"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit(onSubmitComplaint)} className="bg-blue-600 hover:bg-blue-700">Submit Complaint</Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit(onSubmitComplaint)} className="space-y-4 py-2">
          <Input 
            label="Complaint Title" 
            placeholder="e.g. Water Leakage in Block A" 
            error={errors.title?.message as string}
            {...register('title', { 
              required: 'Title is required',
              minLength: { value: 5, message: 'Minimum 5 characters required' }
            })}
          />
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 ml-0.5">Details / Description</label>
            <textarea 
              rows={4}
              placeholder="Provide complete details about the issue..."
              className={`w-full px-3 py-2 text-sm bg-white border rounded-lg outline-none transition-all duration-200 
                ${errors.description 
                  ? 'border-rose-500 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/10' 
                  : 'border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10'}`}
              {...register('description', { 
                required: 'Description is required',
                minLength: { value: 10, message: 'Minimum 10 characters required' }
              })}
            />
            {errors.description && (
              <p className="text-[11px] text-rose-500 font-medium ml-0.5">{errors.description.message as string}</p>
            )}
          </div>
        </form>
      </Dialog>

      {/* Update Status Dialog (Admins Only) */}
      <Dialog
        isOpen={isStatusDialogOpen}
        onClose={() => setIsStatusDialogOpen(false)}
        title="Update Complaint Status"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsStatusDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmitStatus(onSubmitStatus)} className="bg-blue-600 hover:bg-blue-700">Update Status</Button>
          </div>
        }
      >
        <form onSubmit={handleSubmitStatus(onSubmitStatus)} className="space-y-4 py-2">
          {selectedComplaint && (
            <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 mb-4">
              <p className="text-xs font-semibold text-slate-500">Complaint Title</p>
              <p className="text-sm font-medium text-slate-800 mt-0.5">{selectedComplaint.title}</p>
            </div>
          )}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 ml-0.5">Status</label>
            <select 
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all capitalize"
              {...registerStatus('status', { required: true })}
            >
              {isAdmin ? (
                <>
                  <option value="pending">Pending</option>
                  <option value="assigned">Assigned</option>
                  <option value="in-progress">In Progress</option>
                  <option value="completed">Completed</option>
                </>
              ) : (
                <>
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </>
              )}
            </select>
          </div>
          {isAdmin && (
            <div className="space-y-1.5 mt-3">
              <label className="text-xs font-medium text-slate-700 ml-0.5">Assign Task To (Staff)</label>
              <select 
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                {...registerStatus('assignedTo')}
              >
                <option value="">Unassigned</option>
                {staffList.map((staff: any) => (
                  <option key={staff._id} value={staff._id}>
                    {staff.name} ({staff.email})
                  </option>
                ))}
              </select>
            </div>
          )}
        </form>
      </Dialog>

      {/* Assign Task Dialog (Admins Only) */}
      <Dialog
        isOpen={isAssignDialogOpen}
        onClose={() => setIsAssignDialogOpen(false)}
        title="Assign Task to Staff"
        footer={
          <div className="flex justify-end">
            <Button variant="secondary" onClick={() => setIsAssignDialogOpen(false)}>Close</Button>
          </div>
        }
      >
        <div className="space-y-4 py-2">
          {activeAssignmentComplaint && (
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Complaint Details</p>
              <h4 className="font-bold text-slate-800 text-sm leading-snug">{activeAssignmentComplaint.title}</h4>
              <p className="text-xs text-slate-600 leading-relaxed">{activeAssignmentComplaint.description}</p>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-xs font-semibold text-slate-700 ml-0.5">Select Staff Member</p>
            <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm max-h-64 overflow-y-auto">
              {loadingAssignment ? (
                <div className="p-8 flex justify-center"><Spinner size="sm" /></div>
              ) : assignmentStaff.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {assignmentStaff.map((staff: any) => (
                    <div key={staff._id} className="p-3.5 flex justify-between items-center hover:bg-slate-50 transition-colors">
                      <div>
                        <p className="font-semibold text-slate-800 text-xs">{staff.name}</p>
                        <p className="text-[10px] text-slate-500 capitalize">{staff.staffRole || 'Staff'}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge 
                          variant={staff.attendanceStatus === 'Leave' ? 'danger' : staff.attendanceStatus === 'Present & Working' ? 'warning' : 'success'}
                          className={staff.attendanceStatus === 'Present & Working' ? 'bg-amber-50 text-amber-700 border-amber-100' : ''}
                        >
                          {staff.attendanceStatus === 'Present & Free' ? 'Free' : staff.attendanceStatus === 'Present & Working' ? 'Assigned' : 'Leave'}
                        </Badge>
                        <Button 
                          size="sm" 
                          onClick={() => handleAssignTask(staff._id)}
                          disabled={staff.attendanceStatus === 'Leave'}
                          className="bg-blue-600 hover:bg-blue-700 text-[11px] px-2.5 py-1 h-7 cursor-pointer"
                        >
                          Assign
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs italic">
                  No staff members available.
                </div>
              )}
            </div>
          </div>
        </div>
      </Dialog>
    </div>
  );
}

export default ManageComplaints;
