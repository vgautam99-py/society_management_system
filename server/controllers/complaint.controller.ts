import { Response } from 'express';
import Complaint from '../model/complaint.model.js';
import User from '../model/user.model.js';
import notificationService from '../lib/notificationService.js';
import APIFeatures from '../lib/apiFeatures.js';
import { AuthenticatedRequest } from '../middleware/verifyToken.js';

export const createComplaint = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, status } = req.body;
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const resident = req.body.resident || req.user.id;

    const complaint = await Complaint.create({
      title,
      description,
      status: status || 'pending',
      resident,
      society: req.user.society,
    });

    const adminUsers = await User.find({ role: 'Admin', society: req.user.society });
    const adminIds = adminUsers.map((admin) => admin._id.toString());
    notificationService.sendToUsers(adminIds, 'new_complaint', {
      message: 'A new complaint has been filed.',
      title: complaint.title,
      complaintId: complaint._id,
    });

    res.status(201).json({
      message: 'Complaint created successfully',
      data: complaint,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getComplaints = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const societyId = req.user.society;
    let baseQuery = Complaint.find({ society: societyId });

    if (req.user.role === 'Resident') {
      baseQuery = Complaint.find({ resident: req.user.id, society: societyId });
    } else if (req.user.role === 'Staff') {
      baseQuery = Complaint.find({ assignedTo: req.user.id, society: societyId });
    }

    const countFeatures = new APIFeatures(baseQuery.clone(), req.query)
      .filter()
      .search(['title', 'description']);
    const totalResults = await countFeatures.query.countDocuments();

    const features = new APIFeatures(baseQuery, req.query)
      .filter()
      .search(['title', 'description'])
      .sort()
      .paginate();

    const complaints = await features.query
      .populate('resident', 'name email')
      .populate('assignedTo', 'name email');
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    res.status(200).json({
      message: 'success',
      totalResults,
      totalPages: Math.ceil(totalResults / limit),
      page,
      limit,
      data: complaints,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getComplaint = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const complaint = await Complaint.findOne({ _id: id, society: req.user?.society })
      .populate('resident', 'name email')
      .populate('assignedTo', 'name email');

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    res.status(200).json({
      message: 'success',
      data: complaint,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateComplaint = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const complaint = await Complaint.findOneAndUpdate(
      { _id: id, society: req.user?.society }, 
      req.body, 
      { new: true }
    )
      .populate('resident', 'name email')
      .populate('assignedTo', 'name email');

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    if (req.body.assignedTo) {
      // Validate that the assigned staff belongs to the same society
      const isStaffInSociety = await User.findOne({ _id: req.body.assignedTo, society: req.user?.society });
      if (isStaffInSociety) {
        notificationService.sendToUser(req.body.assignedTo, 'complaint_assigned', {
          message: `You have been assigned to resolve the complaint: "${complaint.title}".`,
          title: complaint.title,
          complaintId: complaint._id,
        });
      }
    }

    if (complaint.resident && req.body.status) {
      notificationService.sendToUser(complaint.resident, 'complaint_status_update', {
        message: `Your complaint "${complaint.title}" status has been updated to "${complaint.status}".`,
        title: complaint.title,
        complaintId: complaint._id,
        status: complaint.status,
      });

      // Also notify all admins of the society
      const admins = await User.find({ role: 'Admin', society: req.user?.society }).select('_id');
      if (admins.length > 0) {
        const adminIds = admins.map(a => a._id);
        notificationService.sendToUsers(adminIds, 'complaint_status_update', {
          message: `Complaint "${complaint.title}" status has been updated to "${complaint.status}" by ${req.user?.name || 'Staff'}.`,
          title: complaint.title,
          complaintId: complaint._id,
          status: complaint.status,
        });
      }
    }

    res.status(200).json({
      message: 'Complaint updated successfully',
      data: complaint,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteComplaint = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const complaint = await Complaint.findOneAndDelete({ _id: id, society: req.user?.society });

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    res.status(200).json({
      message: 'Complaint deleted successfully',
      data: complaint,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
