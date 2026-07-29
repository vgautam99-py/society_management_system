import { Response } from 'express';
import User from '../model/user.model.js';
import Flat from '../model/flat.model.js';
import { generateHash, comparePassword } from '../lib/hashPassword.js';
import { uploadToCloudinary } from '../lib/cloudinary.js';
import APIFeatures from '../lib/apiFeatures.js';
import { AuthenticatedRequest } from '../middleware/verifyToken.js';

export const createUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { 
      name, 
      email, 
      username,
      phone, 
      role, 
      flatId, 
      password,
      dob,
      joiningDate,
      staffRole,
      age,
      gender,
      maritalStatus,
      numberOfChildren,
      totalFamilyMembers,
      relationWithOwner,
      isFlatOwner,
      familyMembers, // Array of family members [{ name, dob, phone, email, relationWithOwner }]
    } = req.body;

    if (!name || !email || !role) {
      return res.status(400).json({ message: 'Name, email, and role are required.' });
    }

    if (role === 'Staff') {
      if (!dob || !joiningDate || !staffRole || !password) {
        return res.status(400).json({ message: 'Date of birth, joining date, staff role, and password are required for staff members.' });
      }
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email.' });
    }

    if (username) {
      const existingUsername = await User.findOne({ username });
      if (existingUsername) {
        return res.status(400).json({ message: 'User already exists with this username.' });
      }
    }

    const plainPassword = password || Math.random().toString(36).slice(-8);
    const hashPass = await generateHash(plainPassword);

    let flatOccupiedSet = false;
    if (flatId) {
      const flatObj = await Flat.findOne({ _id: flatId, society: req.user?.society });
      if (flatObj) {
        flatObj.isOccupied = true;
        await flatObj.save();
        flatOccupiedSet = true;
      }
    }

    let newUser: any = null;
    try {
      newUser = await User.create({
        name,
        email,
        username: username || undefined,
        phone: phone ? Number(phone) : undefined,
        role,
        password: hashPass,
        flat: flatId || undefined,
        society: req.user?.society,
        dob: dob ? new Date(dob) : undefined,
        joiningDate: joiningDate ? new Date(joiningDate) : undefined,
        staffRole: role === 'Staff' ? staffRole : undefined,
        age: age ? Number(age) : undefined,
        gender: role === 'Resident' ? gender : undefined,
        maritalStatus: role === 'Resident' ? maritalStatus : undefined,
        numberOfChildren: role === 'Resident' ? Number(numberOfChildren) : undefined,
        totalFamilyMembers: role === 'Resident' ? Number(totalFamilyMembers) : undefined,
        relationWithOwner: role === 'Resident' ? (relationWithOwner || 'Self') : undefined,
        isFlatOwner: role === 'Resident' ? (isFlatOwner !== undefined ? isFlatOwner : true) : undefined,
      });

      if (role === 'Resident' && Array.isArray(familyMembers) && flatId) {
        for (const member of familyMembers) {
          if (member.name?.trim()) {
            const memberEmail = member.email?.trim() || `family_${Math.random().toString(36).slice(2, 11)}_${Date.now()}@sms.com`;
            await User.create({
              name: member.name,
              dob: member.dob ? new Date(member.dob) : undefined,
              phone: member.phone ? Number(member.phone) : undefined,
              email: memberEmail,
              relationWithOwner: member.relationWithOwner || 'Other',
              isFlatOwner: false,
              role: 'Resident',
              flat: flatId,
              society: req.user?.society,
              isActive: true,
            });
          }
        }
      }

      const returnedUser = await User.findById(newUser._id).select('-password');

      console.log(`🔑 [Admin User Creation] Created ${role} user: ${email} | Password: ${plainPassword}`);

      res.status(201).json({
        message: 'User created successfully',
        data: returnedUser,
      });
    } catch (error: any) {
      if (newUser) {
        await User.deleteOne({ _id: newUser._id });
      }
      if (flatOccupiedSet && flatId) {
        const flatObj = await Flat.findOne({ _id: flatId });
        if (flatObj) {
          flatObj.isOccupied = false;
          await flatObj.save();
        }
      }
      res.status(500).json({ error: error.message });
    }
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const societyId = req.user?.society;
    const countFeatures = new APIFeatures(User.find({ society: societyId }), req.query)
      .filter()
      .search(['name', 'email']);
    const totalResults = await countFeatures.query.countDocuments();

    const features = new APIFeatures(User.find({ society: societyId }), req.query)
      .filter()
      .search(['name', 'email'])
      .sort()
      .paginate();

    const users = await features.query
      .populate('flat')
      .select('-password');

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    res.status(200).json({
      message: 'success',
      totalResults,
      totalPages: Math.ceil(totalResults / limit),
      page,
      limit,
      data: users,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deactivateUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findOneAndUpdate(
      { _id: id, society: req.user?.society },
      { isActive: false },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: 'User not found in your society' });
    }
    res.status(200).json({
      message: 'User deactivated successfully',
      data: user,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getSingleUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ _id: id, society: req.user?.society }).populate('flat');
    if (!user) {
      return res.status(404).json({ message: 'User not found in your society' });
    }
    res.status(200).json({
      message: 'success',
      data: user,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUser = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { familyMembers, ...cleanUpdateData } = req.body;
    const updateData = { ...cleanUpdateData };

    if (updateData.password) {
      updateData.password = await generateHash(updateData.password);
    }

    const updatedUser = await User.findOneAndUpdate(
      { _id: id, society: req.user?.society }, 
      updateData, 
      {
        new: true,
        runValidators: true,
      }
    ).populate('flat');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found in your society' });
    }

    // Re-sync family members if updated
    if (updatedUser.role === 'Resident' && Array.isArray(familyMembers) && updatedUser.flat) {
      const flatId = updatedUser.flat._id || updatedUser.flat;
      await User.deleteMany({
        flat: flatId,
        isFlatOwner: false,
        society: req.user?.society
      });

      for (const member of familyMembers) {
        if (member.name?.trim()) {
          const memberEmail = member.email?.trim() || `family_${Math.random().toString(36).slice(2, 11)}_${Date.now()}@sms.com`;
          await User.create({
            name: member.name,
            dob: member.dob ? new Date(member.dob) : undefined,
            phone: member.phone ? Number(member.phone) : undefined,
            email: memberEmail,
            relationWithOwner: member.relationWithOwner || 'Other',
            isFlatOwner: false,
            role: 'Resident',
            flat: flatId,
            society: req.user?.society,
            isActive: true,
          });
        }
      }
    }

    res.status(200).json({
      message: 'User updated successfully',
      data: updatedUser,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProfilePhoto = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: 'Please select a profile photo to upload.' });
    }

    const photoUrl = await uploadToCloudinary(req.file.buffer, req.file.originalname);

    const user = await User.findOneAndUpdate(
      { _id: id, society: req.user?.society },
      { profilePhoto: photoUrl },
      { new: true }
    ).populate('flat');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    res.status(200).json({
      message: 'Profile photo uploaded successfully',
      profilePhoto: photoUrl,
      data: user,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateSelfProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { name, email, phone, planName, planStartDate, planEndDate } = req.body;
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const updateFields: any = {};
    if (name) updateFields.name = name;
    if (email) updateFields.email = email;
    if (phone !== undefined) updateFields.phone = phone;
    if (planName) updateFields.planName = planName;
    if (planStartDate) updateFields.planStartDate = planStartDate;
    if (planEndDate) updateFields.planEndDate = planEndDate;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updateFields,
      { new: true, runValidators: true }
    ).populate('flat');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'Profile updated successfully',
      data: user,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const changeSelfPassword = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { oldPassword, newPassword } = req.body;
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Old and new passwords are required' });
    }
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const isMatch = await comparePassword(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Incorrect old password' });
    }

    user.password = await generateHash(newPassword);
    await user.save();

    res.status(200).json({ message: 'Password updated successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

import Complaint from '../model/complaint.model.js';
export const getSocietyStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const societyId = req.user?.society;

    // 1. Total Residents
    const totalResidents = await User.countDocuments({ role: 'Resident', society: societyId });

    // 2. Occupancy Rate
    const totalFlats = await Flat.countDocuments({ society: societyId });
    const occupiedFlats = await Flat.countDocuments({ society: societyId, isOccupied: true });
    const occupancyRate = totalFlats > 0 ? Math.round((occupiedFlats / totalFlats) * 100) : 0;

    // 3. Staff (Active / Total)
    const activeStaff = await User.countDocuments({ role: 'Staff', isActive: true, society: societyId });
    const totalStaff = await User.countDocuments({ role: 'Staff', society: societyId });

    // 4. Pending Issues (Complaints where status is not completed)
    const pendingIssues = await Complaint.countDocuments({ 
      society: societyId, 
      status: { $ne: 'completed' } 
    });

    // 5. Recent Alerts (Latest 5 pending/in-progress complaints)
    const rawAlerts = await Complaint.find({ 
      society: societyId, 
      status: { $ne: 'completed' } 
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('resident', 'name');

    const recentAlerts = rawAlerts.map(alert => ({
      id: alert._id,
      title: alert.title,
      description: alert.description,
      residentName: (alert.resident as any)?.name || 'Resident',
      status: alert.status,
      createdAt: (alert as any).createdAt,
    }));

    res.status(200).json({
      success: true,
      data: {
        totalResidents,
        occupancyRate,
        activeStaff,
        totalStaff,
        pendingIssues,
        recentAlerts,
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getStaffStats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const staffId = req.user?.id;
    const societyId = req.user?.society;

    // 1. Tasks: Completed vs Total
    const totalTasks = await Complaint.countDocuments({ assignedTo: staffId, society: societyId });
    const completedTasks = await Complaint.countDocuments({ assignedTo: staffId, status: 'completed', society: societyId });

    // 2. Personal Efficiency
    const efficiency = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100;

    // 3. Pending/Active Tasks (Assigned or In-progress)
    const activeTasks = await Complaint.countDocuments({ 
      assignedTo: staffId, 
      status: { $in: ['assigned', 'in-progress'] }, 
      society: societyId 
    });

    // 4. Announcements Count
    const totalAnnouncements = await User.db.collection('notices').countDocuments({ society: societyId });

    // 5. Recent Alerts: Latest 5 active complaints assigned to this staff member
    const rawAlerts = await Complaint.find({
      assignedTo: staffId,
      status: { $ne: 'completed' },
      society: societyId
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('resident', 'name');

    const recentAlerts = rawAlerts.map(alert => ({
      id: alert._id,
      title: alert.title,
      description: alert.description,
      residentName: (alert.resident as any)?.name || 'Resident',
      status: alert.status,
      createdAt: (alert as any).createdAt,
    }));

    res.status(200).json({
      success: true,
      data: {
        completedTasks,
        totalTasks,
        efficiency,
        activeTasks,
        totalAnnouncements,
        recentAlerts,
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getStaffAssignmentStatus = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const societyId = req.user?.society;
    
    // 1. Get all staff in the society
    const staffList = await User.find({ role: 'Staff', society: societyId }).select('name email staffRole attendanceStatus');
    
    // 2. For each staff, check if they have any active tasks (assigned or in-progress)
    const result = await Promise.all(staffList.map(async (staff) => {
      const activeTaskCount = await Complaint.countDocuments({
        assignedTo: staff._id,
        status: { $in: ['assigned', 'in-progress'] },
        society: societyId
      });
      
      return {
        _id: staff._id,
        name: staff.name,
        email: staff.email,
        staffRole: staff.staffRole,
        attendanceStatus: staff.attendanceStatus || 'Present & Free',
        activeTaskCount
      };
    }));
    
    res.status(200).json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
