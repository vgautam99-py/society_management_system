import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { 
  Table, Thead, Tbody, Tr, Th, Td, 
  Button, Badge, Dialog, Input, Spinner 
} from '../component/ui';
import { 
  ClipboardList, PlusCircle, Calendar, DollarSign, 
  User, CheckCircle2, Landmark, Printer, Sparkles 
} from 'lucide-react';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';

function ManagePayslips() {
  const userRole = useSelector((state: any) => state.auth.role) || Cookies.get('role');
  const isAdmin = userRole?.toLowerCase() === 'admin';

  const [payslips, setPayslips] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [staffList, setStaffList] = useState<any[]>([]);
  const [selectedPayslip, setSelectedPayslip] = useState<any>(null);
  const [isPrintOpen, setIsPrintOpen] = useState(false);

  // Forms setup
  const { 
    register, 
    handleSubmit, 
    reset, 
    watch,
    formState: { errors } 
  } = useForm({
    defaultValues: {
      staffId: '',
      month: '',
      basicSalary: '',
      allowances: '',
      deductions: ''
    }
  });

  const basicSalaryVal = Number(watch('basicSalary') || 0);
  const allowancesVal = Number(watch('allowances') || 0);
  const deductionsVal = Number(watch('deductions') || 0);
  const netSalaryVal = basicSalaryVal + allowancesVal - deductionsVal;

  const loadPayslips = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/payslips`, { withCredentials: true });
      setPayslips(res.data.data);
    } catch (err) {
      toast.error('Failed to load payslips.');
    } finally {
      setLoading(false);
    }
  };

  const loadStaff = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/users?role=Staff`, { withCredentials: true });
      setStaffList(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadPayslips();
    if (isAdmin) {
      loadStaff();
    }
  }, [isAdmin]);

  const handleOpenCreateDialog = () => {
    reset({
      staffId: '',
      month: new Date().toLocaleString('default', { month: 'long', year: 'numeric' }),
      basicSalary: '15000',
      allowances: '2000',
      deductions: '500'
    });
    setIsDialogOpen(true);
  };

  const onSubmitPayslip = async (data: any) => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/payslips`, data, { withCredentials: true });
      toast.success('Payslip generated and recorded successfully.');
      setIsDialogOpen(false);
      loadPayslips();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to generate payslip.');
    }
  };

  const handlePrint = (payslip: any) => {
    setSelectedPayslip(payslip);
    setIsPrintOpen(true);
  };

  const triggerPrintWindow = () => {
    window.print();
  };

  return (
    <div className="space-y-6 animate-fade-in print:p-0">
      {/* Header section (hidden during print) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <ClipboardList className="text-blue-600" size={24} />
            {isAdmin ? 'Staff Payroll & Salaries' : 'My Salary Slips'}
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {isAdmin 
              ? 'Generate monthly payslips, track deductions, and manage staff disbursements.' 
              : 'Review and print your monthly salary statements and payment receipts.'}
          </p>
        </div>
        {isAdmin && (
          <Button 
            leftIcon={<PlusCircle size={18} />} 
            onClick={handleOpenCreateDialog}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Generate Payslip
          </Button>
        )}
      </div>

      {/* Payslips Table List (hidden during print) */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden print:hidden">
        {loading ? (
          <div className="p-12 flex justify-center"><Spinner size="md" /></div>
        ) : (
          <Table>
            <Thead>
              <Tr hover={false}>
                <Th>Staff Member</Th>
                <Th>Month / Period</Th>
                <Th>Basic Salary</Th>
                <Th>Allowances / Deduct.</Th>
                <Th>Net Salary</Th>
                <Th>Status</Th>
                <Th className="text-right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {payslips.length > 0 ? (
                payslips.map((p: any) => (
                  <Tr key={p._id}>
                    <Td>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-xs">
                          {p.staff?.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800 text-xs">{p.staff?.name}</p>
                          <p className="text-[10px] text-slate-400">{p.staff?.email}</p>
                        </div>
                      </div>
                    </Td>
                    <Td className="text-slate-600 text-xs font-semibold">
                      {p.month}
                    </Td>
                    <Td className="text-slate-700 text-xs">
                      ₹{p.basicSalary.toLocaleString()}
                    </Td>
                    <Td className="text-xs text-slate-500 font-medium">
                      <span className="text-emerald-650">+₹{p.allowances}</span> / <span className="text-rose-550">-₹{p.deductions}</span>
                    </Td>
                    <Td className="font-bold text-slate-900 text-xs">
                      ₹{p.netSalary.toLocaleString()}
                    </Td>
                    <Td>
                      <Badge variant="success" className="flex items-center gap-1 w-fit font-semibold py-0.5 px-2 text-[10px]">
                        <CheckCircle2 size={10} /> Disbursed
                      </Badge>
                    </Td>
                    <Td className="text-right">
                      <Button 
                        size="sm" 
                        variant="secondary" 
                        leftIcon={<Printer size={12} />}
                        onClick={() => handlePrint(p)}
                      >
                        View Slips
                      </Button>
                    </Td>
                  </Tr>
                ))
              ) : (
                <Tr hover={false}>
                  <Td colSpan={7} className="text-center py-12 text-slate-500">
                    No salary slips found in society logs.
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        )}
      </div>

      {/* Generate Payslip Dialog (Admins Only) */}
      {isAdmin && (
        <Dialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          title="Generate Staff Salary Slip"
          footer={
            <div className="flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSubmit(onSubmitPayslip)} className="bg-blue-600 hover:bg-blue-700">Disburse Salary</Button>
            </div>
          }
        >
          <form onSubmit={handleSubmit(onSubmitPayslip)} className="space-y-4 py-2">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-slate-700 ml-0.5">Select Target Staff</label>
              <select 
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all"
                {...register('staffId', { required: 'Please select a staff member' })}
              >
                <option value="">Choose Staff User</option>
                {staffList.map((staff) => (
                  <option key={staff._id} value={staff._id}>
                    {staff.name} ({staff.email})
                  </option>
                ))}
              </select>
              {errors.staffId && (
                <p className="text-[11px] text-rose-500 font-medium ml-0.5">{errors.staffId.message as string}</p>
              )}
            </div>

            <Input 
              label="Salary Period / Month" 
              placeholder="e.g. July 2026" 
              error={errors.month?.message as string}
              {...register('month', { required: 'Month is required' })}
            />

            <div className="grid grid-cols-3 gap-4">
              <Input 
                label="Basic Salary (INR)" 
                type="number"
                error={errors.basicSalary?.message as string}
                {...register('basicSalary', { required: 'Basic is required' })}
              />
              <Input 
                label="Allowances (INR)" 
                type="number"
                {...register('allowances')}
              />
              <Input 
                label="Deductions (INR)" 
                type="number"
                {...register('deductions')}
              />
            </div>

            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 flex justify-between items-center mt-3">
              <div>
                <p className="text-xs font-semibold text-slate-500">Auto-Calculated Payout</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Basic + Allowances - Deductions</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-semibold text-slate-500 uppercase">Net Salary</span>
                <h3 className="text-lg font-black text-blue-700 mt-0.5">₹{netSalaryVal.toLocaleString()}</h3>
              </div>
            </div>
          </form>
        </Dialog>
      )}

      {/* Slips View / Print Modal */}
      <Dialog
        isOpen={isPrintOpen}
        onClose={() => setIsPrintOpen(false)}
        title="Disbursed Salary Receipt"
        footer={
          <div className="flex justify-end gap-2 print:hidden">
            <Button variant="secondary" onClick={() => setIsPrintOpen(false)}>Close</Button>
            <Button leftIcon={<Printer size={16} />} onClick={triggerPrintWindow} className="bg-blue-600 hover:bg-blue-700">Print Slip</Button>
          </div>
        }
      >
        {selectedPayslip && (
          <div className="space-y-6 py-4 px-2 border-2 border-dashed border-slate-200 rounded-2xl bg-white text-slate-800">
            <div className="flex justify-between items-start border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-1.5"><Landmark className="text-blue-600" size={20} /> SMS Society Payroll</h2>
                <p className="text-slate-400 text-[10px] mt-0.5">Automated payroll distribution logs</p>
              </div>
              <div className="text-right">
                <Badge variant="success" className="font-bold">PAID RECEIPT</Badge>
                <p className="text-slate-500 text-xs mt-1.5 font-bold">{selectedPayslip.month}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <p className="text-slate-400 font-semibold uppercase text-[9px] tracking-wider">Employee Name</p>
                <p className="font-bold text-slate-800 mt-0.5">{selectedPayslip.staff?.name}</p>
                <p className="text-slate-500 text-[10px]">{selectedPayslip.staff?.email}</p>
              </div>
              <div className="text-right">
                <p className="text-slate-400 font-semibold uppercase text-[9px] tracking-wider">Transaction ID</p>
                <p className="font-mono text-slate-800 mt-0.5 font-bold">SLIP-{selectedPayslip._id?.slice(-8).toUpperCase()}</p>
                <p className="text-slate-500 text-[10px]">{new Date(selectedPayslip.paymentDate || selectedPayslip.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            <div className="border-t border-b border-slate-100 py-3 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Basic Salary</span>
                <span className="font-semibold text-slate-800">₹{selectedPayslip.basicSalary.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Allowances</span>
                <span className="font-semibold text-slate-800">+₹{selectedPayslip.allowances.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Deductions</span>
                <span className="font-semibold text-slate-800">-₹{selectedPayslip.deductions.toLocaleString()}</span>
              </div>
            </div>

            <div className="flex justify-between items-center bg-slate-50 p-4 rounded-xl border border-slate-150">
              <span className="text-xs font-bold text-slate-700">Net Salary Disbursed</span>
              <span className="text-lg font-black text-blue-700">₹{selectedPayslip.netSalary.toLocaleString()}</span>
            </div>

            <div className="text-center pt-2">
              <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1 font-semibold"><Sparkles size={12} className="text-blue-500" /> Digital Signature Verified by Admin Desk</span>
            </div>
          </div>
        )}
      </Dialog>
    </div>
  );
}

export default ManagePayslips;
