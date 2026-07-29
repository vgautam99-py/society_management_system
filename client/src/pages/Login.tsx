import React, { useState, useEffect } from 'react';
import { login } from '../redux/slice/authSlice';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import { Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state: any) => state.auth);
  const navigate = useNavigate();
  
  // Login State
  const [loginMethod, setLoginMethod] = useState<'password' | 'otp'>('password');
  const [portal, setPortal] = useState<'admin' | 'others'>('others');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    otp: '',
  });

  // OTP Cooldown
  const [otpCooldown, setOtpCooldown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Registration State
  const [isRegistering, setIsRegistering] = useState(false);
  const [regFormData, setRegFormData] = useState({
    name: '',
    email: '',
    phone: '',
    societyName: '',
    password: '',
  });

  const [localError, setLocalError] = useState<string | null>(null);
  const [localMessage, setLocalMessage] = useState<string | null>(null);
  const [regLoading, setRegLoading] = useState(false);

  // Forgot Password State
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  // OTP Timer countdown
  useEffect(() => {
    if (otpCooldown === 0) return;
    const interval = setInterval(() => {
      setOtpCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [otpCooldown]);



  const handleSendOtp = async () => {
    setLocalError(null);
    setLocalMessage(null);

    if (!formData.email) {
      toast.error('Please enter your email to request an OTP.');
      setLocalError('Email address is required to request OTP.');
      return;
    }

    try {
      setOtpCooldown(60);
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/send-otp`, {
        email: formData.email,
      });
      toast.success(res.data.message || 'OTP sent successfully!');
      setLocalMessage(res.data.message || 'OTP sent successfully to your registered email.');
    } catch (err: any) {
      setOtpCooldown(0);
      const errMsg = err.response?.data?.message || 'Failed to send OTP.';
      toast.error(errMsg);
      setLocalError(errMsg);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setLocalMessage(null);

    if (!forgotEmail) {
      setLocalError("Email address is required.");
      return;
    }

    setForgotLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, {
        email: forgotEmail
      });

      setLocalMessage(response.data.message || "Temporary password sent successfully!");
      setIsForgotPassword(false);
      setForgotEmail('');
      toast.success('Temporary password sent successfully!');
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || "Password reset request failed.";
      setLocalError(msg);
      toast.error(msg);
    } finally {
      setForgotLoading(false);
    }
  };



  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setRegFormData({
      ...regFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setLocalMessage(null);

    const dataToSend = {
      email: formData.email,
      password: loginMethod === 'password' ? formData.password : undefined,
      otp: loginMethod === 'otp' ? formData.otp : undefined,
      portal: portal,
    };

    dispatch(login({ formData: dataToSend }) as any)
      .unwrap()
      .then((res: any) => {
        setLocalMessage(res.message || "Login successful!");
        toast.success("Login successful!");
        setTimeout(() => navigate('/dashboard'), 1000);
      })
      .catch((err: any) => {
        const msg = err?.message || err?.error || "Invalid credentials. Please try again.";
        setLocalError(msg);
        toast.error(msg);
      });
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    setLocalMessage(null);

    if (!regFormData.name || !regFormData.email || !regFormData.societyName || !regFormData.password) {
      setLocalError('Full name, email address, society name, and password are required.');
      toast.error('Full name, email address, society name, and password are required.');
      return;
    }

    setRegLoading(true);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, {
        name: regFormData.name,
        email: regFormData.email,
        phone: regFormData.phone ? Number(regFormData.phone) : undefined,
        societyName: regFormData.societyName,
        password: regFormData.password,
      });

      toast.success('Society Admin registered successfully! Log in now.');
      setLocalMessage('Society Admin registered successfully! You can now sign in.');
      setIsRegistering(false);
      setFormData({ email: regFormData.email, password: regFormData.password, otp: '' });
      setRegFormData({ name: '', email: '', phone: '', societyName: '', password: '' });
    } catch (err: any) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Registration failed.';
      setLocalError(msg);
      toast.error(msg);
    } finally {
      setRegLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-hidden flex flex-col md:flex-row bg-white">
      {/* Column 1: Product Highlights (Sleek Blue Pattern) */}
      <div className="hidden md:flex md:w-1/2 bg-[#1e3a8a] p-8 flex-col justify-between relative overflow-hidden h-full">
        {/* Abstract Background Decoration */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-64 h-64 bg-blue-600/20 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-12">
            <Link to="/" className="text-white hover:text-blue-200 transition-colors mr-1 flex items-center" title="Back to home">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </Link>
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#1d4ed8"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </div>
            <span className="text-white font-bold text-xl tracking-tight">
              SMS Portal
            </span>
          </div>

          <div className="max-w-md">
            <h2 className="text-4xl font-bold text-white mb-6 leading-tight">
              Manage your society with{' '}
              <span className="text-blue-300">intelligence.</span>
            </h2>
            <p className="text-blue-100/80 text-lg mb-10 leading-relaxed">
              The all-in-one platform for modern residents and progressive
              society management.
            </p>

            <div className="space-y-6">
              {[
                {
                  title: 'Secure OTP & Strong Auth',
                  desc: 'Log in securely with single-use passcode tags straight to your email inbox.',
                },
                {
                  title: 'Smart QR Gatekeeper',
                  desc: 'Instantly check in and out visitors via QR Code passes at the guard station.',
                },
                {
                  title: 'Digital Society Hub',
                  desc: 'Check notices, post billing receipts, and submit complaints in real-time.',
                },
              ].map((item, index) => (
                <div key={index} className="flex gap-4">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-500/30 flex items-center justify-center mt-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="white"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                  </div>
                  <div>
                    <h4 className="text-white font-semibold text-base">
                      {item.title}
                    </h4>
                    <p className="text-blue-100/60 text-sm">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-blue-100/40 text-xs">
            © 2026 SMS Portal. Premium Blue/White Theme.
          </p>
        </div>
      </div>

      {/* Column 2: Login Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6 bg-slate-50 md:bg-white h-full overflow-y-auto">
        <div className="w-full max-w-md bg-white p-6 rounded-2xl md:shadow-none border md:border-none border-slate-100 shadow-sm my-auto">
          <div className="md:hidden flex items-center gap-2 mb-8 justify-center">
            <Link to="/" className="text-slate-500 hover:text-slate-800 transition-colors mr-1 flex items-center" title="Back to home">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </Link>
            <div className="w-8 h-8 bg-[#1e3a8a] rounded-lg flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="white"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
            </div>
            <span className="text-slate-900 font-bold text-lg">SMS Portal</span>
          </div>

          <div className="mb-6 text-center md:text-left">
            <h1 className="text-slate-900 font-bold tracking-tight text-3xl mb-1.5">
              {isForgotPassword
                ? 'Reset Password'
                : isRegistering
                ? 'Register Account'
                : 'Welcome'}
            </h1>
            <p className="text-slate-500 text-sm">
              {isForgotPassword
                ? 'Request a temporary access password'
                : isRegistering
                ? 'Create your society portal credentials'
                : 'Access your society management dashboard'}
            </p>
          </div>

          {/* Form wrapper */}
          {localError && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-xs p-4 rounded-xl flex items-center gap-3 mb-6 animate-fade-in">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-red-500 flex-shrink-0"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              <span className="font-medium">{localError}</span>
            </div>
          )}

          {localMessage && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs p-4 rounded-xl flex items-center gap-3 mb-6 animate-fade-in">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-emerald-500 flex-shrink-0"
              >
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span className="font-medium">{localMessage}</span>
            </div>
          )}

          {/* Portal Selector Toggle (Admin vs Others) */}
          {!isRegistering && !isForgotPassword && (
            <div className="flex bg-slate-100 p-1 rounded-xl mb-4 border border-slate-200">
              <button
                type="button"
                onClick={() => {
                  setPortal('admin');
                  setLoginMethod('password'); // default to password
                  setLocalError(null);
                  setLocalMessage(null);
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  portal === 'admin'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Admin Login
              </button>
              <button
                type="button"
                onClick={() => {
                  setPortal('others');
                  setLoginMethod('password'); // password login only
                  setLocalError(null);
                  setLocalMessage(null);
                }}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  portal === 'others'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Others Login
              </button>
            </div>
          )}

          {/* Login Mode Toggle Tabs (Admins Only) */}
          {portal === 'admin' && !isRegistering && !isForgotPassword && (
            <div className="flex bg-slate-150 p-1 rounded-xl mb-6 border border-slate-200">
              <button
                type="button"
                onClick={() => setLoginMethod('password')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  loginMethod === 'password'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Password Login
              </button>
              <button
                type="button"
                onClick={() => setLoginMethod('otp')}
                className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                  loginMethod === 'otp'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Secure OTP Login
              </button>
            </div>
          )}

          {isForgotPassword ? (
            <form onSubmit={handleForgotSubmit} className="space-y-6">
              <div>
                <label className="text-xs font-semibold tracking-wider text-slate-500 uppercase block mb-2" htmlFor="forgot_email">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#94a3b8"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  </div>
                  <input
                    id="forgot_email"
                    name="forgotEmail"
                    type="email"
                    required
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:ring-blue-500/10"
                    placeholder="name@society.com"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="rounded-xl font-semibold text-sm w-full bg-blue-600 hover:bg-blue-700 text-white py-3 transition-all duration-200 shadow-lg shadow-blue-600/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                disabled={forgotLoading}
              >
                {forgotLoading ? 'Requesting Reset...' : 'Request Password Reset'}
              </button>

              <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                <p className="text-slate-500 text-sm">
                  Remembered your password?{' '}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsForgotPassword(false);
                      setLocalError(null);
                      setLocalMessage(null);
                    }}
                    className="font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    Sign In
                  </a>
                </p>
              </div>
            </form>
          ) : !isRegistering ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-xs font-semibold tracking-wider text-slate-500 uppercase block mb-2" htmlFor="email">
                  Email / Username
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="#94a3b8"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="text"
                    required
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:ring-blue-500/10"
                    placeholder="Enter your email or username"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {loginMethod === 'password' && (
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="text-xs font-semibold tracking-wider text-slate-500 uppercase" htmlFor="password">
                      Password
                    </label>
                    {portal === 'admin' && (
                      <a
                        href="#"
                        onClick={(e) => {
                          e.preventDefault();
                          setIsForgotPassword(true);
                          setLocalError(null);
                          setLocalMessage(null);
                        }}
                        className="text-[11px] font-medium text-blue-600 hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </a>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#94a3b8"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                    </div>
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      required
                      className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 focus:ring-blue-500/10"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors focus:outline-none cursor-pointer"
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              )}

              {loginMethod === 'otp' && portal === 'admin' && (
                <div className="animate-fade-in space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold tracking-wider text-slate-500 uppercase" htmlFor="otp">
                      Verification OTP
                    </label>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={otpCooldown > 0}
                      className="text-xs font-bold text-blue-600 disabled:text-slate-400 hover:underline cursor-pointer bg-transparent border-none p-0 outline-none"
                    >
                      {otpCooldown > 0 ? `Resend OTP in ${otpCooldown}s` : 'Send OTP code'}
                    </button>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#94a3b8"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="text-slate-400"
                      >
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                      </svg>
                    </div>
                    <input
                      id="otp"
                      name="otp"
                      type="text"
                      maxLength={6}
                      required
                      className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg outline-none transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 tracking-widest text-center font-mono font-bold focus:border-blue-500 focus:ring-blue-500/10"
                      placeholder="000000"
                      value={formData.otp}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              )}

              {portal === 'admin' && (
                <div className="flex items-center">
                  <input
                    id="remember"
                    type="checkbox"
                    className="w-4 h-4 text-blue-600 border-slate-200 rounded focus:ring-blue-500"
                  />
                  <label
                    htmlFor="remember"
                    className="ml-2 block text-[13px] text-slate-600 cursor-pointer"
                  >
                    Remember this device
                  </label>
                </div>
              )}

              <button
                type="submit"
                className="rounded-xl font-semibold text-sm w-full bg-blue-600 hover:bg-blue-700 text-white py-3 transition-all duration-200 shadow-lg shadow-blue-600/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? 'Verifying Account...' : 'Sign In to Portal'}
              </button>

              {portal === 'admin' && (
                <div className="mt-10 pt-6 border-t border-slate-100 text-center">
                  <p className="text-slate-500 text-sm">
                    New to the society?{' '}
                    <a
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        setIsRegistering(true);
                        setLocalError(null);
                        setLocalMessage(null);
                      }}
                      className="font-bold text-blue-600 hover:underline cursor-pointer"
                    >
                      Register Account
                    </a>
                  </p>
                </div>
              )}
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold tracking-wider text-slate-500 uppercase block mb-1.5" htmlFor="reg_name">
                  Full Name
                </label>
                <input
                  id="reg_name"
                  name="name"
                  type="text"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                  placeholder="John Doe"
                  value={regFormData.name}
                  onChange={handleRegChange}
                />
              </div>

              <div>
                <label className="text-xs font-semibold tracking-wider text-slate-500 uppercase block mb-1.5" htmlFor="reg_email">
                  Email Address
                </label>
                <input
                  id="reg_email"
                  name="email"
                  type="email"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                  placeholder="john@example.com"
                  value={regFormData.email}
                  onChange={handleRegChange}
                />
              </div>

              <div>
                <label className="text-xs font-semibold tracking-wider text-slate-500 uppercase block mb-1.5" htmlFor="reg_phone">
                  Mobile Number
                </label>
                <input
                  id="reg_phone"
                  name="phone"
                  type="text"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                  placeholder="e.g. 9876543210"
                  value={regFormData.phone}
                  onChange={handleRegChange}
                />
              </div>

              <div>
                <label className="text-xs font-semibold tracking-wider text-slate-500 uppercase block mb-1.5" htmlFor="reg_societyName">
                  Society Name
                </label>
                <input
                  id="reg_societyName"
                  name="societyName"
                  type="text"
                  required
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                  placeholder="e.g. Greenwoods Residency"
                  value={regFormData.societyName}
                  onChange={handleRegChange}
                />
              </div>

              <div>
                <label className="text-xs font-semibold tracking-wider text-slate-500 uppercase block mb-1.5" htmlFor="reg_password">
                  Password
                </label>
              <div className="relative">
                <input
                  id="reg_password"
                  name="password"
                  type={showRegPassword ? "text" : "password"}
                  required
                  className="w-full px-3 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
                  placeholder="••••••••"
                  value={regFormData.password}
                  onChange={handleRegChange}
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors focus:outline-none cursor-pointer"
                >
                  {showRegPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              </div>

              <button
                type="submit"
                className="rounded-xl font-semibold text-sm w-full bg-blue-600 hover:bg-blue-700 text-white py-3 transition-all duration-200 shadow-lg shadow-blue-600/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed mt-4 cursor-pointer"
                disabled={regLoading}
              >
                {regLoading ? 'Registering Account...' : 'Register Account'}
              </button>

              <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                <p className="text-slate-500 text-sm">
                  Already have an account?{' '}
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      setIsRegistering(false);
                      setLocalError(null);
                      setLocalMessage(null);
                    }}
                    className="font-bold text-blue-600 hover:underline cursor-pointer"
                  >
                    Sign In
                  </a>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
