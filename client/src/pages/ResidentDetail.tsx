import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, Edit3, Home, User, Users, Calendar, Phone, Mail, ShieldAlert, Heart, Baby
} from 'lucide-react';
import { Button, Badge, Spinner } from '../component/ui';
import toast from 'react-hot-toast';

const ResidentDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [resident, setResident] = useState<any | null>(null);
  const [familyMembers, setFamilyMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);
        // 1. Fetch resident primary details
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/users/${id}`, {
          withCredentials: true
        });
        if (res.data?.success || res.data?.data) {
          const userObj = res.data.data;
          setResident(userObj);

          // 2. Fetch family members if they share a flat
          const flatId = userObj.flat?._id || userObj.flat;
          if (flatId) {
            const familyRes = await axios.get(`${import.meta.env.VITE_API_URL}/users?flat=${flatId}`, {
              withCredentials: true
            });
            if (familyRes.data?.data) {
              const members = familyRes.data.data.filter(
                (u: any) => u._id !== id && u.isFlatOwner === false
              );
              setFamilyMembers(members);
            }
          }
        }
      } catch (err: any) {
        console.error(err);
        toast.error('Failed to load resident details.');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchDetails();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!resident) {
    return (
      <div className="text-center py-12 space-y-4">
        <p className="text-slate-500 italic">Resident profile not found.</p>
        <Button onClick={() => navigate('/dashboard/residents')} variant="secondary">
          Go Back
        </Button>
      </div>
    );
  }

  const userFlat = resident.flat;

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-fade-in">
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => navigate('/dashboard/residents')}
            className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Resident Details</h1>
            <p className="text-slate-500 text-xs mt-0.5">Primary profile, family members, and flat configurations.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="secondary" 
            onClick={() => navigate('/dashboard/residents')}
            className="text-xs"
          >
            Back to List
          </Button>
          <Button 
            leftIcon={<Edit3 size={16} />}
            onClick={() => navigate(`/dashboard/residents/edit/${id}`)}
            className="bg-blue-600 hover:bg-blue-700 text-xs"
          >
            Edit Profile
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Side: General Profile Card */}
        <div className="md:col-span-1 space-y-6">
          {/* Avatar Panel */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col items-center text-center space-y-4">
            <div className="h-20 w-20 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-3xl shadow-sm border border-emerald-100/50">
              {resident.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">{resident.name}</h2>
              <p className="text-xs text-slate-500 font-medium">@{resident.username || 'no_username'}</p>
            </div>
            <Badge variant="success" className="px-3 py-0.5 font-semibold text-xs capitalize">
              {resident.relationWithOwner || 'Flat Owner'}
            </Badge>
          </div>

          {/* Flat Assignment Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <Home size={16} className="text-blue-500" /> Flat Information
            </h3>
            {userFlat ? (
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">Block</span>
                  <span className="font-semibold text-slate-800">Block {userFlat.block}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-50">
                  <span className="text-slate-500 font-medium">Floor</span>
                  <span className="font-semibold text-slate-800">{userFlat.floor} Floor</span>
                </div>
                <div className="flex justify-between items-center py-1">
                  <span className="text-slate-500 font-medium">Flat Number</span>
                  <span className="font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100/30">
                    {userFlat.flatNumber}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">No flat assigned.</p>
            )}
          </div>
        </div>

        {/* Right Side: Detailed Info & Family Members */}
        <div className="md:col-span-2 space-y-6">
          {/* Detailed Info Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <User size={16} className="text-blue-500" /> Primary Resident Profile
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-6 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 font-medium flex items-center gap-1"><Mail size={12} /> Email Address</span>
                <p className="font-semibold text-slate-800 text-[13px]">{resident.email}</p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-medium flex items-center gap-1"><Phone size={12} /> Mobile Number</span>
                <p className="font-semibold text-slate-800 text-[13px]">{resident.phone ? `+${resident.phone}` : 'N/A'}</p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-medium flex items-center gap-1"><Calendar size={12} /> Date of Birth</span>
                <p className="font-semibold text-slate-800 text-[13px]">
                  {resident.dob ? new Date(resident.dob).toLocaleDateString(undefined, { dateStyle: 'medium' }) : 'N/A'}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-medium flex items-center gap-1"><User size={12} /> Gender</span>
                <p className="font-semibold text-slate-800 text-[13px] capitalize">{resident.gender || 'Male'}</p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-medium flex items-center gap-1"><Heart size={12} /> Marital Status</span>
                <p className="font-semibold text-slate-800 text-[13px] capitalize">{resident.maritalStatus || 'Single'}</p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-medium flex items-center gap-1"><Baby size={12} /> Number of Children</span>
                <p className="font-semibold text-slate-800 text-[13px]">{resident.numberOfChildren !== undefined ? resident.numberOfChildren : '0'}</p>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-medium flex items-center gap-1"><Users size={12} /> Total Family Members</span>
                <p className="font-semibold text-slate-800 text-[13px]">{resident.totalFamilyMembers !== undefined ? resident.totalFamilyMembers : '1'}</p>
              </div>
            </div>
          </div>

          {/* Family Details Card */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2.5">
              <Users size={16} className="text-blue-500" /> Family details
            </h3>

            {familyMembers.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {familyMembers.map((member) => (
                  <div key={member._id} className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-slate-800 text-sm leading-tight">{member.name}</h4>
                        <span className="text-[10px] text-slate-400">Relation: <span className="font-semibold capitalize text-slate-600">{member.relationWithOwner || 'Family'}</span></span>
                      </div>
                      <Badge variant="success" className="text-[10px] py-0.5 px-2 font-bold capitalize">
                        {member.relationWithOwner || 'Family'}
                      </Badge>
                    </div>

                    <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-2">
                      {member.phone && (
                        <p className="flex items-center gap-1.5 text-[11px]">
                          <Phone size={11} className="text-slate-400" /> +{member.phone}
                        </p>
                      )}
                      {member.email && !member.email.startsWith('family_') && (
                        <p className="flex items-center gap-1.5 text-[11px] truncate">
                          <Mail size={11} className="text-slate-400" /> {member.email}
                        </p>
                      )}
                      {member.dob && (
                        <p className="flex items-center gap-1.5 text-[11px]">
                          <Calendar size={11} className="text-slate-400" /> {new Date(member.dob).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs italic border border-dashed border-slate-200 rounded-xl">
                No family members registered under this resident.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResidentDetail;
