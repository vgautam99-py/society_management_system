import React, { useState } from 'react';
import { login } from '../redux/slice/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import { Eye, EyeOff, Mail, Lock, User as UserIcon, Building, Phone as PhoneIcon, ArrowLeft, Shield, Users } from 'lucide-react';

const Login = () => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state: any) => state.auth);
  const navigate = useNavigate();

  // Selected Role (null = selection view, 'admin' = admin view, 'others' = staff/resident view)
  const [selectedRole, setSelectedRole] = useState<'admin' | 'others' | null>(null);

  // Form states
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);

  // Admin registration state
  const [isRegistering, setIsRegistering] = useState(false);
  const [regFormData, setRegFormData] = useState({
    name: '',
    email: '',
    phone: '',
    societyName: '',
    password: '',
  });
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regLoading, setRegLoading] = useState(false);

  // Forgot password state
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegFormData({
      ...regFormData,
      [e.target.name]: e.target.value,
    });
  };

  // Forgot Password request
  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail) {
      toast.error("Email address is required.");
      return;
    }

    setForgotEmail('');
    setForgotLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, {
        email: forgotEmail
      });

      toast.success(response.data.message || 'Temporary password has been generated successfully!');
      setIsForgotPassword(false);
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || "Password reset request failed.";
      toast.error(msg);
    } finally {
      setForgotLoading(false);
    }
  };

  // Login request
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSend = {
      email: formData.email,
      password: formData.password,
      portal: selectedRole,
    };

    dispatch(login({ formData: dataToSend }) as any)
      .unwrap()
      .then((res: any) => {
        toast.success("Login successful!");
        setTimeout(() => navigate('/dashboard'), 1000);
      })
      .catch((err: any) => {
        const msg = err?.message || err?.error || "Invalid credentials. Please try again.";
        toast.error(msg);
      });
  };

  // Register request
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFormData.name || !regFormData.email || !regFormData.societyName || !regFormData.password) {
      toast.error('All registration fields are required.');
      return;
    }

    if (regFormData.password !== regConfirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setRegLoading(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, {
        name: regFormData.name,
        email: regFormData.email,
        phone: regFormData.phone ? Number(regFormData.phone.replace(/\D/g, '')) : undefined,
        societyName: regFormData.societyName,
        password: regFormData.password,
      });

      toast.success('Account registered successfully! Please log in.');
      // Take user back to login form
      setIsRegistering(false);
      setFormData({ email: regFormData.email, password: '' });
    } catch (err: any) {
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const errorDetail = err.response.data.errors.map((e: any) => `${e.field}: ${e.message}`).join(', ');
        toast.error(`Validation Failed: ${errorDetail}`);
      } else {
        const msg = err.response?.data?.message || err.response?.data?.error || 'Registration failed.';
        toast.error(msg);
      }
    } finally {
      setRegLoading(false);
    }
  };

  const handleBackToSelection = () => {
    setSelectedRole(null);
    setIsRegistering(false);
    setIsForgotPassword(false);
    setFormData({ email: '', password: '' });
  };

  return (
    <div className="min-h-screen w-screen bg-[#fafafa] text-black font-sans flex items-center justify-center p-4 selection:bg-black selection:text-white relative overflow-hidden">
      {/* Background aesthetics */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-zinc-100 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-zinc-100 rounded-full blur-3xl -z-10"></div>

      <div className="w-full max-w-md bg-white border border-zinc-200 rounded-3xl shadow-xl p-8 relative overflow-hidden transition-all duration-300">
        
        {/* VIEW 1: Role Selection Screen */}
        {selectedRole === null ? (
          <div className="flex flex-col items-center justify-center py-6 text-center animate-fade-in relative">
            {/* Top-Left Circular Back Button to Landing Page */}
            <Link 
              to="/"
              className="absolute top-0 left-0 w-9 h-9 rounded-full bg-slate-50 border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-all shadow-sm cursor-pointer hover:scale-105 active:scale-95"
              title="Back to Landing Page"
            >
              <ArrowLeft size={18} />
            </Link>

            <img src="/favicon.png" alt="TROPICS Logo" className="w-14 h-14 rounded-2xl object-cover shadow-md mb-4 mt-2" />
            <h1 className="text-2xl font-black tracking-tight text-slate-900 uppercase">TROPICS Portal</h1>
            <p className="text-xs text-slate-500 mb-8 max-w-xs">Select your portal access level to continue</p>
            
            <div className="flex justify-center items-center gap-8 w-full mb-2">
              {/* Admin Selector Circle */}
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRole('admin')}
                  className="w-20 h-20 rounded-full bg-slate-50 hover:bg-brand-gradient hover:text-white text-slate-900 border border-slate-200 flex items-center justify-center transition-all duration-300 shadow-md cursor-pointer hover:-translate-y-1 hover:shadow-lg active:scale-95 group"
                >
                  <Shield size={32} className="group-hover:scale-110 transition-transform" />
                </button>
                <span className="text-xs font-bold tracking-wide text-slate-700">Admin</span>
              </div>

              {/* Others Selector Circle */}
              <div className="flex flex-col items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedRole('others')}
                  className="w-20 h-20 rounded-full bg-slate-50 hover:bg-brand-gradient hover:text-white text-slate-900 border border-slate-200 flex items-center justify-center transition-all duration-300 shadow-md cursor-pointer hover:-translate-y-1 hover:shadow-lg active:scale-95 group"
                >
                  <Users size={32} className="group-hover:scale-110 transition-transform" />
                </button>
                <span className="text-xs font-bold tracking-wide text-slate-700">Others</span>
              </div>
            </div>
          </div>
        ) : (
          /* VIEW 2: Form Containers */
          <div className="animate-slide-up">
            {/* Circular Header Back Button */}
            <button 
              type="button" 
              onClick={handleBackToSelection}
              className="absolute top-6 left-6 w-9 h-9 rounded-full bg-slate-50 border border-slate-200 hover:bg-slate-100 flex items-center justify-center text-slate-600 hover:text-slate-900 transition-all shadow-sm cursor-pointer hover:scale-105 active:scale-95"
              title="Change portal"
            >
              <ArrowLeft size={18} />
            </button>

            {/* Title Headings */}
            <div className="mb-6 text-center pt-2">
              <h2 className="text-xl font-extrabold tracking-tight text-zinc-950 capitalize">
                {isForgotPassword 
                  ? 'Reset Password' 
                  : isRegistering 
                  ? 'Admin Registration' 
                  : selectedRole === 'admin' 
                  ? 'Admin Portal' 
                  : 'Staff / Resident Portal'
                }
              </h2>
              <p className="text-xs text-zinc-500 mt-1">
                {isForgotPassword
                  ? 'Reset credentials using your registered email'
                  : isRegistering
                  ? 'Register a new society and admin account'
                  : 'Enter your credentials to access your dashboard'
                }
              </p>
            </div>

            {/* FORGOT PASSWORD FORM */}
            {isForgotPassword ? (
              <form onSubmit={handleForgotSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500" htmlFor="forgot_email">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                      <Mail size={16} />
                    </div>
                    <input
                      id="forgot_email"
                      name="forgotEmail"
                      type="email"
                      required
                      className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none text-xs transition-all focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5"
                      placeholder="admin@society.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full bg-brand-gradient hover:opacity-95 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer active:scale-98"
                >
                  {forgotLoading ? 'Processing...' : 'Reset Password'}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(false)}
                    className="text-xs font-bold text-zinc-500 hover:text-black hover:underline cursor-pointer bg-transparent border-none p-0 outline-none"
                  >
                    Back to Log In
                  </button>
                </div>
              </form>
            ) : (
              /* LOGIN & REGISTER TRANSITION SWITCHERS */
              <div className="relative overflow-hidden w-full">
                
                {/* 1. REGISTER FORM CONTAINER */}
                {isRegistering && selectedRole === 'admin' ? (
                  <form onSubmit={handleRegisterSubmit} className="space-y-4 animate-fade-in">
                    {/* Name */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500" htmlFor="reg_name">
                        Full Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                          <UserIcon size={16} />
                        </div>
                        <input
                          id="reg_name"
                          name="name"
                          type="text"
                          required
                          className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none text-xs transition-all focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5"
                          placeholder="e.g. John Doe"
                          value={regFormData.name}
                          onChange={handleRegChange}
                        />
                      </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500" htmlFor="reg_email">
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                          <Mail size={16} />
                        </div>
                        <input
                          id="reg_email"
                          name="email"
                          type="email"
                          required
                          className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none text-xs transition-all focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5"
                          placeholder="john@example.com"
                          value={regFormData.email}
                          onChange={handleRegChange}
                        />
                      </div>
                    </div>

                    {/* Mobile Number */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500" htmlFor="reg_phone">
                        Mobile Number
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                          <PhoneIcon size={16} />
                        </div>
                        <input
                          id="reg_phone"
                          name="phone"
                          type="text"
                          required
                          className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none text-xs transition-all focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5"
                          placeholder="e.g. 9876543210"
                          value={regFormData.phone}
                          onChange={handleRegChange}
                        />
                      </div>
                    </div>

                    {/* Society Name */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500" htmlFor="reg_societyName">
                        Society Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                          <Building size={16} />
                        </div>
                        <input
                          id="reg_societyName"
                          name="societyName"
                          type="text"
                          required
                          className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none text-xs transition-all focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5"
                          placeholder="e.g. Greenwoods Society"
                          value={regFormData.societyName}
                          onChange={handleRegChange}
                        />
                      </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500" htmlFor="reg_password">
                        Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                          <Lock size={16} />
                        </div>
                        <input
                          id="reg_password"
                          name="password"
                          type={showRegPassword ? "text" : "password"}
                          required
                          className="w-full pl-10 pr-10 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none text-xs transition-all focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5"
                          placeholder="••••••••"
                          value={regFormData.password}
                          onChange={handleRegChange}
                        />
                        <button
                          type="button"
                          onClick={() => setShowRegPassword(!showRegPassword)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-black transition-colors focus:outline-none cursor-pointer"
                        >
                          {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    {/* Verify Password */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500" htmlFor="reg_confirm_password">
                        Verify Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                          <Lock size={16} />
                        </div>
                        <input
                          id="reg_confirm_password"
                          name="confirmPassword"
                          type="password"
                          required
                          className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none text-xs transition-all focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5"
                          placeholder="••••••••"
                          value={regConfirmPassword}
                          onChange={(e) => setRegConfirmPassword(e.target.value)}
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={regLoading}
                      className="w-full bg-brand-gradient hover:opacity-95 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-2 cursor-pointer active:scale-98"
                    >
                      {regLoading ? 'Registering Account...' : 'Register Society'}
                    </button>

                    <div className="text-center pt-2">
                      <span className="text-xs text-zinc-500">
                        Already have an account?{' '}
                        <button
                          type="button"
                          onClick={() => setIsRegistering(false)}
                          className="font-bold text-black hover:underline cursor-pointer bg-transparent border-none p-0 outline-none"
                        >
                          Sign In
                        </button>
                      </span>
                    </div>
                  </form>
                ) : (
                  /* 2. LOGIN FORM CONTAINER */
                  <form onSubmit={handleSubmit} className="space-y-5 animate-fade-in">
                    {/* Email Input */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500" htmlFor="email">
                        Email Address / Username
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                          <Mail size={16} />
                        </div>
                        <input
                          id="email"
                          name="email"
                          type="text"
                          required
                          className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none text-xs transition-all focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5"
                          placeholder="Enter your email or username"
                          value={formData.email}
                          onChange={handleChange}
                        />
                      </div>
                    </div>

                    {/* Password Input */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-bold uppercase tracking-wider text-zinc-500" htmlFor="password">
                          Password
                        </label>
                        {selectedRole === 'admin' && (
                          <button
                            type="button"
                            onClick={() => {
                              setIsForgotPassword(true);
                              setForgotEmail('');
                            }}
                            className="text-[10px] font-bold text-zinc-500 hover:text-black hover:underline cursor-pointer bg-transparent border-none p-0 outline-none"
                          >
                            Forgot password?
                          </button>
                        )}
                      </div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400">
                          <Lock size={16} />
                        </div>
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? "text" : "password"}
                          required
                          className="w-full pl-10 pr-10 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl outline-none text-xs transition-all focus:bg-white focus:border-black focus:ring-4 focus:ring-black/5"
                          placeholder="••••••••"
                          value={formData.password}
                          onChange={handleChange}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-zinc-400 hover:text-black transition-colors focus:outline-none cursor-pointer"
                        >
                          {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-brand-gradient hover:opacity-95 text-white font-bold text-xs py-3 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed mt-2 cursor-pointer active:scale-98"
                    >
                      {loading ? 'Logging in...' : 'Login'}
                    </button>

                    {/* Registration Toggle (ONLY for Admin Tab) */}
                    {selectedRole === 'admin' && (
                      <div className="mt-6 pt-4 border-t border-zinc-100 text-center">
                        <span className="text-xs text-zinc-500">
                          Don't have an account?{' '}
                          <button
                            type="button"
                            onClick={() => {
                              setIsRegistering(true);
                            }}
                            className="font-bold text-black hover:underline cursor-pointer bg-transparent border-none p-0 outline-none"
                          >
                            Register Account
                          </button>
                        </span>
                      </div>
                    )}
                  </form>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Login;
