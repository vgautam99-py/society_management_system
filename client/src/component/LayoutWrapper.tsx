import React, { useState, useRef, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import {
  Menu,
  X,
  LogOut,
  Bell,
  User,
  LayoutDashboard,
  Users,
  Home,
  ShieldAlert,
  Megaphone,
  CreditCard,
  ClipboardList,
  UserCheck,
  Shield,
  Camera,
  Settings,
  Plus
} from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { Signout, updateProfilePhotoSuccess } from '../redux/slice/authSlice';
import { useNavigate } from 'react-router-dom';
import { fetchComplaints } from '../redux/slice/complaintSlice';
import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { io } from 'socket.io-client';

interface LayoutWrapperProps {
  children: React.ReactNode;
  navItems: Array<{
    label: string;
    path: string;
    icon: React.ComponentType<any>;
  }>;
}

const LayoutWrapper = ({ children, navItems }: LayoutWrapperProps) => {
  // Sidebar expanded/collapsed state (desktop: overlay expands on hover or click, mobile: sliding drawer)
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const location = useLocation();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  
  const { name, role, email, username, profilePhoto, planName } = useSelector((state: any) => state.auth);
  const [uploading, setUploading] = useState(false);

  // Notifications & Profile Dropdown state
  const [notifications, setNotifications] = useState<any[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Close dropdowns on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Socket notifications
  useEffect(() => {
    const socketUrl = (import.meta.env.VITE_API_URL || 'http://localhost:3000').replace('/api/v1', '');
    const socketInstance = io(socketUrl);

    socketInstance.on('connect', () => {
      console.log('🔌 WebSocket connected in LayoutWrapper');
    });

    const userId = Cookies.get('id');
    if (userId) {
      socketInstance.emit('register_user', userId);
    }

    if (role?.toLowerCase() === 'admin') {
      socketInstance.on('new_complaint', (data: any) => {
        toast.success(`🚨 New Complaint Filed: "${data.title}"`, {
          duration: 6000,
          style: {
            border: '1px solid #ef4444',
            padding: '16px',
            color: '#000',
            borderRadius: '12px',
          },
        });
        
        setNotifications((prev) => [
          {
            id: data.complaintId || Date.now().toString(),
            title: 'New Complaint Filed',
            message: `"${data.title}" has been registered.`,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            unread: true,
          },
          ...prev,
        ]);
      });
    }

    if (role?.toLowerCase() === 'staff') {
      socketInstance.on('complaint_assigned', (data: any) => {
        toast.success(`🚨 New Task Assigned: "${data.title}"`, {
          duration: 6000,
          style: {
            border: '1px solid #18181b',
            padding: '16px',
            color: '#000',
            borderRadius: '12px',
          },
        });
        
        setNotifications((prev) => [
          {
            id: data.complaintId || Date.now().toString(),
            title: 'New Task Assigned',
            message: data.message,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            unread: true,
          },
          ...prev,
        ]);
      });
    }

    socketInstance.on('complaint_status_update', (data: any) => {
      toast.success(`🚨 Complaint "${data.title}" status is now "${data.status}"`, {
        duration: 6000,
        style: {
          border: '1px solid #18181b',
          padding: '16px',
          color: '#000',
          borderRadius: '12px',
        },
      });

      setNotifications((prev) => [
        {
          id: data.complaintId || Date.now().toString(),
          title: 'Complaint Status Update',
          message: data.message,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          unread: true,
        },
        ...prev,
      ]);

      dispatch(fetchComplaints({}) as any);
    });

    return () => {
      socketInstance.disconnect();
    };
  }, [role]);

  const handleLogout = () => {
    dispatch(Signout() as any)
      .unwrap()
      .then(() => {
        navigate('/login');
      });
  };

  const handleAvatarClick = () => {
    setIsProfileOpen(false);
    fileInputRef.current?.click();
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file.');
      return;
    }

    const formData = new FormData();
    formData.append('profilePhoto', file);

    setUploading(true);
    const userId = Cookies.get('id');

    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_API_URL}/users/${userId}/profile-photo`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          withCredentials: true,
        }
      );

      dispatch(updateProfilePhotoSuccess(response.data.profilePhoto));
      toast.success('Profile photo updated successfully!');
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to upload photo.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fafafa] flex font-sans relative overflow-x-hidden w-full text-black">
      
      {/* 1. Backdrop for Mobile expanded sidebar */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-40 min-[550px]:hidden transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* 2. Backdrop for Desktop expanded overlay sidebar */}
      {isSidebarExpanded && (
        <div 
          className="fixed inset-0 bg-black/20 z-40 hidden min-[550px]:block transition-opacity"
          onClick={() => setIsSidebarExpanded(false)}
        />
      )}

      {/* 3. Sidebar (Default to thin w-16 icon sidebar on desktop, expands to overlay w-64, hidden on mobile) */}
      <aside
        className={`bg-sidebar text-white transition-all duration-300 ease-in-out flex-shrink-0 z-50 shadow-2xl print:hidden flex flex-col h-screen fixed top-0 left-0
          ${isMobileOpen 
            ? 'w-64 translate-x-0' 
            : 'max-[550px]:-translate-x-full min-[550px]:w-16 min-[550px]:translate-x-0'
          }
          ${isSidebarExpanded ? 'min-[550px]:w-64' : ''}
        `}
      >
        {/* Logo Section */}
        <div className="p-4 flex items-center gap-3 border-b border-slate-800 justify-center min-[550px]:justify-start">
          <img src="/favicon.png" alt="TROPICS Logo" className="w-8 h-8 rounded-xl object-cover shadow-sm flex-shrink-0" />
          {(isSidebarExpanded || isMobileOpen) && (
            <span className="font-black text-base whitespace-nowrap overflow-hidden tracking-wider text-white">
              TROPICS
            </span>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 py-6 px-2.5 space-y-1.5 overflow-y-auto no-scrollbar">
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={index}
                to={item.path}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative ${
                  isActive
                    ? 'bg-brand-gradient text-white shadow-md font-bold'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                }`}
              >
                <div className="flex-shrink-0">
                  <Icon size={20} />
                </div>
                {(isSidebarExpanded || isMobileOpen) && (
                  <span className="font-semibold text-xs whitespace-nowrap">
                    {item.label}
                  </span>
                )}
                
                {/* Tooltip on thin sidebar hover */}
                {(!isSidebarExpanded && !isMobileOpen) && (
                  <div className="absolute left-full ml-4 px-2 py-1 bg-black text-white text-[10px] rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50 shadow border border-zinc-800">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Container (Padded left matching thin desktop sidebar `pl-16`, no shifts on mobile) */}
      <div className="flex-1 flex flex-col min-w-0 min-[550px]:pl-16">
        
        {/* Header */}
        <header className="h-16 bg-white border-b border-zinc-200 px-6 flex items-center justify-between sticky top-0 z-20 print:hidden">
          
          <div className="flex items-center gap-4">
            {/* Hamburger Button */}
            <button
              onClick={() => {
                if (window.innerWidth < 550) {
                  setIsMobileOpen(!isMobileOpen);
                } else {
                  setIsSidebarExpanded(!isSidebarExpanded);
                }
              }}
              className="p-2 hover:bg-zinc-50 rounded-xl text-black transition-colors cursor-pointer border border-zinc-200"
              title="Toggle sidebar"
            >
              <Menu size={18} />
            </button>
            
            {/* Page Title */}
            <div className="hidden sm:block">
              <h1 className="text-zinc-950 font-bold text-xs uppercase tracking-wider">
                TROPICS Dashboard
              </h1>
            </div>
          </div>

          {/* Right items: Notification & User dropdown */}
          <div className="flex items-center gap-2">
            
            {/* Notifications */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => {
                  setIsNotifOpen(!isNotifOpen);
                  setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
                }}
                className="p-2 hover:bg-zinc-50 border border-zinc-200 rounded-xl text-black relative transition-colors cursor-pointer"
              >
                <Bell size={18} />
                {notifications.some(n => n.unread) && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-black rounded-full border border-white animate-pulse"></span>
                )}
              </button>
              
              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-white border border-zinc-200 rounded-2xl shadow-xl z-50 overflow-hidden animate-fade-in">
                  <div className="p-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
                    <h4 className="font-bold text-zinc-900 text-xs uppercase tracking-wider">Notifications</h4>
                    {notifications.length > 0 && (
                      <button 
                        onClick={() => setNotifications([])}
                        className="text-[10px] text-black font-bold uppercase tracking-wider hover:underline cursor-pointer bg-transparent border-none"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                  <div className="max-h-64 overflow-y-auto divide-y divide-zinc-100">
                    {notifications.length > 0 ? (
                      notifications.map((notif) => (
                        <div 
                          key={notif.id} 
                          onClick={() => {
                            setIsNotifOpen(false);
                            if (role?.toLowerCase() === 'admin') {
                              navigate(`/dashboard/complaints?openComplaintId=${notif.id}`);
                            } else {
                              navigate('/dashboard/complaints');
                            }
                          }}
                          className="p-4 hover:bg-zinc-50 transition-colors cursor-pointer flex gap-3 text-left"
                        >
                          <div className="w-8 h-8 rounded-full bg-zinc-50 border border-zinc-200 text-black flex items-center justify-center flex-shrink-0">
                            <ShieldAlert size={14} />
                          </div>
                          <div className="space-y-0.5">
                            <p className="text-[11px] font-bold text-zinc-950">{notif.title}</p>
                            <p className="text-[10px] text-zinc-500 leading-normal">{notif.message}</p>
                            <p className="text-[9px] text-zinc-400 font-medium">{notif.time}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-8 text-center text-zinc-400 text-xs italic">
                        No new notifications
                      </div>
                    )}
                  </div>
                  <div className="p-3 border-t border-zinc-100 text-center bg-zinc-50/30">
                    <Link 
                      to="/dashboard/complaints" 
                      onClick={() => setIsNotifOpen(false)}
                      className="text-[10px] font-bold text-black uppercase tracking-wider hover:underline"
                    >
                      View all complaints
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div className="h-6 w-[1px] bg-zinc-200 mx-1"></div>

            {/* Profile Dropdown Container */}
            <div className="relative flex items-center" ref={profileDropdownRef}>
              
              {/* Trigger Name & Avatar */}
              <div 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-3 pl-1 cursor-pointer select-none group"
              >
                <div className="text-right hidden md:block">
                  <p className="text-xs font-bold text-zinc-950 group-hover:text-black transition-colors leading-none">
                    {name}
                  </p>
                  
                  {/* Plan Name for Admins / Email for Others */}
                  <p className="text-[9px] font-bold uppercase tracking-wider text-zinc-400 mt-1 leading-none">
                    {role?.toLowerCase() === 'admin' 
                      ? (planName || 'Free Trial') 
                      : (role?.toLowerCase() === 'staff' && username ? username : role)
                    }
                  </p>
                </div>

                {/* Circular Pic / User Icon with Plus sign badge */}
                <div className="relative w-9 h-9 rounded-full overflow-hidden border border-zinc-200 shadow-sm flex items-center justify-center bg-zinc-100 text-zinc-700 transition-all duration-200 group-hover:border-black">
                  {uploading && (
                    <div className="absolute inset-0 bg-black/40 z-10 flex items-center justify-center">
                      <div className="animate-spin h-3.5 w-3.5 border-2 border-white border-t-transparent rounded-full"></div>
                    </div>
                  )}
                  
                  {profilePhoto ? (
                    <img 
                      src={profilePhoto} 
                      alt={name || 'Profile'} 
                      className="w-full h-full object-cover rounded-full"
                    />
                  ) : (
                    <div className="relative w-full h-full flex items-center justify-center bg-zinc-100 text-zinc-700">
                      <User size={16} />
                      <div className="absolute -bottom-0.5 -right-0.5 bg-black text-white text-[8px] w-3.5 h-3.5 rounded-full flex items-center justify-center border border-white font-extrabold">
                        +
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Profile Setting / Logout Overlay Dropdown */}
              {isProfileOpen && (
                <div className="absolute right-0 top-11 mt-2 w-48 bg-white border border-zinc-200 rounded-2xl shadow-xl z-50 py-2 divide-y divide-zinc-100 animate-fade-in">
                  <div className="px-4 py-2.5">
                    <p className="text-xs font-bold text-zinc-950 truncate">{name}</p>
                    <p className="text-[10px] text-zinc-500 truncate">{email}</p>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={handleAvatarClick}
                      className="w-full text-left px-4 py-2 text-xs text-zinc-700 hover:bg-zinc-50 hover:text-black flex items-center gap-2 cursor-pointer font-semibold"
                    >
                      <Camera size={14} className="text-zinc-400" />
                      Update Photo
                    </button>
                    
                    <Link
                      to="/dashboard/settings"
                      onClick={() => setIsProfileOpen(false)}
                      className="w-full text-left px-4 py-2 text-xs text-zinc-700 hover:bg-zinc-50 hover:text-black flex items-center gap-2 cursor-pointer font-semibold"
                    >
                      <Settings size={14} className="text-zinc-400" />
                      Profile Settings
                    </Link>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-xs text-zinc-700 hover:bg-red-50 hover:text-red-600 flex items-center gap-2 cursor-pointer font-semibold"
                    >
                      <LogOut size={14} className="text-zinc-400" />
                      Logout
                    </button>
                  </div>
                </div>
              )}

            </div>

          </div>
        </header>

        {/* Hidden File Input */}
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handlePhotoChange} 
          accept="image/*" 
          className="hidden" 
        />

        {/* Page Content Viewport */}
        <main className="flex-1 overflow-y-auto bg-[#fafafa]">
          <div className="p-4 sm:p-6 max-w-7xl mx-auto w-full">{children}</div>
        </main>
      </div>

    </div>
  );
};

export default LayoutWrapper;
