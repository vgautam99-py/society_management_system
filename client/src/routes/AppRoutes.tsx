// App router layout config
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from '../pages/Login';
import Dashboard from '../component/Dashboard';
import ProtectedRoutes from '../component/ProtectedRoutes';
import OpenRoutes from '../component/OpenRoutes';
import ManageUsers from '../component/ManageUsers';
import Stats from '../component/Stats';
import { useSelector } from 'react-redux';
import ManageFlat from '../pages/ManageFlat';
import ManageComplaints from '../pages/ManageComplaints';
import ManageNotices from '../pages/ManageNotices';
import MyFlat from '../pages/MyFlat';
import Home from '../pages/Home';
import ManageBills from '../pages/ManageBills';
import Profile from '../pages/Profile';
import ManagePayslips from '../pages/ManagePayslips';
import Checkout from '../pages/Checkout';
import ManageAttendance from '../pages/ManageAttendance';
import ResidentForm from '../pages/ResidentForm';
import ResidentDetail from '../pages/ResidentDetail';
import ManagePlans from '../pages/ManagePlans';

interface RoleProtectedRouteProps {
  allowedRoles: string[];
  children: React.ReactElement;
}

const RoleProtectedRoute = ({ allowedRoles, children }: RoleProtectedRouteProps) => {
  const { role } = useSelector((state: any) => state.auth);
  const userRole = role?.toLowerCase() || '';
  
  if (userRole === 'admin') {
    return children;
  }
  
  if (!allowedRoles.map(r => r.toLowerCase()).includes(userRole)) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[60vh] text-center animate-fade-in">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <h2 className="text-xl font-bold text-slate-800 mb-2">Access Denied</h2>
        <p className="text-slate-500 text-sm max-w-sm">
          Your role type <strong>{role || 'unknown'}</strong> does not have permission to access this page.
        </p>
      </div>
    );
  }
  
  return children;
};

const RoleBasedIndex = () => {
  const { role } = useSelector((state: any) => state.auth);
  const userRole = role?.toLowerCase();
  if (userRole === 'admin') return <Stats />;
  if (userRole === 'resident') return <MyFlat />;
  if (userRole === 'staff') return <Stats />;
  return <div className="p-8 text-center text-slate-500 font-semibold text-sm">Welcome to Society Management Portal</div>;
};

function AppRoutes() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route element={<OpenRoutes />}>
          <Route path="/login" element={<Login />} />
          <Route path="/payment/checkout/:billId" element={<Checkout />} />
        </Route>

        <Route element={<ProtectedRoutes />}>
          <Route path="/dashboard" element={<Dashboard />}>
            <Route index element={<RoleBasedIndex />} />
            
            {/* Admin Only Routes */}
            <Route path="stats" element={<RoleProtectedRoute allowedRoles={['Admin']}><Stats /></RoleProtectedRoute>} />
            <Route path="flats" element={<RoleProtectedRoute allowedRoles={['Admin']}><ManageFlat /></RoleProtectedRoute>} />
            <Route path="residents" element={<RoleProtectedRoute allowedRoles={['Admin']}><ManageUsers roleFilter="Resident" /></RoleProtectedRoute>} />
            <Route path="residents/create" element={<RoleProtectedRoute allowedRoles={['Admin']}><ResidentForm /></RoleProtectedRoute>} />
            <Route path="residents/edit/:id" element={<RoleProtectedRoute allowedRoles={['Admin']}><ResidentForm /></RoleProtectedRoute>} />
            <Route path="residents/view/:id" element={<RoleProtectedRoute allowedRoles={['Admin']}><ResidentDetail /></RoleProtectedRoute>} />
            <Route path="staff" element={<RoleProtectedRoute allowedRoles={['Admin']}><ManageUsers roleFilter="Staff" /></RoleProtectedRoute>} />
            <Route path="attendance" element={<RoleProtectedRoute allowedRoles={['Admin']}><ManageAttendance /></RoleProtectedRoute>} />
            <Route path="plans" element={<RoleProtectedRoute allowedRoles={['Admin']}><ManagePlans /></RoleProtectedRoute>} />

            {/* Shared routes */}
            <Route path="complaints" element={
              <RoleProtectedRoute allowedRoles={['Staff']}>
                <ManageComplaints />
              </RoleProtectedRoute>
            } />
            <Route path="my-complaints" element={
              <RoleProtectedRoute allowedRoles={['Resident']}>
                <ManageComplaints />
              </RoleProtectedRoute>
            } />
            <Route path="notices" element={
              <RoleProtectedRoute allowedRoles={['Resident', 'Staff']}>
                <ManageNotices />
              </RoleProtectedRoute>
            } />

            {/* Resident Only Routes */}
            <Route path="my-flat" element={<RoleProtectedRoute allowedRoles={['Resident']}><MyFlat /></RoleProtectedRoute>} />
            <Route path="payments" element={<RoleProtectedRoute allowedRoles={['Resident']}><ManageBills /></RoleProtectedRoute>} />

            {/* Payslips for Admin & Staff */}
            <Route path="payslips" element={
              <RoleProtectedRoute allowedRoles={['Admin', 'Staff']}>
                <ManagePayslips />
              </RoleProtectedRoute>
            } />



            {/* Profile for All */}
            <Route path="profile" element={<Profile />} />
          </Route>
        </Route>
      </Routes>
    </div>
  );
}

export default AppRoutes;
