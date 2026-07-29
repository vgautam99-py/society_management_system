import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { 
  fetchNotices, 
  createNotice, 
  updateNotice, 
  deleteNotice,
  clearNoticeError,
  clearNoticeMessage
} from '../redux/slice/noticeSlice';
import { 
  Table, Thead, Tbody, Tr, Th, Td, 
  Button, Badge, Dialog, Input, Spinner 
} from '../component/ui';
import { Megaphone, Search, PlusCircle, Edit2, Trash2, Calendar, User } from 'lucide-react';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';

function ManageNotices() {
  const dispatch = useDispatch<any>();
  const { 
    notices, 
    loading, 
    error, 
    message,
    totalResults,
    totalPages,
    page,
    limit 
  } = useSelector((state: any) => state.notice);
  const userRole = useSelector((state: any) => state.auth.role) || Cookies.get('role');
  const isAdmin = userRole?.toLowerCase() === 'admin';

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editNoticeId, setEditNoticeId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [pageNumber, setPageNumber] = useState(1);

  // React Hook Form for Create/Edit Notice
  const { 
    register, 
    handleSubmit, 
    reset, 
    formState: { errors } 
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      expiryDate: ''
    }
  });

  // Dynamic real-time backend filtering and pagination
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      dispatch(fetchNotices({
        page: pageNumber,
        search: searchTerm
      }));
    }, 300); // 300ms debounce to prevent layout thrashing

    return () => clearTimeout(delayDebounce);
  }, [dispatch, pageNumber, searchTerm]);

  // Handle toast notifications
  useEffect(() => {
    if (error) {
      toast.error(error.message || 'Something went wrong');
      dispatch(clearNoticeError());
    }
    if (message) {
      toast.success(message);
      dispatch(clearNoticeMessage());
    }
  }, [error, message, dispatch]);

  const handleOpenCreateDialog = () => {
    setEditNoticeId(null);
    reset({ title: '', description: '', expiryDate: '' });
    setIsDialogOpen(true);
  };

  const handleOpenEditDialog = (notice: any) => {
    setEditNoticeId(notice._id);
    reset({
      title: notice.title || '',
      description: notice.description || '',
      expiryDate: notice.expiryDate ? new Date(notice.expiryDate).toISOString().split('T')[0] : ''
    });
    setIsDialogOpen(true);
  };

  const onSubmitNotice = (data: any) => {
    if (editNoticeId) {
      dispatch(updateNotice({ id: editNoticeId, noticeData: data })).then(() => {
        dispatch(fetchNotices({}));
        setIsDialogOpen(false);
      });
    } else {
      dispatch(createNotice(data)).then(() => {
        dispatch(fetchNotices({}));
        setIsDialogOpen(false);
      });
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this announcement?')) {
      dispatch(deleteNotice(id)).then(() => {
        dispatch(fetchNotices({}));
      });
    }
  };

  // The notices are already filtered and paginated on the backend
  const filteredNotices = notices || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Megaphone className="text-blue-600" size={24} />
            Society Announcements
          </h1>
          <p className="text-slate-500 text-sm">
            {isAdmin 
              ? 'Publish, edit and manage important announcements and notices for society members.' 
              : 'Stay updated with the latest society announcements and notices.'}
          </p>
        </div>
        {isAdmin && (
          <Button 
            leftIcon={<PlusCircle size={18} />} 
            onClick={handleOpenCreateDialog}
            className="bg-blue-600 hover:bg-blue-700"
          >
            New Announcement
          </Button>
        )}
      </div>

      {/* Filters & Actions */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Search announcements by title or details..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setPageNumber(1);
            }}
          />
        </div>
      </div>

      {/* Notices Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center"><Spinner size="md" /></div>
        ) : (
          <Table>
            <Thead>
              <Tr hover={false}>
                <Th>Announcement Details</Th>
                <Th>Posted By</Th>
                <Th>Expiry Date</Th>
                {isAdmin && <Th className="text-right">Actions</Th>}
              </Tr>
            </Thead>
            <Tbody>
              {filteredNotices.length > 0 ? (
                filteredNotices.map((n: any) => (
                  <Tr key={n._id}>
                    <Td className="max-w-md">
                      <div>
                        <p className="font-semibold text-slate-900 text-[14px]">{n.title}</p>
                        <p className="text-slate-500 text-xs mt-1 leading-relaxed">{n.description}</p>
                      </div>
                    </Td>
                    <Td>
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                          <User size={12} />
                        </div>
                        <span className="text-slate-700 text-xs font-medium">{n.postedBy?.name || 'Admin'}</span>
                      </div>
                    </Td>
                    <Td className="text-slate-500 text-xs">
                      {n.expiryDate ? (
                        <div className="flex items-center gap-1.5 text-slate-600 font-medium">
                          <Calendar size={14} className="text-slate-400" />
                          {new Date(n.expiryDate).toLocaleDateString()}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No Expiry</span>
                      )}
                    </Td>
                    {isAdmin && (
                      <Td className="text-right">
                        <div className="flex justify-end gap-2">
                          <button 
                            onClick={() => handleOpenEditDialog(n)}
                            className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"
                            title="Edit Notice"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button 
                            onClick={() => handleDelete(n._id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                            title="Delete Notice"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </Td>
                    )}
                  </Tr>
                ))
              ) : (
                <Tr hover={false}>
                  <Td colSpan={isAdmin ? 4 : 3} className="text-center py-12 text-slate-500">
                    No announcements posted.
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
              Showing <span className="font-semibold text-slate-700">{filteredNotices.length}</span> of{' '}
              <span className="font-semibold text-slate-700">{totalResults}</span> announcements
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

      {/* Add / Edit Notice Dialog (Admins Only) */}
      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title={editNoticeId ? "Edit Announcement" : "Publish New Announcement"}
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit(onSubmitNotice)} className="bg-blue-600 hover:bg-blue-700">{editNoticeId ? "Update" : "Publish"}</Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit(onSubmitNotice)} className="space-y-4 py-2">
          <Input 
            label="Announcement Title" 
            placeholder="e.g. Society General Meeting on Sunday" 
            error={errors.title?.message as string}
            {...register('title', { 
              required: 'Title is required',
              minLength: { value: 5, message: 'Minimum 5 characters required' }
            })}
          />
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 ml-0.5">Announcement Details</label>
            <textarea 
              rows={5}
              placeholder="Provide complete information and updates..."
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
          <Input 
            label="Expiry Date" 
            type="date" 
            error={errors.expiryDate?.message as string}
            {...register('expiryDate')}
          />
        </form>
      </Dialog>
    </div>
  );
}

export default ManageNotices;
