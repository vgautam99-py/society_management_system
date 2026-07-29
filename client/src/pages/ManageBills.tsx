import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import { 
  fetchBills, 
  createBill, 
  payBill, 
  fetchBillStats,
  clearBillError,
  clearBillMessage
} from '../redux/slice/billSlice';
import { fetchFlats } from '../redux/slice/flatSlice';
import { 
  Table, Thead, Tbody, Tr, Th, Td, 
  Button, Badge, Dialog, Input, Spinner 
} from '../component/ui';
import { 
  CreditCard, Search, PlusCircle, CheckCircle2, 
  Clock, AlertTriangle, TrendingUp, DollarSign, Award, ArrowUpRight, Download
} from 'lucide-react';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function ManageBills() {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const userRole = useSelector((state: any) => state.auth.role) || Cookies.get('role');
  const isAdmin = userRole?.toLowerCase() === 'admin';

  const { 
    bills, 
    stats, 
    loading, 
    error, 
    message,
    totalResults,
    totalPages,
    page
  } = useSelector((state: any) => state.bill);

  const { flats } = useSelector((state: any) => state.flat);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedBill, setSelectedBill] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [pageNumber, setPageNumber] = useState(1);
  const [isPrintOpen, setIsPrintOpen] = useState(false);
  const [selectedBillForPrint, setSelectedBillForPrint] = useState<any>(null);

  const { 
    register, 
    handleSubmit, 
    reset, 
    formState: { errors } 
  } = useForm({
    defaultValues: {
      flatId: '',
      title: '',
      amount: '',
      dueDate: ''
    }
  });

  useEffect(() => {
    if (isAdmin) {
      dispatch(fetchFlats());
      dispatch(fetchBillStats());
    }
  }, [dispatch, isAdmin]);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      dispatch(fetchBills({
        page: pageNumber,
        search: searchTerm,
        status: selectedStatus || undefined
      }));
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [dispatch, pageNumber, searchTerm, selectedStatus]);

  useEffect(() => {
    if (error) {
      toast.error(error.message || 'Something went wrong');
      dispatch(clearBillError());
    }
    if (message) {
      toast.success(message);
      dispatch(clearBillMessage());
      if (isAdmin) {
        dispatch(fetchBillStats());
      }
    }
  }, [error, message, dispatch, isAdmin]);

  const handleOpenCreateDialog = () => {
    reset({ flatId: '', title: '', amount: '', dueDate: '' });
    setIsDialogOpen(true);
  };

  const onSubmitCreateBill = (data: any) => {
    dispatch(createBill(data)).then((res: any) => {
      if (!res.error) {
        setIsDialogOpen(false);
        dispatch(fetchBills({ page: 1 }));
      }
    });
  };

  const handlePayBillDirect = async (bill: any) => {
    if (!bill) return;
    try {
      const loadingToast = toast.loading('Initializing secure payment gateway...');
      
      // 1. Create a payment order on the backend
      const orderResponse = await axios.post(
        `${import.meta.env.VITE_API_URL}/payments/create-order`,
        { billId: bill._id },
        { withCredentials: true }
      );

      const orderData = orderResponse.data;
      toast.dismiss(loadingToast);

      // 2. Open Razorpay Checkout Modal
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_TJDLhHYMIThZhV',
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'SMS Portal',
        description: `Maintenance Bill: ${bill.title}`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          const verifyingToast = toast.loading('Verifying transaction signature...');
          try {
            // Verify payment signature on backend and mark bill paid
            await axios.post(
              `${import.meta.env.VITE_API_URL}/payments/verify-payment`,
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                billId: bill._id,
              },
              { withCredentials: true }
            );

            toast.dismiss(verifyingToast);
            toast.success('Maintenance bill payment processed successfully!');
            dispatch(fetchBills({ page: pageNumber }));
          } catch (verifyErr: any) {
            toast.dismiss(verifyingToast);
            toast.error(verifyErr.response?.data?.message || 'Payment signature verification failed.');
          }
        },
        prefill: {
          name: '',
          email: '',
          contact: '',
        },
        theme: {
          color: '#1e3a8a', // Matching primary blue branding sidebar color
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to initialize payment gateway.');
    }
  };

  const handlePrint = (bill: any) => {
    setSelectedBillForPrint(bill);
    setIsPrintOpen(true);
  };

  const triggerPrintWindow = () => {
    window.print();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle2 className="text-emerald-500 mr-1" size={14} />;
      case 'overdue':
        return <AlertTriangle className="text-rose-500 mr-1" size={14} />;
      default:
        return <Clock className="text-amber-500 mr-1" size={14} />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'paid':
        return 'success';
      case 'overdue':
        return 'danger';
      default:
        return 'warning';
    }
  };

  const unpaidBills = (bills || []).filter((b: any) => b.status !== 'paid');
  const paidBills = (bills || []).filter((b: any) => b.status === 'paid');
  const totalDuesAmount = unpaidBills.reduce((sum: number, b: any) => sum + b.amount, 0);
  const lastPaidBill = paidBills.length > 0 ? paidBills[0] : null;

  const collectionPercentage = stats && stats.totalBilled > 0 
    ? Math.round((stats.totalCollected / stats.totalBilled) * 100) 
    : 0;

  return (
    <div className="space-y-6 animate-fade-in print:p-0">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <CreditCard className="text-blue-600" size={24} />
            {isAdmin ? 'Society Billing & Maintenance' : 'My Maintenance & Bills'}
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {isAdmin 
              ? 'Issue maintenance bills, track unpaid balances, and review collections.' 
              : 'Review due amounts, transaction histories, and make instant secure payments.'}
          </p>
        </div>
        {isAdmin && (
          <Button 
            leftIcon={<PlusCircle size={18} />} 
            onClick={handleOpenCreateDialog}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Issue New Bill
          </Button>
        )}
      </div>

      {isAdmin && stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 print:hidden">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-blue-900/20">
            <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
              <TrendingUp size={22} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Collected</p>
              <h3 className="text-xl font-bold text-slate-800 mt-1">₹{stats.totalCollected.toLocaleString()}</h3>
              <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">{stats.paidCount} cleared invoices</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-blue-900/20">
            <div className="h-12 w-12 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 flex-shrink-0">
              <Clock size={22} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Outstanding</p>
              <h3 className="text-xl font-bold text-slate-800 mt-1">₹{stats.totalOutstanding.toLocaleString()}</h3>
              <p className="text-[10px] text-amber-600 font-semibold mt-0.5">{stats.unpaidCount} outstanding</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-blue-900/20">
            <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 flex-shrink-0">
              <DollarSign size={22} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Overall Generated</p>
              <h3 className="text-xl font-bold text-slate-800 mt-1">₹{stats.totalBilled.toLocaleString()}</h3>
              <p className="text-[10px] text-slate-400 font-semibold mt-0.5">{stats.paidCount + stats.unpaidCount} total statements</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-blue-100 bg-blue-50/10 shadow-sm flex flex-col justify-center gap-2.5 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-blue-900/20">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Collection Ratio</span>
              <span className="text-xs font-black text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">{collectionPercentage}%</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-blue-600 h-full rounded-full transition-all duration-500" 
                style={{ width: `${collectionPercentage}%` }} 
              />
            </div>
            <p className="text-[9px] text-slate-400 leading-none">High Collection Performance Rate</p>
          </div>
        </div>
      )}

      {!isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:hidden">
          <div className={`p-5 rounded-2xl border shadow-sm flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-blue-900/20 transition-colors ${totalDuesAmount > 0 ? 'bg-amber-50/20 border-amber-200' : 'bg-white border-slate-200'}`}>
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center flex-shrink-0 ${totalDuesAmount > 0 ? 'bg-amber-50 text-amber-600' : 'bg-blue-50 text-blue-600'}`}>
              {totalDuesAmount > 0 ? <AlertTriangle size={22} /> : <CheckCircle2 size={22} />}
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Outstanding Dues</p>
              <h3 className={`text-xl font-bold mt-1 ${totalDuesAmount > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                ₹{totalDuesAmount.toLocaleString()}
              </h3>
              <p className="text-[10px] text-slate-500 mt-0.5">
                {unpaidBills.length} billing statements pending
              </p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-blue-900/20">
            <div className="h-12 w-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
              <Award size={22} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Paid Statements</p>
              <h3 className="text-xl font-bold text-slate-800 mt-1">{paidBills.length}</h3>
              <p className="text-[10px] text-emerald-600 font-semibold mt-0.5">Transactions cleared successfully</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-blue-900/20">
            <div className="h-12 w-12 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 flex-shrink-0">
              <ArrowUpRight size={22} />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Last Payment Cleared</p>
              {lastPaidBill ? (
                <>
                  <h3 className="text-xl font-bold text-slate-800 mt-1">₹{lastPaidBill.amount.toLocaleString()}</h3>
                  <p className="text-[10px] text-slate-400 truncate max-w-[180px] mt-0.5">{lastPaidBill.title}</p>
                </>
              ) : (
                <>
                  <h3 className="text-base font-bold text-slate-400 mt-1">No receipts yet</h3>
                  <p className="text-[10px] text-slate-400 mt-0.5">Pending first payment setup</p>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm print:hidden">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Search bills by title..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm animate-scale-in"
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
            <option value="unpaid">Unpaid</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden print:hidden">
        {loading ? (
          <div className="p-12 flex justify-center"><Spinner size="md" /></div>
        ) : (
          <Table>
            <Thead>
              <Tr hover={false}>
                <Th>Invoice / Details</Th>
                <Th>Flat Number</Th>
                {isAdmin && <Th>Resident</Th>}
                <Th>Due Date</Th>
                <Th>Amount</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {bills.length > 0 ? (
                bills.map((b: any) => (
                  <Tr key={b._id} className="animate-scale-in">
                    <Td className="max-w-xs">
                      <div>
                        <p className="font-semibold text-slate-900 text-[14px]">{b.title}</p>
                        {b.transactionId ? (
                          <span className="text-[10px] text-slate-400 mt-1 block">Txn: {b.transactionId}</span>
                        ) : (
                          <span className="text-[10px] text-slate-400 mt-1 block">Created: {new Date(b.createdAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </Td>
                    <Td>
                      <span className="font-semibold text-slate-700 text-xs bg-slate-100 px-2 py-0.5 rounded">
                        Flat {b.flat?.flatNumber} ({b.flat?.block})
                      </span>
                    </Td>
                    {isAdmin && (
                      <Td>
                        <div className="flex flex-col">
                          <span className="font-semibold text-slate-800 text-xs">{b.resident?.name}</span>
                          <span className="text-[10px] text-slate-400">{b.resident?.email}</span>
                        </div>
                      </Td>
                    )}
                    <Td className="text-slate-500 text-xs">
                      {new Date(b.dueDate).toLocaleDateString()}
                    </Td>
                    <Td>
                      <span className="font-extrabold text-slate-900">₹{b.amount.toLocaleString()}</span>
                    </Td>
                    <Td>
                      <div className="flex items-center">
                        {getStatusIcon(b.status)}
                        <Badge variant={getStatusVariant(b.status)} className="capitalize">
                          {b.status}
                        </Badge>
                      </div>
                    </Td>
                    <Td className="text-right">
                      {!isAdmin && b.status !== 'paid' ? (
                        <Button 
                          size="sm" 
                          variant="primary" 
                          leftIcon={<CreditCard size={14} />}
                          onClick={() => handlePayBillDirect(b)}
                          className="transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0 hover:shadow-md hover:brightness-105 active:brightness-95 bg-blue-600 hover:bg-blue-700"
                        >
                          Pay Now
                        </Button>
                      ) : b.status === 'paid' ? (
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-emerald-600 text-[11px] font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/50">Receipt Clear</span>
                          {!isAdmin && (
                            <Button 
                              size="sm" 
                              variant="secondary"
                              onClick={() => handlePrint(b)}
                              title="Download Receipt PDF"
                              className="p-2 border border-slate-250 hover:border-blue-500 hover:text-blue-600 rounded-lg bg-white"
                            >
                              <Download size={14} />
                            </Button>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px] italic bg-slate-50 px-2.5 py-1 rounded-full border border-slate-200/50">Awaiting Payment</span>
                      )}
                    </Td>
                  </Tr>
                ))
              ) : (
                <Tr hover={false}>
                  <Td colSpan={isAdmin ? 7 : 6} className="text-center py-12 text-slate-500">
                    No billing statements found.
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
            <div className="text-xs text-slate-500">
              Showing <span className="font-semibold text-slate-700">{bills.length}</span> of{' '}
              <span className="font-semibold text-slate-700">{totalResults}</span> statements
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

      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Issue Maintenance Statement"
        footer={
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit(onSubmitCreateBill)} className="bg-blue-600 hover:bg-blue-700">Issue Statement</Button>
          </div>
        }
      >
        <form onSubmit={handleSubmit(onSubmitCreateBill)} className="space-y-4 py-2">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-700 ml-0.5">Select Target Flat</label>
            <select 
              className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
              {...register('flatId', { required: 'Target flat selection is required' })}
            >
              <option value="">Choose Flat</option>
              {flats.map((flat: any) => (
                <option key={flat._id} value={flat._id}>
                  Flat {flat.flatNumber} (Block {flat.block})
                </option>
              ))}
            </select>
            {errors.flatId && (
              <p className="text-[11px] text-rose-500 font-medium ml-0.5">{errors.flatId.message as string}</p>
            )}
          </div>

          <Input 
            label="Statement Description / Title" 
            placeholder="e.g. Monthly Maintenance - June 2026" 
            error={errors.title?.message as string}
            {...register('title', { required: 'Title is required' })}
          />

          <Input 
            label="Amount (INR)" 
            type="number" 
            placeholder="e.g. 2500" 
            error={errors.amount?.message as string}
            {...register('amount', { 
              required: 'Amount is required',
              min: { value: 1, message: 'Amount must be greater than zero' }
            })}
          />

          <Input 
            label="Due Date" 
            type="date" 
            error={errors.dueDate?.message as string}
            {...register('dueDate', { required: 'Due date is required' })}
          />
        </form>
      </Dialog>

      <Dialog
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        title="Maintenance Payment Receipt"
        footer={
          <div className="flex justify-end gap-2 print:hidden">
            <Button variant="secondary" onClick={() => setIsPrintOpen(false)}>Close</Button>
            <Button onClick={triggerPrintWindow} className="bg-blue-600 hover:bg-blue-700">Print / Download PDF</Button>
          </div>
        }
      >
        {selectedBillForPrint && (
          <div className="space-y-6 py-4 px-2 border-2 border-dashed border-slate-200 rounded-2xl bg-white text-slate-800">
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-1.5"><CreditCard className="text-blue-600" size={20} /> SMS Society Management</h2>
                <p className="text-slate-400 text-[10px] mt-0.5">Official Maintenance Payment Clearance Slips</p>
              </div>
              <div className="text-right">
                <Badge variant="success" className="font-bold bg-emerald-50 text-emerald-600 border border-emerald-200 px-3 py-1 rounded-full uppercase">PAID RECEIPT</Badge>
                <p className="text-slate-500 text-xs mt-1.5 font-bold">Issued for Society Dues</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-slate-400 font-semibold uppercase text-[9px] tracking-wider">Resident Details</p>
                <p className="font-bold text-slate-800 mt-0.5">{selectedBillForPrint.resident?.name || 'Society Resident'}</p>
                <p className="text-slate-500 text-[10px]">{selectedBillForPrint.resident?.email || ''}</p>
                <p className="text-slate-500 text-[10px] font-semibold bg-slate-100 px-2 py-0.5 rounded mt-1.5 inline-block">
                  Flat {selectedBillForPrint.flat?.flatNumber} ({selectedBillForPrint.flat?.block || ''})
                </p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 font-semibold uppercase text-[9px] tracking-wider">Transaction Details</p>
                <p className="font-mono text-slate-800 mt-0.5 font-bold">TXN-{selectedBillForPrint._id?.slice(-8).toUpperCase()}</p>
                {selectedBillForPrint.transactionId && (
                  <p className="text-[10px] text-slate-400 font-mono mt-0.5">Gateway Ref: {selectedBillForPrint.transactionId}</p>
                )}
                <p className="text-slate-500 text-[10px] mt-1 font-semibold">Cleared Date: {new Date(selectedBillForPrint.paymentDate || Date.now()).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="border-t border-b border-slate-100 py-3 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Bill Description</span>
                <span className="font-semibold text-slate-800">{selectedBillForPrint.title}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Due Date</span>
                <span className="font-semibold text-slate-800">{new Date(selectedBillForPrint.dueDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Payment Mode</span>
                <span className="font-semibold text-slate-800 capitalize">{selectedBillForPrint.paymentMethod || 'card'}</span>
              </div>
            </div>

            <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-150">
              <span className="text-xs font-bold text-slate-700">Amount Paid In Full</span>
              <span className="text-lg font-black text-blue-700">₹{selectedBillForPrint.amount.toLocaleString()}</span>
            </div>

            <div className="text-center pt-2">
              <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1 font-semibold"><Award size={12} className="text-blue-500" /> Digital Transaction Authenticated Successfully</span>
            </div>
          </div>
        )}
      </Dialog>

    </div>
  );
}

export default ManageBills;
