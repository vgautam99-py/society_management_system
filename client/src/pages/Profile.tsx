import React, { useEffect, useState, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';
import axios from 'axios';
import { updateSelfProfileThunk, updateProfilePhotoSuccess } from '../redux/slice/authSlice';
import { Button, Input, Spinner } from '../component/ui';
import { User, KeyRound, Home, Mail, Phone, Calendar, Camera, Users, Eye, EyeOff, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import Cookies from 'js-cookie';
import { Badge } from '../component/ui';

function Profile() {
  const dispatch = useDispatch<any>();
  const { name, email, profilePhoto, role, loading } = useSelector((state: any) => state.auth);
  
  const [profileData, setProfileData] = useState<any>(null);
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [changingPassword, setChangingPassword] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canUpdateProfile = role?.toLowerCase() === 'admin';
  const canChangePassword = role?.toLowerCase() === 'admin';

  const handleAvatarClick = () => {
    if (!canUpdateProfile) return;
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
      fetchProfileDetails();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Failed to upload photo.');
    } finally {
      setUploading(false);
    }
  };

  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    reset: resetProfile,
    formState: { errors: profileErrors }
  } = useForm();

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
    watch
  } = useForm();

  const fetchProfileDetails = async () => {
    try {
      setLoadingProfile(true);
      const userId = Cookies.get('id');
      if (!userId) return;
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/users/${userId}`, {
        withCredentials: true
      });
      setProfileData(res.data.data);
      resetProfile({
        name: res.data.data.name || '',
        email: res.data.data.email || '',
        phone: res.data.data.phone || ''
      });
    } catch (err) {
      toast.error('Failed to load profile details');
    } finally {
      setLoadingProfile(false);
    }
  };

  useEffect(() => {
    fetchProfileDetails();
  }, []);

  useEffect(() => {
    if (role?.toLowerCase() === 'resident' && profileData?.flat) {
      const flatId = profileData.flat._id || profileData.flat;
      axios.get(`${import.meta.env.VITE_API_URL}/users?flat=${flatId}`, { withCredentials: true })
        .then(res => {
          // Exclude self from family list
          const list = res.data.data.filter((u: any) => u._id !== profileData._id);
          setFamilyMembers(list);
        })
        .catch(err => console.error(err));
    }
  }, [role, profileData]);

  const onSubmitProfile = (data: any) => {
    dispatch(updateSelfProfileThunk(data)).then((res: any) => {
      if (!res.error) {
        toast.success('Profile details updated successfully');
        fetchProfileDetails();
      }
    });
  };

  const onSubmitPassword = async (data: any) => {
    try {
      setChangingPassword(true);
      const res = await axios.patch(
        `${import.meta.env.VITE_API_URL}/profile/change-password`,
        { oldPassword: data.oldPassword, newPassword: data.newPassword },
        { withCredentials: true }
      );
      toast.success(res.data.message || 'Password changed successfully');
      resetPassword({ oldPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className="p-12 flex justify-center"><Spinner size="md" /></div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="pb-4 border-b border-slate-200">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <User className="text-blue-600" size={24} />
          My Profile & Settings
        </h1>
        <p className="text-slate-500 text-sm mt-0.5">
          Manage your personal details, secure your account, and view flat occupancy specifications.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
              <User size={18} className="text-blue-600" />
              Account Details
            </h2>
            
            <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input 
                  label="Full Name" 
                  disabled={!canUpdateProfile}
                  error={profileErrors.name?.message as string}
                  {...registerProfile('name', { required: 'Name is required' })}
                />
                <Input 
                  label="Email Address" 
                  type="email"
                  disabled={!canUpdateProfile}
                  error={profileErrors.email?.message as string}
                  {...registerProfile('email', { required: 'Email is required' })}
                />
              </div>

              <Input 
                label="Phone Number" 
                placeholder="e.g. +91 9876543210"
                disabled={!canUpdateProfile}
                error={profileErrors.phone?.message as string}
                {...registerProfile('phone')}
              />

              {canUpdateProfile && (
                <div className="flex justify-end pt-2">
                  <Button type="submit" isLoading={loading} className="bg-blue-600 hover:bg-blue-700">Save Profile Changes</Button>
                </div>
              )}
            </form>
          </div>

          {canChangePassword && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                <KeyRound size={18} className="text-blue-600" />
                Security & Password
              </h2>

              <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-4">
                <Input 
                  label="Current Password" 
                  type={showOldPassword ? "text" : "password"}
                  placeholder="••••••••"
                  error={passwordErrors.oldPassword?.message as string}
                  {...registerPassword('oldPassword', { required: 'Current password is required' })}
                  rightIcon={
                    <button
                      type="button"
                      onClick={() => setShowOldPassword(!showOldPassword)}
                      className="p-1 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none cursor-pointer"
                    >
                      {showOldPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input 
                    label="New Password" 
                    type={showNewPassword ? "text" : "password"}
                    placeholder="••••••••"
                    error={passwordErrors.newPassword?.message as string}
                    {...registerPassword('newPassword', { 
                      required: 'New password is required',
                      minLength: { value: 6, message: 'Password must be at least 6 characters' }
                    })}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="p-1 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    }
                  />
                  <Input 
                    label="Confirm New Password" 
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="••••••••"
                    error={passwordErrors.confirmPassword?.message as string}
                    {...registerPassword('confirmPassword', { 
                      required: 'Confirm password is required',
                      validate: (value) => value === watch('newPassword') || 'Passwords do not match'
                    })}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="p-1 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none cursor-pointer"
                      >
                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    }
                  />
                </div>

                <div className="flex justify-end pt-2">
                  <Button type="submit" isLoading={changingPassword} className="bg-blue-600 hover:bg-blue-700">Update Password</Button>
                </div>
              </form>
            </div>
          )}
        </div>

        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6 text-center relative overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-blue-900/20">
            <div className="absolute top-0 left-0 right-0 h-2 bg-blue-600" />
            
            <div className="flex flex-col items-center pt-2">
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handlePhotoChange} 
                accept="image/*" 
                className="hidden" 
              />
              <div 
                onClick={handleAvatarClick}
                className="relative w-24 h-24 rounded-2xl overflow-hidden border-2 border-slate-100 shadow-sm cursor-pointer group flex items-center justify-center bg-blue-50 text-blue-700 transition-all duration-200 hover:border-blue-500"
                title="Click to change profile picture"
              >
                {uploading && (
                  <div className="absolute inset-0 bg-slate-900/40 z-10 flex items-center justify-center">
                     <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full"></div>
                  </div>
                )}
                
                {profilePhoto ? (
                  <img 
                    src={profilePhoto} 
                    alt={name || 'Profile'} 
                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                  />
                ) : (
                  <span className="font-bold text-3xl select-none">
                    {name?.charAt(0).toUpperCase()}
                  </span>
                )}
                
                <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
                  <Camera size={20} />
                </div>
              </div>
              <h3 className="text-base font-bold text-slate-800 mt-4">{name}</h3>
              <Badge variant="primary" className="mt-1 capitalize px-3 py-1 font-semibold text-xs">
                {role}
              </Badge>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-100 text-left text-xs">
              <div className="flex items-center gap-2.5 text-slate-600">
                <Mail size={16} className="text-slate-400" />
                <span>{email}</span>
              </div>
              {profileData?.phone && (
                <div className="flex items-center gap-2.5 text-slate-600">
                  <Phone size={16} className="text-slate-400" />
                  <span>{profileData.phone}</span>
                </div>
              )}
              <div className="flex items-center gap-2.5 text-slate-600">
                <Calendar size={16} className="text-slate-400" />
                <span>Joined {new Date(profileData?.createdAt || Date.now()).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Active Subscription Plan (Admins Only) */}
          {role?.toLowerCase() === 'admin' && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-blue-900/20">
              <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                <Zap size={18} className="text-blue-600" />
                Active Subscription Plan
              </h2>
              <div className="space-y-3 pt-2 text-xs font-semibold">
                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">Plan Name</span>
                  <Badge variant="primary" className="font-bold text-xs uppercase px-2.5 py-0.5">
                    {profileData?.planName || 'Free Trial'}
                  </Badge>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">Start Date</span>
                  <span className="font-semibold text-slate-800">
                    {profileData?.planStartDate ? new Date(profileData.planStartDate).toLocaleDateString() : new Date(profileData?.createdAt || Date.now()).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">Expiry Date</span>
                  <span className="font-semibold text-slate-800">
                    {profileData?.planEndDate ? new Date(profileData.planEndDate).toLocaleDateString() : new Date(Date.now() + 30 * 24 * 3600 * 1000).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500 font-medium">Status</span>
                  <Badge 
                    variant={profileData?.planEndDate && new Date(profileData.planEndDate).getTime() < Date.now() ? 'danger' : 'success'} 
                    className="font-bold text-xs uppercase px-2 py-0.5"
                  >
                    {profileData?.planEndDate && new Date(profileData.planEndDate).getTime() < Date.now() ? 'Expired' : 'Active'}
                  </Badge>
                </div>
              </div>
            </div>
          )}

            {profileData?.flat && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-blue-900/20">
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Home size={18} className="text-blue-600" />
                  Flat Occupancy Details
                </h2>

                <div className="space-y-3 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Flat Number</span>
                    <span className="font-bold text-slate-700">Flat {profileData.flat.flatNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Block Code</span>
                    <span className="font-bold text-slate-700">Block {profileData.flat.block}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Floor Level</span>
                    <span className="font-bold text-slate-700">{profileData.flat.floor} Floor</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-medium">Occupancy Status</span>
                    <Badge variant="success" className="font-bold">
                      Occupied
                    </Badge>
                  </div>
                </div>
              </div>
            )}

            {role?.toLowerCase() === 'resident' && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-blue-900/20">
                <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 pb-2 border-b border-slate-100">
                  <Users size={18} className="text-blue-600" />
                  Family Members
                </h2>
                {familyMembers.length > 0 ? (
                  <div className="space-y-3">
                    {familyMembers.map((member: any) => (
                      <div key={member._id} className="flex justify-between items-center text-xs">
                        <div>
                          <p className="font-bold text-slate-800">{member.name}</p>
                          <p className="text-slate-400">
                            {member.phone ? `+${member.phone}` : member.email || 'No contact info'}
                          </p>
                        </div>
                        <Badge 
                          variant="success"
                          className="capitalize font-semibold"
                        >
                          {member.relationWithOwner || 'Family'}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No family members registered to this flat.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
  );
}

export default Profile;
