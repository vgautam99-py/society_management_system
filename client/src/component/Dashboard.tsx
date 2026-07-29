import React from 'react';
import { useSelector } from 'react-redux';
import LayoutWrapper from './LayoutWrapper';
import {
  LayoutDashboard,
  Users,
  Home,
  ShieldAlert,
  Megaphone,
  CreditCard,
  UserCheck,
  ShieldCheck,
  TrendingUp,
  Package,
  Car,
  Users2,
  User,
  ClipboardList,
} from 'lucide-react';
import { Outlet } from 'react-router-dom';

const Dashboard = () => {
  const { role } = useSelector((state: any) => state.auth);

  const getNavItems = () => {
    switch (role?.toLowerCase()) {
      case 'admin':
        return [
          { label: 'Dashboard', path: '/dashboard/stats', icon: LayoutDashboard },
          { label: 'Flats', path: '/dashboard/flats', icon: Home },
          { label: 'Residents', path: '/dashboard/residents', icon: Users },
          { label: 'Staff', path: '/dashboard/staff', icon: Users2 },
          { label: 'Attendance', path: '/dashboard/attendance', icon: UserCheck },
          { label: 'Complaints', path: '/dashboard/complaints', icon: ShieldAlert },
          { label: 'Payment', path: '/dashboard/payments', icon: CreditCard },
          { label: 'Salaries', path: '/dashboard/payslips', icon: ClipboardList },
          { label: 'Announcements', path: '/dashboard/notices', icon: Megaphone },
          { label: 'Plans', path: '/dashboard/plans', icon: ShieldCheck },
          { label: 'Settings', path: '/dashboard/profile', icon: User },
        ];
      case 'staff':
        return [
          { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { label: 'My Payslips', path: '/dashboard/payslips', icon: ClipboardList },
          { label: 'Complaints Box', path: '/dashboard/complaints', icon: ShieldAlert },
          { label: 'Announcements', path: '/dashboard/notices', icon: Megaphone },
          { label: 'My Settings', path: '/dashboard/profile', icon: User },
        ];
      case 'resident':
        return [
          { label: 'My Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { label: 'Payments', path: '/dashboard/payments', icon: CreditCard },
          { label: 'My Complaints', path: '/dashboard/my-complaints', icon: ShieldAlert },
          { label: 'Announcements', path: '/dashboard/notices', icon: Megaphone },
          { label: 'My Settings', path: '/dashboard/profile', icon: User },
        ];
      default:
        return [
          { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        ];
    }
  };

  return (
    <LayoutWrapper navItems={getNavItems()}>
      <Outlet />
    </LayoutWrapper>
  );
};

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ComponentType<any>;
  color: string;
  trend: string;
}

export const StatsCard = ({ title, value, icon: Icon, color, trend }: StatsCardProps) => (
  <div className="border border-slate-200 bg-white rounded-2xl shadow-sm p-6 flex flex-col justify-between group hover:border-blue-500/30 transition-all cursor-pointer">
    <div className="flex justify-between items-start mb-4">
      <div
        className={`p-3 rounded-xl ${color} text-white shadow-lg shadow-inherit/20`}
      >
        <Icon size={22} />
      </div>
      <div className="text-right">
        <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">
          {title}
        </p>
        <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
      </div>
    </div>
    <div className="pt-4 border-t border-slate-50">
      <div className="flex items-center gap-1.5">
        <TrendingUp size={14} className="text-emerald-500" />
        <span className="text-[11px] font-medium text-slate-600">{trend}</span>
      </div>
    </div>
  </div>
);

export default Dashboard;
