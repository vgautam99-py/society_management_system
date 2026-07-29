import { Response } from 'express';
import Notice from '../model/notice.model.js';
import notificationService from '../lib/notificationService.js';
import APIFeatures from '../lib/apiFeatures.js';
import { AuthenticatedRequest } from '../middleware/verifyToken.js';

export const createNotice = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { title, description, expiryDate } = req.body;
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const postedBy = req.body.postedBy || req.user.id;

    const notice = await Notice.create({
      title,
      description,
      expiryDate,
      postedBy,
      society: req.user.society,
    });

    notificationService.broadcast('new_notice', {
      message: `A new announcement has been posted: "${notice.title}"`,
      title: notice.title,
      noticeId: notice._id,
    });

    res.status(201).json({
      message: 'Notice created successfully',
      data: notice,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getNotices = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const societyId = req.user?.society;
    const countFeatures = new APIFeatures(Notice.find({ society: societyId }), req.query)
      .filter()
      .search(['title', 'description']);
    const totalResults = await countFeatures.query.countDocuments();

    const features = new APIFeatures(Notice.find({ society: societyId }), req.query)
      .filter()
      .search(['title', 'description'])
      .sort()
      .paginate();

    const notices = await features.query.populate('postedBy', 'name email');
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    res.status(200).json({
      message: 'success',
      totalResults,
      totalPages: Math.ceil(totalResults / limit),
      page,
      limit,
      data: notices,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getNotice = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const notice = await Notice.findOne({ _id: id, society: req.user?.society }).populate('postedBy', 'name email');

    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    res.status(200).json({
      message: 'success',
      data: notice,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateNotice = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const notice = await Notice.findOneAndUpdate(
      { _id: id, society: req.user?.society }, 
      req.body, 
      { new: true }
    );

    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    res.status(200).json({
      message: 'Notice updated successfully',
      data: notice,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteNotice = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;

    const notice = await Notice.findOneAndDelete({ _id: id, society: req.user?.society });

    if (!notice) {
      return res.status(404).json({ message: 'Notice not found' });
    }

    res.status(200).json({
      message: 'Notice deleted successfully',
      data: notice,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
