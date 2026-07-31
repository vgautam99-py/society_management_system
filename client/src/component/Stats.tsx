import React, { useEffect, useState } from 'react'
import { 
    LayoutDashboard, Users, Home, 
    ShieldAlert, Megaphone, CreditCard, 
    ClipboardList, UserCheck, ShieldCheck,
    Activity, TrendingUp, Package, Car,
    Outdent
  } from 'lucide-react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Spinner } from './ui';
  
function Stats() {
  const { role } = useSelector((state: any) => state.auth);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalResidents: 0,
    occupancyRate: 0,
    activeStaff: 0,
    totalStaff: 0,
    pendingIssues: 0,
    recentAlerts: [] as any[],

    // Staff stats fields
    completedTasks: 0,
    totalTasks: 0,
    efficiency: 100,
    activeTasks: 0,
    totalAnnouncements: 0,
  });

  const fetchStats = async () => {
    try {
      setLoading(true);
      const endpoint = role?.toLowerCase() === 'staff' ? '/staff-stats' : '/society-stats';
      const response = await axios.get(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        withCredentials: true
      });
      if (response.data?.success) {
        setStats({
          ...stats,
          ...response.data.data
        });
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, [role]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Spinner size="lg" />
      </div>
    );
  }
 
  const isStaff = role?.toLowerCase() === 'staff';

  return (
     <div>
        <div className="space-y-8 animate-in fade-in duration-700">
          <header>
            <h1 className="text-2xl font-bold text-slate-900">{isStaff ? "Staff Dashboard" : "Administrator Console"}</h1>
            <p className="text-slate-500 text-sm mt-1">{isStaff ? "View your assigned tasks and society notifications." : "Manage society operations and user access control."}</p>
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {!isStaff ? (
              <>
                <StatsCard title="Total Residents" value={stats.totalResidents} icon={Users} color="bg-blue-500" trend="Real-time" />
                <StatsCard title="Occupancy Rate" value={`${stats.occupancyRate}%`} icon={Home} color="bg-emerald-500" trend="Real-time" />
                <StatsCard title="Total Staff" value={`${stats.activeStaff}/${stats.totalStaff}`} icon={ShieldCheck} color="bg-indigo-500" trend="Active / Total" />
                <StatsCard title="Pending Issues" value={stats.pendingIssues} icon={ShieldAlert} color="bg-orange-500" trend="Unresolved" />
              </>
            ) : (
              <>
                <StatsCard title="Tasks" value={`${stats.completedTasks}/${stats.totalTasks}`} icon={ClipboardList} color="bg-blue-500" trend="Completed / Assigned" />
                <StatsCard title="Personal Efficiency" value={`${stats.efficiency}%`} icon={ShieldCheck} color="bg-emerald-500" trend="Tasks Success Ratio" />
                <StatsCard title="Active Tasks" value={stats.activeTasks} icon={ShieldAlert} color="bg-orange-500" trend="Pending Resolution" />
                <StatsCard title="Announcements" value={stats.totalAnnouncements} icon={Megaphone} color="bg-indigo-500" trend="Total Notices" />
              </>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
             <div className="lg:col-span-2 ds-panel p-6">
                <div className="flex items-center justify-between mb-6">
                   <h3 className="text-lg font-bold">{isStaff ? "Tasks Overview" : "Society Overview"}</h3>
                   <Activity className="text-slate-400" size={20} />
                </div>
                <div className="h-64 bg-slate-50 rounded-xl border border-dashed border-slate-200 flex items-center justify-center">
                   <p className="text-slate-400 text-sm">{isStaff ? "Tasks Completion Trend Graph Placeholder" : "Society Activity Graph Placeholder"}</p>
                </div>
             </div>
             <div className="ds-panel p-6">
                <h3 className="text-lg font-bold mb-6">Recent Alerts</h3>
                <div className="space-y-4">
                  {stats.recentAlerts.length > 0 ? (
                    stats.recentAlerts.map((alert: any) => (
                      <div key={alert.id} className="flex gap-3 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                        <div className="w-2 h-2 rounded-full bg-orange-500 mt-2"></div>
                        <div>
                          <p className="text-sm font-medium text-slate-800">{alert.title}</p>
                          <p className="text-[11px] text-slate-450">By {alert.residentName} • {new Date(alert.createdAt).toLocaleString()}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-12 text-slate-450 text-sm italic">
                      {isStaff ? "No active tasks or alerts assigned to you." : "No recent alerts or unresolved complaints."}
                    </div>
                  )}
                </div>
             </div>
          </div>
        </div>  
     </div>
  );
}


// Helper Component for Stats Cards
const StatsCard = ({ title, value, icon: Icon, color, trend }: any) => (
  <div className="ds-panel p-6 flex flex-col justify-between group hover:border-primary-500/30 transition-all cursor-pointer max-[550px]:items-center max-[550px]:text-center">
    <div className="flex justify-between items-start mb-4 max-[550px]:flex-col max-[550px]:items-center max-[550px]:text-center max-[550px]:gap-4 w-full">
      <div className={`p-3 rounded-xl ${color} text-white shadow-lg shadow-inherit/20`}>
        <Icon size={22} />
      </div>
      <div className="text-right max-[550px]:text-center">
        <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
      </div>
    </div>
    <div className="pt-4 border-t border-slate-50 w-full">
      <div className="flex items-center gap-1.5 max-[550px]:justify-center">
        <TrendingUp size={14} className="text-emerald-500" />
        <span className="text-[11px] font-medium text-slate-600">{trend}</span>
      </div>
    </div>
  </div>
);


export default Stats
