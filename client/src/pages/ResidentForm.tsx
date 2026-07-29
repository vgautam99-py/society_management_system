import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { 
  ArrowLeft, Plus, Trash2, Home, User, Users, Key, Save, Calendar, Eye, EyeOff
} from 'lucide-react';
import { Button, Input, Spinner } from '../component/ui';
import toast from 'react-hot-toast';

interface FamilyMember {
  name: string;
  dob: string;
  phone: string;
  email: string;
  relationWithOwner: string;
}

const ResidentForm = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // For edit mode
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);
  const [flats, setFlats] = useState<any[]>([]);

  // Dependent dropdown states
  const [blocks, setBlocks] = useState<string[]>([]);
  const [floors, setFloors] = useState<string[]>([]);
  const [typedFlatNumber, setTypedFlatNumber] = useState('');

  // Selected dropdown filters
  const [selectedBlock, setSelectedBlock] = useState('');
  const [selectedFloor, setSelectedFloor] = useState('');

  // Primary Resident Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    phone: '+91',
    flatId: '',
    dob: '',
    gender: 'Male',
    maritalStatus: 'Single',
    numberOfChildren: '0',
    totalFamilyMembers: '1',
    password: '',
  });

  // Family Members Form State
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([]);

  // Find the matched flat in database flats array
  const matchedFlat = flats.find(
    (f: any) =>
      f.block?.toString().toLowerCase() === selectedBlock?.toString().toLowerCase() &&
      f.floor?.toString().toLowerCase() === selectedFloor?.toString().toLowerCase() &&
      f.flatNumber?.toString().toLowerCase() === typedFlatNumber?.toString().trim().toLowerCase()
  );

  const isFormLocked = !selectedBlock || !selectedFloor || !typedFlatNumber || !matchedFlat;

  // Sync flatId when matchedFlat is computed
  useEffect(() => {
    setFormData((prev) => ({
      ...prev,
      flatId: matchedFlat ? matchedFlat._id : '',
    }));
  }, [matchedFlat]);

  // Fetch Roles and Flats
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // 1. Fetch Roles
        const roleRes = await axios.get(`${import.meta.env.VITE_API_URL}/roles`, { withCredentials: true });
        if (roleRes.data?.data) {
          setRoles(roleRes.data.data);
        }

        // 2. Fetch Flats
        const flatRes = await axios.get(`${import.meta.env.VITE_API_URL}/flats`, { withCredentials: true });
        if (flatRes.data?.data) {
          const allFlats = flatRes.data.data;
          setFlats(allFlats);

          // Get unique blocks
          const uniqueBlocks = Array.from(new Set(allFlats.map((f: any) => f.block))) as string[];
          setBlocks(uniqueBlocks.sort());
        }

        // 3. If Edit Mode, fetch user details
        if (id) {
          const userRes = await axios.get(`${import.meta.env.VITE_API_URL}/users/${id}`, { withCredentials: true });
          if (userRes.data?.data) {
            const user = userRes.data.data;
            const userFlat = user.flat;

            setFormData({
              name: user.name || '',
              email: user.email || '',
              username: user.username || '',
              phone: user.phone ? `+${user.phone}` : '+91',
              flatId: userFlat?._id || userFlat || '',
              dob: user.dob ? user.dob.split('T')[0] : '',
              gender: user.gender || 'Male',
              maritalStatus: user.maritalStatus || 'Single',
              numberOfChildren: user.numberOfChildren !== undefined ? user.numberOfChildren.toString() : '0',
              totalFamilyMembers: user.totalFamilyMembers !== undefined ? user.totalFamilyMembers.toString() : '1',
              password: '', // Kept blank for security/edit mode
            });

            // Select flat block/floor in dropdowns
            if (userFlat) {
              setSelectedBlock(userFlat.block || '');
              setSelectedFloor(userFlat.floor || '');
              setTypedFlatNumber(userFlat.flatNumber ? userFlat.flatNumber.toString() : '');
            }

            // Fetch family members associated with this flat
            if (userFlat) {
              const flatId = userFlat._id || userFlat;
              const familyRes = await axios.get(`${import.meta.env.VITE_API_URL}/users?flat=${flatId}`, { withCredentials: true });
              if (familyRes.data?.data) {
                const members = familyRes.data.data
                  .filter((u: any) => u._id !== id && u.isFlatOwner === false)
                  .map((u: any) => ({
                    name: u.name || '',
                    dob: u.dob ? u.dob.split('T')[0] : '',
                    phone: u.phone ? `+${u.phone}` : '',
                    email: u.email || '',
                    relationWithOwner: u.relationWithOwner || 'Other',
                  }));
                setFamilyMembers(members);
              }
            }
          }
        }
      } catch (err: any) {
        console.error(err);
        toast.error('Failed to fetch initial page configurations.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  // Update Floor list when Block changes
  useEffect(() => {
    if (selectedBlock) {
      const blockFlats = flats.filter((f: any) => f.block?.toString() === selectedBlock.toString());
      const uniqueFloors = Array.from(new Set(blockFlats.map((f: any) => f.floor?.toString()))) as string[];
      setFloors(uniqueFloors.sort());
      setSelectedFloor('');
    } else {
      setFloors([]);
      setSelectedFloor('');
    }
  }, [selectedBlock, flats]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddFamilyMember = () => {
    if (isFormLocked) return;
    setFamilyMembers([
      ...familyMembers,
      { name: '', dob: '', phone: '', email: '', relationWithOwner: 'Spouse' }
    ]);
  };

  const handleRemoveFamilyMember = (index: number) => {
    if (isFormLocked) return;
    setFamilyMembers(familyMembers.filter((_, i) => i !== index));
  };

  const handleFamilyMemberChange = (index: number, field: keyof FamilyMember, value: string) => {
    if (isFormLocked) return;
    const updated = [...familyMembers];
    updated[index] = { ...updated[index], [field]: value };
    setFamilyMembers(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error('Full Name is required.');
      return;
    }
    if (!formData.email.trim()) {
      toast.error('Email Address is required.');
      return;
    }
    if (!formData.username.trim()) {
      toast.error('Username is required.');
      return;
    }
    if (!formData.flatId) {
      toast.error('Flat assignment is required.');
      return;
    }
    if (!id && !formData.password.trim()) {
      toast.error('Password is required.');
      return;
    }

    try {
      setLoading(true);
      const residentRole = roles.find((r: any) => r.role === 'Resident');
      const payload = {
        ...formData,
        role: 'Resident',
        roleId: residentRole?._id || '',
        familyMembers,
      };

      let res;
      if (id) {
        res = await axios.patch(`${import.meta.env.VITE_API_URL}/users/${id}`, payload, { withCredentials: true });
      } else {
        res = await axios.post(`${import.meta.env.VITE_API_URL}/users`, payload, { withCredentials: true });
      }

      if (res.data) {
        toast.success(id ? 'Resident details updated successfully!' : 'Resident registered successfully!');
        navigate('/dashboard/residents');
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Submission failed.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && flats.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/dashboard/residents')}
          className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {id ? 'Edit Resident Profile' : 'Register New Resident'}
          </h1>
          <p className="text-slate-500 text-sm mt-0.5">
            Fill in the details below to configure flat ownership, personal profiles, and logins.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Section 1: Flat Details */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4">
          <h3 className="text-md font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Home size={18} className="text-blue-500" /> Flat Information
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Block</label>
              <select
                value={selectedBlock}
                onChange={(e) => setSelectedBlock(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer"
              >
                <option value="">Select Block</option>
                {blocks.map((block) => (
                  <option key={block} value={block}>Block {block}</option>
                ))}
              </select>
            </div>
            
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Floor</label>
              <select
                value={selectedFloor}
                onChange={(e) => setSelectedFloor(e.target.value)}
                disabled={!selectedBlock}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer disabled:bg-slate-50 disabled:cursor-not-allowed"
              >
                <option value="">Select Floor</option>
                {floors.map((floor) => (
                  <option key={floor} value={floor}>{floor} Floor</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block ml-0.5">Flat Number</label>
              <input
                type="text"
                placeholder="e.g. 401"
                value={typedFlatNumber}
                onChange={(e) => setTypedFlatNumber(e.target.value)}
                disabled={!selectedFloor}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all disabled:bg-slate-50 disabled:cursor-not-allowed"
              />
              {selectedFloor && typedFlatNumber && !matchedFlat && (
                <p className="text-[10px] text-rose-500 font-medium ml-0.5">Flat number not found on this Block & Floor.</p>
              )}
            </div>
          </div>
        </div>

        {isFormLocked && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center gap-3 text-amber-800 text-sm animate-pulse shadow-sm">
            <span>⚠️</span>
            <p className="font-semibold">Please enter a valid Block, Floor, and Flat Number to unlock the resident profile form fields.</p>
          </div>
        )}

        {/* Section 2: Personal Details */}
        <div className={`bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 transition-opacity duration-200 ${isFormLocked ? 'opacity-50 pointer-events-none' : ''}`}>
          <h3 className="text-md font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <User size={18} className="text-blue-500" /> Resident Personal Profile
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Full Name" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              placeholder=""
              disabled={isFormLocked || loading}
            />
            <Input 
              label="Email Address" 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              placeholder=""
              disabled={isFormLocked || loading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input 
              label="Date of Birth" 
              type="date" 
              name="dob" 
              value={formData.dob} 
              onChange={handleChange} 
              disabled={isFormLocked || loading}
            />
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                disabled={isFormLocked || loading}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer disabled:bg-slate-50 disabled:cursor-not-allowed"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <Input 
              label="Mobile Number" 
              name="phone" 
              value={formData.phone} 
              onChange={handleChange} 
              placeholder=""
              disabled={isFormLocked || loading}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Marital Status</label>
              <select
                name="maritalStatus"
                value={formData.maritalStatus}
                onChange={handleChange}
                disabled={isFormLocked || loading}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer disabled:bg-slate-50 disabled:cursor-not-allowed"
              >
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
                <option value="Widowed">Widowed</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <Input 
              label="No. of Children" 
              type="number" 
              name="numberOfChildren" 
              value={formData.numberOfChildren} 
              onChange={handleChange} 
              min="0"
              disabled={isFormLocked || loading}
            />
            <Input 
              label="Total Family Members" 
              type="number" 
              name="totalFamilyMembers" 
              value={formData.totalFamilyMembers} 
              onChange={handleChange} 
              min="1"
              disabled={isFormLocked || loading}
            />
          </div>
        </div>

        {/* Section 3: Family Details */}
        <div className={`bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 transition-opacity duration-200 ${isFormLocked ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-md font-bold text-slate-900 flex items-center gap-2">
              <Users size={18} className="text-blue-500" /> Family details
            </h3>
            <Button 
              type="button" 
              size="sm" 
              variant="secondary" 
              leftIcon={<Plus size={16} />}
              onClick={handleAddFamilyMember}
              disabled={isFormLocked}
              className="text-xs"
            >
              Add Member
            </Button>
          </div>

          {familyMembers.length > 0 ? (
            <div className="space-y-4">
              {familyMembers.map((member, index) => (
                <div key={index} className="p-4 bg-slate-50 rounded-xl border border-slate-200 relative grid grid-cols-1 md:grid-cols-5 gap-3 items-end pt-6">
                  <button
                    type="button"
                    onClick={() => handleRemoveFamilyMember(index)}
                    disabled={isFormLocked}
                    className="absolute top-2 right-2 p-1 text-slate-400 hover:text-rose-600 transition-colors disabled:opacity-50"
                  >
                    <Trash2 size={16} />
                  </button>
                  <div className="md:col-span-1">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Full Name</label>
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) => handleFamilyMemberChange(index, 'name', e.target.value)}
                      disabled={isFormLocked}
                      className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500 disabled:bg-slate-50"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Date of Birth</label>
                    <input
                      type="date"
                      value={member.dob}
                      onChange={(e) => handleFamilyMemberChange(index, 'dob', e.target.value)}
                      disabled={isFormLocked}
                      className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500 disabled:bg-slate-50"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Mobile No</label>
                    <input
                      type="text"
                      placeholder="+91"
                      value={member.phone}
                      onChange={(e) => handleFamilyMemberChange(index, 'phone', e.target.value)}
                      disabled={isFormLocked}
                      className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500 disabled:bg-slate-50"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Email</label>
                    <input
                      type="email"
                      value={member.email}
                      onChange={(e) => handleFamilyMemberChange(index, 'email', e.target.value)}
                      disabled={isFormLocked}
                      className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500 disabled:bg-slate-50"
                    />
                  </div>
                  <div className="md:col-span-1">
                    <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Relation</label>
                    <select
                      value={member.relationWithOwner}
                      onChange={(e) => handleFamilyMemberChange(index, 'relationWithOwner', e.target.value)}
                      disabled={isFormLocked}
                      className="w-full px-2 py-1.5 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500 disabled:bg-slate-50 disabled:cursor-not-allowed"
                    >
                      <option value="Spouse">Spouse</option>
                      <option value="Son">Son</option>
                      <option value="Daughter">Daughter</option>
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Brother">Brother</option>
                      <option value="Sister">Sister</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-slate-400 text-xs italic border border-dashed border-slate-200 rounded-xl">
              No family members registered. Click "Add Member" to add details.
            </div>
          )}
        </div>

        {/* Section 4: Login Credentials */}
        <div className={`bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 transition-opacity duration-200 ${isFormLocked ? 'opacity-50 pointer-events-none' : ''}`}>
          <h3 className="text-md font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Key size={18} className="text-blue-500" /> Login Credentials
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input 
              label="Username" 
              name="username" 
              value={formData.username} 
              onChange={handleChange} 
              placeholder=""
              disabled={isFormLocked || loading}
            />
            <Input 
              label={id ? "Password (Leave blank to keep unchanged)" : "Password"} 
              type={showPassword ? "text" : "password"} 
              name="password" 
              value={formData.password} 
              onChange={handleChange} 
              placeholder=""
              disabled={isFormLocked || loading}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />
          </div>
        </div>

        {/* Action Panel */}
        <div className="flex justify-end gap-3 border-t border-slate-200 pt-6">
          <Button 
            type="button" 
            variant="secondary" 
            onClick={() => navigate('/dashboard/residents')}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button 
            type="submit" 
            leftIcon={loading ? <Spinner size="sm" /> : <Save size={18} />}
            disabled={isFormLocked || loading}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {id ? 'Save Updates' : 'Create Resident'}
          </Button>
        </div>

      </form>
    </div>
  );
};

export default ResidentForm;
