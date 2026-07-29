import { Request, Response } from 'express';
import Role from '../model/role.model.js';

export const createRole = async (req: Request, res: Response) => {
  try {
    const { role, roleDescription } = req.body;
    const newRole = await Role.create({ role, roleDescription });
    res.status(201).json({
      message: 'Role created successfully',
      data: newRole,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getRoles = async (req: Request, res: Response) => {
  try {
    const roles = [
      { _id: 'Admin', role: 'Admin', roleDescription: 'Society Administrator' },
      { _id: 'Member', role: 'Member', roleDescription: 'Society Resident Member' },
      { _id: 'Staff', role: 'Staff', roleDescription: 'Society Staff and Security' }
    ];
    res.status(200).json({ data: roles });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getRoleById = async (req: Request, res: Response) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ message: 'Role not found' });
    res.status(200).json({ data: role });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateRole = async (req: Request, res: Response) => {
  try {
    const updatedRole = await Role.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedRole) return res.status(404).json({ message: 'Role not found' });
    res.status(200).json({
      message: 'Role updated successfully',
      data: updatedRole,
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteRole = async (req: Request, res: Response) => {
  try {
    const deletedRole = await Role.findByIdAndDelete(req.params.id);
    if (!deletedRole) return res.status(404).json({ message: 'Role not found' });
    res.status(200).json({ message: 'Role deleted successfully' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};
