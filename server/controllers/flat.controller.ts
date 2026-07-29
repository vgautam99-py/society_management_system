import { Response } from 'express';
import Flat from '../model/flat.model.js';
import User from '../model/user.model.js';
import APIFeatures from '../lib/apiFeatures.js';
import { AuthenticatedRequest } from '../middleware/verifyToken.js';

export const createFlat = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { flatNumber, block, floor, isOccupied } = req.body;
    const newFlat = await Flat.create({ 
      flatNumber, 
      block, 
      floor,
      isOccupied: isOccupied !== undefined ? Boolean(isOccupied) : false,
      society: req.user?.society 
    });
    res.status(201).json({
      message: 'Flat created successfully',
      data: newFlat,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getFlats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const societyId = req.user?.society;
    const countFeatures = new APIFeatures(Flat.find({ society: societyId }), req.query)
      .filter()
      .search(['flatNumber', 'block']);
    const totalResults = await countFeatures.query.countDocuments();

    const features = new APIFeatures(Flat.find({ society: societyId }), req.query)
      .filter()
      .search(['flatNumber', 'block'])
      .sort()
      .limitFields()
      .paginate();

    const flats = await features.query;
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    res.status(200).json({
      message: 'success',
      totalResults,
      totalPages: Math.ceil(totalResults / limit),
      page,
      limit,
      data: flats,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getFlatById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const user = await User.findOne({ _id: req.params.id, society: req.user?.society }).populate('flat');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ data: user.flat });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateFlat = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const updatedFlat = await Flat.findOneAndUpdate(
      { _id: req.params.id, society: req.user?.society }, 
      req.body, 
      { new: true }
    );
    if (!updatedFlat) return res.status(404).json({ message: 'Flat not found' });
    res.status(200).json({
      message: 'Flat updated successfully',
      data: updatedFlat,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteFlat = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const deletedFlat = await Flat.findOneAndDelete({ _id: req.params.id, society: req.user?.society });
    if (!deletedFlat) return res.status(404).json({ message: 'Flat not found' });
    res.status(200).json({ message: 'Flat deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getAvailableFlats = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const availableFlats = await Flat.find({ isOccupied: false, society: req.user?.society });
    res.status(200).json({ data: availableFlats });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
