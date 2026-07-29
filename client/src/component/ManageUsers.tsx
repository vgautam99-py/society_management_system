import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { fetchUsers, createUser, updateUser, deactivateUser } from '../redux/slice/userSlice';
import { fetchRoles } from '../redux/slice/roleSlice';
import { fetchAvailableFlats } from '../redux/slice/flatSlice';
import { 
  Table, Thead, Tbody, Tr, Th, Td, 
  Button, Badge, Dialog, Input, Spinner
} from './ui';
import { UserPlus, Search, Edit2, Trash2, ChevronDown, ChevronUp, Eye } from 'lucide-react';

interface ManageUsersProps {
  roleFilter?: 'Resident' | 'Staff';
}

function ManageUsers({ roleFilter }: ManageUsersProps) {
  const dispatch = useDispatch<any>();
  const navigate = useNavigate();
  const { users, loading } = useSelector((state: any) => state.user);
  const { roles } = useSelector((state: any) => state.role);
  const { flats } = useSelector((state: any) => state.flat);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [preSelectedRoleName, setPreSelectedRoleName] = useState<'resident' | 'staff' | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editUserId, setEditUserId] = useState<string | null>(null);
  const [expandedResidentId, setExpandedResidentId] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    username: '',
    phone: '+91',
    roleId: '',
    flatId: '',
    password: '',
    dob: '',
    joiningDate: '',
    staffRole: '',
    age: '',
  });

  useEffect(() => {
    dispatch(fetchUsers());
    dispatch(fetchRoles());
    dispatch(fetchAvailableFlats());
  }, [dispatch]);

  const formatDate = (dateVal: any) => {
    if (!dateVal) return '';
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  };

  const calculateAge = (dobString: string) => {
    if (!dobString) return '';
    const birthDate = new Date(dobString);
    const difference = Date.now() - birthDate.getTime();
    if (difference <= 0) return '0';
    const ageDate = new Date(difference);
    return Math.abs(ageDate.getUTCFullYear() - 1970).toString();
  };

  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dobVal = e.target.value;
    const computedAge = calculateAge(dobVal);
    setFormData(prev => ({
      ...prev,
      dob: dobVal,
      age: computedAge
    }));
  };

  const handleOpenDialog = (roleName: 'Resident' | 'Staff' | null, user: any = null) => {
    if (user) {
      setEditUserId(user._id);
      const userRole = roles.find((r: any) => r.role === user.role || r._id === user.roleId);
      setPreSelectedRoleName(user.role?.toLowerCase() as any);
      setFormData({
        name: user.name || '',
        email: user.email || '',
        username: user.username || '',
        phone: user.phone ? `+${user.phone}` : '+91',
        roleId: userRole?._id || user.roleId || '',
        flatId: user.flat || '',
        password: '',
        dob: formatDate(user.dob),
        joiningDate: formatDate(user.joiningDate),
        staffRole: user.staffRole || '',
        age: user.age || '',
      });
    } else {
      setEditUserId(null);
      const targetRole = roles.find((r: any) => r.role?.toLowerCase() === roleName?.toLowerCase());
      setPreSelectedRoleName(roleName?.toLowerCase() as any);
      setFormData({
        name: '',
        email: '',
        username: '',
        phone: '+91',
        roleId: targetRole?._id || '',
        flatId: '',
        password: '',
        dob: '',
        joiningDate: '',
        staffRole: '',
        age: '',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      alert('Full Name is a mandatory field.');
      return;
    }
    if (!formData.email.trim()) {
      alert('Email Address is a mandatory field.');
      return;
    }
    if (!formData.phone.toString().trim()) {
      alert('Phone Number is a mandatory field.');
      return;
    }

    const isStaffFlow = preSelectedRoleName === 'staff' || selectedRole?.role?.toLowerCase() === 'staff';
    const isResidentFlow = preSelectedRoleName === 'resident' || selectedRole?.role?.toLowerCase() === 'resident';

    if (isStaffFlow) {
      if (!formData.dob) {
        alert('Date of Birth is a mandatory field.');
        return;
      }
      if (!formData.staffRole) {
        alert('Staff Role is a mandatory field.');
        return;
      }
      if (!formData.joiningDate) {
        alert('Joining Date is a mandatory field.');
        return;
      }
      if (!editUserId && !formData.password.trim()) {
        alert('Password is a mandatory field.');
        return;
      }
    } else if (isResidentFlow) {
      if (!editUserId && !formData.flatId) {
        alert('Assign Flat is a mandatory field.');
        return;
      }
    }

    const targetRoleObj = roles.find((r: any) => r._id === formData.roleId);
    const payload = {
      ...formData,
      role: targetRoleObj?.role,
    };

    if (editUserId) {
      dispatch(updateUser({ id: editUserId, userData: payload })).then(() => dispatch(fetchUsers()));
    } else {
      dispatch(createUser(payload)).then(() => dispatch(fetchUsers()));
    }
    setIsDialogOpen(false);
  };

  const handleDeactivate = (id: string) => {
    if (window.confirm('Are you sure you want to deactivate this user?')) {
      dispatch(deactivateUser(id)).then(() => dispatch(fetchUsers()));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const selectedRole = roles.find((r: any) => r._id === formData.roleId);
  const isResident = selectedRole?.role?.toLowerCase() === 'resident' || preSelectedRoleName === 'resident';
  const isStaff = selectedRole?.role?.toLowerCase() === 'staff' || preSelectedRoleName === 'staff';

  const filteredUsers = users.filter((user: any) => {
    // Apply role filter if provided
    if (roleFilter && user.role !== roleFilter) return false;

    // Filter out family members (non-flat owners) from Residents list
    if (roleFilter === 'Resident' && user.isFlatOwner === false) return false;

    const term = searchTerm.toLowerCase();
    return (
      user.name?.toLowerCase().includes(term) ||
      user.email?.toLowerCase().includes(term) ||
      user.username?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            {roleFilter === 'Resident' ? 'Manage Residents' : roleFilter === 'Staff' ? 'Manage Staff' : 'Manage Users'}
          </h1>
          <p className="text-slate-500 text-sm">
            {roleFilter === 'Resident' 
              ? 'View and manage details of residents in the society.' 
              : roleFilter === 'Staff' 
              ? 'View and manage profiles and login credentials of staff members.' 
              : 'View and manage all society members and staff.'}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          {(!roleFilter || roleFilter === 'Staff') && (
            <Button 
              leftIcon={<UserPlus size={18} />} 
              onClick={() => handleOpenDialog('Staff')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              Add New Staff
            </Button>
          )}
          {(!roleFilter || roleFilter === 'Resident') && (
            <Button 
              leftIcon={<UserPlus size={18} />} 
              onClick={() => navigate('/dashboard/residents/create')}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              Add New Resident
            </Button>
          )}
        </div>
      </div>

      {/* Filters & Actions */}
      <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text"
            placeholder="Search by name, email, or username..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-12 flex justify-center"><Spinner size="md" /></div>
        ) : (
          <Table>
            <Thead>
              <Tr hover={false}>
                <Th>{roleFilter === 'Resident' ? 'Resident Name' : roleFilter === 'Staff' ? 'Staff Name' : 'User'}</Th>
                {roleFilter !== 'Resident' && <Th>{roleFilter === 'Staff' ? 'Role / Position' : 'Role'}</Th>}
                {roleFilter === 'Resident' && <Th>Family Members</Th>}
                {roleFilter !== 'Resident' && <Th>Status</Th>}
                <Th>Created At</Th>
                <Th className="text-right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {filteredUsers.length > 0 ? (
                filteredUsers.map((user: any) => {
                  const flatId = user.flat?._id || user.flat;
                  const familyMembersList = users.filter(
                    (u: any) =>
                      u.role === 'Resident' &&
                      u.isFlatOwner === false &&
                      (u.flat?._id || u.flat) === flatId
                  );
                  const totalMembers = familyMembersList.length;
                  const isExpanded = expandedResidentId === user._id;

                  return (
                    <React.Fragment key={user._id}>
                      <Tr>
                        <Td>
                          <div className="flex items-center gap-3">
                            <div className="h-9 w-9 rounded-full bg-blue-50 text-blue-700 flex items-center justify-center font-semibold text-sm flex-shrink-0">
                              {user.name?.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{user.name}</p>
                              <p className="text-xs text-slate-500">{user.email}</p>
                            </div>
                          </div>
                        </Td>
                        
                        {roleFilter !== 'Resident' && (
                          <Td>
                            <Badge 
                              variant={
                                user.role?.toLowerCase() === 'admin' 
                                  ? 'danger' 
                                  : user.role?.toLowerCase() === 'resident' 
                                  ? 'success' 
                                  : 'info'
                              } 
                              className="capitalize"
                            >
                              {user.role}  
                            </Badge>
                          </Td>
                        )}

                        {roleFilter === 'Resident' && (
                          <Td>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-slate-700 text-sm">
                                {totalMembers} {totalMembers === 1 ? 'member' : 'members'}
                              </span>
                              {totalMembers > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setExpandedResidentId(isExpanded ? null : user._id)}
                                  className="p-1 hover:bg-slate-100 rounded text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                                >
                                  {isExpanded ? (
                                    <ChevronUp size={16} />
                                  ) : (
                                    <ChevronDown size={16} />
                                  )}
                                </button>
                              )}
                            </div>
                          </Td>
                        )}

                        {roleFilter !== 'Resident' && (
                          <Td>
                            <Badge variant={user.isActive !== false ? 'success' : 'danger'}>
                              {user.isActive !== false ? 'Active' : 'Inactive'}
                            </Badge>
                          </Td>
                        )}

                        <Td className="text-slate-500 text-xs">
                          {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                        </Td>
                        <Td className="text-right">
                          <div className="flex justify-end gap-2 items-center">
                            {roleFilter === 'Resident' && (
                              <button 
                                onClick={() => navigate(`/dashboard/residents/view/${user._id}`)}
                                className="p-1.5 text-slate-400 hover:text-emerald-600 transition-colors"
                                title="View Family Details"
                              >
                                <Eye size={16} />
                              </button>
                            )}
                            <button 
                              onClick={() => {
                                if (user.role === 'Resident') {
                                  navigate(`/dashboard/residents/edit/${user._id}`);
                                } else {
                                  handleOpenDialog(null, user);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"
                              title="Edit User"
                            >
                              <Edit2 size={16} />
                            </button>
                            {user.isActive !== false && (
                              <button 
                                onClick={() => handleDeactivate(user._id)}
                                className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                                title="Deactivate User"
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </Td>
                      </Tr>
                      {roleFilter === 'Resident' && isExpanded && totalMembers > 0 && (
                        <Tr hover={false} className="bg-slate-50/40 border-l-2 border-emerald-500">
                          <Td colSpan={4} className="py-2.5 px-6">
                            <div className="pl-4 py-1 space-y-2">
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Family Member List</p>
                              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                                {familyMembersList.map((member: any) => (
                                  <div key={member._id} className="bg-white border border-slate-100 p-2 rounded-lg flex justify-between items-center shadow-sm">
                                    <div>
                                      <p className="font-semibold text-slate-800 text-xs">{member.name}</p>
                                      <p className="text-[10px] text-slate-400">{member.phone ? `+${member.phone}` : member.email || 'No contact info'}</p>
                                    </div>
                                    <Badge variant="success" className="text-[10px] py-0.5 px-1.5 font-semibold">
                                      {member.relationWithOwner || 'Family'}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </Td>
                        </Tr>
                      )}
                    </React.Fragment>
                  );
                })
              ) : (
                <Tr hover={false}>
                  <Td colSpan={5} className="text-center py-12 text-slate-500">
                    No users found matching your search.
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        )}
      </div>

      {/* Add User Dialog */}
      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title={editUserId ? "Edit User" : preSelectedRoleName === 'resident' ? "Add New Resident" : "Add New Staff"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">{editUserId ? "Update User" : preSelectedRoleName === 'resident' ? "Create Resident" : "Create Staff"}</Button>
          </>
        }
      >
        <div className="space-y-4 py-2">
          {/* Common Fields */}
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Full Name" 
              placeholder="" 
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
            <Input 
              label="Email Address" 
              type="email" 
              placeholder="" 
              name="email"
              value={formData.email}
              onChange={handleChange}
            />
          </div>

          <Input 
            label="Mobile Number" 
            placeholder="" 
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />

          {/* Resident Specific Fields */}
          {isResident && (
            <div className="space-y-4">
              {!editUserId && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 ml-0.5">Assign Flat</label>
                  <select 
                    name="flatId"
                    value={formData.flatId}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer"
                  >
                    <option value="">Select a Flat</option>
                    {flats.map((flat: any) => (
                      <option key={flat._id} value={flat._id}>
                        {flat.flatNumber} (Block {flat.block})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <Input 
                label="Username" 
                name="username"
                placeholder=""
                value={formData.username}
                onChange={handleChange}
              />
              
              {!editUserId && (
                <Input 
                  label="Password (Optional - auto-generated if blank)" 
                  type={showPassword ? "text" : "password"}
                  placeholder="" 
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
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
              )}
            </div>
          )}

          {/* Staff Specific Fields */}
          {isStaff && (
            <div className="space-y-4 animate-fade-in">
              <div className="grid grid-cols-2 gap-4">
                <Input 
                  label="Date of Birth" 
                  type="date" 
                  name="dob"
                  value={formData.dob}
                  onChange={handleDobChange}
                />
                <Input 
                  label="Age (Calculated)" 
                  type="text" 
                  name="age"
                  readOnly
                  disabled
                  value={formData.age}
                  className="bg-slate-100 cursor-not-allowed"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-700 ml-0.5">Staff Role</label>
                  <select 
                    name="staffRole"
                    value={formData.staffRole}
                    onChange={handleChange}
                    className="w-full px-3 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all cursor-pointer"
                  >
                    <option value="">Select Staff Role</option>
                    <option value="Guard">Security Guard</option>
                    <option value="Technician">Technician (Electrician/Plumber)</option>
                    <option value="Cleaner">Cleaner (Housekeeping)</option>
                    <option value="Gardener">Gardener</option>
                    <option value="Manager">Manager</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <Input 
                  label="Joining Date" 
                  type="date" 
                  name="joiningDate"
                  max={new Date().toISOString().split('T')[0]}
                  value={formData.joiningDate}
                  onChange={handleChange}
                />
              </div>

              {!editUserId ? (
                <div className="grid grid-cols-2 gap-4">
                  <Input 
                    label="Username" 
                    name="username"
                    placeholder=""
                    value={formData.username}
                    onChange={handleChange}
                  />
                  <Input 
                    label="Password" 
                    type={showPassword ? "text" : "password"}
                    placeholder="" 
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
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
              ) : (
                <Input 
                  label="Username" 
                  name="username"
                  placeholder=""
                  value={formData.username}
                  onChange={handleChange}
                />
              )}
            </div>
          )}
        </div>
      </Dialog>
    </div>
  );
}

export default ManageUsers;
