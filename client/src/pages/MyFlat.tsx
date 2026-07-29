import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { getResidentFlat } from '../redux/slice/flatSlice';
import { fetchBills } from '../redux/slice/billSlice';
import { fetchComplaints } from '../redux/slice/complaintSlice';
import { fetchNotices } from '../redux/slice/noticeSlice';
import { Spinner, Badge, Button } from '../component/ui';
import { 
  Home, ShieldCheck, Zap, Droplet, Wifi, AlertTriangle, 
  CreditCard, ShieldAlert, ArrowRight, Sparkles, Users, 
  Volume2, FileText, CheckCircle, Calendar, Phone, Mail, Award
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axios from 'axios';

function MyFlat() {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  
  // Select state from redux store
  const { name } = useSelector((state: any) => state.auth);
  const { flat, loading: flatLoading } = useSelector((state: any) => state.flat);
  const { bills, loading: billsLoading } = useSelector((state: any) => state.bill);
  const { complaints, loading: complaintsLoading } = useSelector((state: any) => state.complaint);
  const { notices, loading: noticesLoading } = useSelector((state: any) => state.notice);

  const [familyMembers, setFamilyMembers] = useState<any[]>([]);

  useEffect(() => {
    // 1. Fetch resident flat details
    dispatch(getResidentFlat());
    // 2. Fetch bills, complaints, and notices
    dispatch(fetchBills({}));
    dispatch(fetchComplaints({}));
    dispatch(fetchNotices({}));
  }, [dispatch]);

  // Fetch family members when flat data becomes available
  useEffect(() => {
    if (flat) {
      const flatId = flat._id || flat;
      const userId = Cookies.get('id');
      
      axios.get(`${import.meta.env.VITE_API_URL}/users?flat=${flatId}`, {
        withCredentials: true
      })
      .then(res => {
        if (res.data?.data) {
          // Filter out the primary owner
          const members = res.data.data.filter((u: any) => u._id !== userId && u.isFlatOwner === false);
          setFamilyMembers(members);
        }
      })
      .catch(err => {
        console.error('Error fetching family details:', err);
      });
    }
  }, [flat]);

  const isLoading = flatLoading || billsLoading || complaintsLoading || noticesLoading;

  if (isLoading && !flat) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!flat) {
    return (
      <div className="p-8 bg-white border border-slate-200 rounded-2xl text-center max-w-lg mx-auto shadow-sm animate-scale-in mt-12 space-y-4">
        <Home size={48} className="mx-auto text-slate-300" />
        <h2 className="text-xl font-bold text-slate-800">No Assigned Flat Found</h2>
        <p className="text-slate-500 text-sm leading-relaxed font-semibold">
          It looks like you are not currently assigned to any flat in the society records. Flat assignment is mandatory for residents to access portal dashboards.
        </p>
        <div className="bg-slate-50 p-4 rounded-xl text-left border border-slate-100">
          <p className="text-xs text-slate-500 font-semibold leading-relaxed">
            ⚠️ <strong className="text-slate-700">Notice:</strong> First, the society Admin must create a profile for you, assign it to a valid Block/Floor/Flat Number, and generate your login username and password.
          </p>
        </div>
        <Button onClick={() => navigate('/login')} className="w-full bg-blue-600 hover:bg-blue-700">
          Back to Login
        </Button>
      </div>
    );
  }

  // Calculate unpaid bills and metrics
  const unpaidBills = bills?.filter((b: any) => b.status?.toLowerCase() === 'pending' || b.status?.toLowerCase() === 'unpaid') || [];
  const totalDuesAmount = unpaidBills.reduce((sum: number, b: any) => sum + (b.amount || 0), 0);
  const pendingComplaints = complaints?.filter((c: any) => c.status?.toLowerCase() === 'pending') || [];
  const latestNotices = notices?.slice(0, 3) || [];

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      {/* Welcome Header */}
      <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            Welcome Home, {name}!
          </h1>
        </div>
        <Badge variant="success" className="w-fit px-3 py-1 font-bold text-xs capitalize flex items-center gap-1.5 shadow-sm">
          <ShieldCheck size={14} /> Registered Resident
        </Badge>
      </div>

      {/* Stats Widgets */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Flat Overview */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Home size={22} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">My Flat</span>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">Flat {flat.flatNumber}</h3>
          </div>
        </div>

        {/* Pending Dues */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className={`p-3 rounded-xl ${totalDuesAmount > 0 ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
            <CreditCard size={22} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Pending Dues</span>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">
              {totalDuesAmount > 0 ? `₹${totalDuesAmount}` : 'No Dues'}
            </h3>
          </div>
        </div>

        {/* Active Complaints */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className={`p-3 rounded-xl ${pendingComplaints.length > 0 ? 'bg-rose-50 text-rose-600' : 'bg-slate-50 text-slate-500'}`}>
            <ShieldAlert size={22} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Active Complaints</span>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">{pendingComplaints.length} Pending</h3>
          </div>
        </div>

        {/* Notices */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
            <Volume2 size={22} />
          </div>
          <div>
            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Announcements</span>
            <h3 className="text-lg font-bold text-slate-900 mt-0.5">{notices?.length || 0} Total</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Columns (Flat & Family Info) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Main Registry Details */}
          <div className="relative overflow-hidden bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all duration-300 hover:shadow-md">
            <div className="absolute top-0 left-0 bottom-0 w-2 bg-blue-600" />
            <div className="space-y-3 pl-2">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Verified Flat Registry</span>
                <Badge variant="success" className="text-[9px] font-bold py-0.5 px-2">Active</Badge>
              </div>
              <h2 className="text-3xl font-extrabold text-slate-950">
                Flat {flat.flatNumber}
              </h2>
              <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs font-semibold text-slate-500 mt-2">
                <span className="flex items-center gap-1.5"><Zap size={14} className="text-blue-600" /> Block {flat.block}</span>
                <span className="flex items-center gap-1.5"><Droplet size={14} className="text-blue-600" /> Floor {flat.floor}</span>
                <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-blue-600" /> Occupancy Verified</span>
              </div>
            </div>
            <div className="flex items-center justify-center h-20 w-20 rounded-2xl bg-blue-50 text-blue-600 flex-shrink-0">
              <Sparkles size={36} />
            </div>
          </div>

          {/* Family Directory */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <Users size={16} className="text-blue-500" /> Family Directory
            </h3>
            {familyMembers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {familyMembers.map((member) => (
                  <div key={member._id} className="bg-slate-50 border border-slate-200/60 p-3 rounded-xl flex justify-between items-center shadow-sm">
                    <div className="space-y-1">
                      <p className="font-bold text-slate-800 text-xs">
                        {member.name}, {member.relationWithOwner || 'Family'}
                      </p>
                      {member.phone && (
                        <p className="text-[9px] font-semibold text-slate-500 flex items-center gap-1">
                          <Phone size={10} /> +{member.phone}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs italic border border-dashed border-slate-100 rounded-xl">
                No family members registered under this flat.
              </div>
            )}
          </div>

          {/* Included Utilities */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
              Included Premium Utilities & Amenities
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-semibold">
              <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600"><Droplet size={16} /></div>
                <div>
                  <h4 className="text-slate-800 font-bold">Continuous Water Supply</h4>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">24/7 reverse osmosis filtration pipeline enabled.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600"><Zap size={16} /></div>
                <div>
                  <h4 className="text-slate-800 font-bold">100% Power Backup</h4>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">Dual-grid connection with automated generator backup.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600"><Wifi size={16} /></div>
                <div>
                  <h4 className="text-slate-800 font-bold">Fiber Internet Gateway</h4>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">Pre-routed optical distribution box configured.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 hover:bg-slate-50 transition-colors">
                <div className="p-2 rounded-lg bg-blue-50 text-blue-600"><ShieldCheck size={16} /></div>
                <div>
                  <h4 className="text-slate-800 font-bold">24/7 Security Guard Desk</h4>
                  <p className="text-[10px] text-slate-400 font-medium mt-0.5">Automated visitor passes and regular area sweeps.</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column (Actions & Announcements) */}
        <div className="space-y-6">
          {/* Quick Actions Card */}
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 shadow-md text-white space-y-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 h-40 w-40 bg-blue-500/10 rounded-full blur-3xl" />
            <h3 className="text-sm font-bold flex items-center gap-2 text-blue-400">
              <ShieldCheck size={18} />
              Residence Command
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed font-semibold">
              Instantly review maintenance statements, register active flat complaints, or request security logs.
            </p>
            <div className="space-y-3 pt-2">
              <button 
                onClick={() => navigate('/dashboard/payments')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-xs font-bold cursor-pointer"
              >
                <span className="flex items-center gap-2"><CreditCard size={16} className="text-blue-400" /> Pay Dues / Invoices</span>
                <ArrowRight size={14} />
              </button>
              <button 
                onClick={() => navigate('/dashboard/my-complaints')}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-xs font-bold cursor-pointer"
              >
                <span className="flex items-center gap-2"><ShieldAlert size={16} className="text-rose-400" /> Lodge a Complaint</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>

          {/* Recent Announcements Panel */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-2.5 flex items-center gap-2">
              <Volume2 size={16} className="text-indigo-500" /> Recent Announcements
            </h3>
            {latestNotices.length > 0 ? (
              <div className="space-y-4">
                {latestNotices.map((notice: any) => (
                  <div key={notice._id} className="space-y-1.5 border-b border-slate-50 last:border-b-0 pb-3 last:pb-0">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-slate-800 text-xs truncate max-w-[150px]">{notice.title}</h4>
                      <span className="text-[9px] font-semibold text-slate-400">{new Date(notice.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-semibold leading-relaxed line-clamp-2">
                      {notice.content}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-slate-400 text-xs italic border border-dashed border-slate-100 rounded-xl">
                No recent announcements.
              </div>
            )}
          </div>

          {/* Safety Gate Alert */}
          <div className="bg-white p-5 rounded-2xl border border-amber-200/60 bg-amber-50/10 shadow-sm flex items-start gap-3">
            <AlertTriangle size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <h4 className="font-bold text-slate-800">Security Gatekeeper Alert</h4>
              <p className="text-[10px] text-slate-500 mt-1 leading-relaxed font-semibold">
                Please make sure to approve all visitor logs inside the Visitor Panel to allow guards to clear incoming guests.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyFlat;
