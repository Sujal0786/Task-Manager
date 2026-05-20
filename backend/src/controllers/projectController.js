import { validationResult } from 'express-validator';
import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';

export const isProjectMember = (project, userId) => {
  const uid = userId.toString();
  if (project.owner.toString() === uid) return true;
  return project.members.some((m) => m.toString() === uid);
};

export const canViewProject = (project, user) => {
  if (user.role === 'Admin') return true;
  return isProjectMember(project, user._id);
};

export const canMutateProject = (project, user) => {
  if (user.role === 'Admin') return true;
  return false;
};

export const createProject = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }
    if (req.user.role !== 'Admin') {
      throw new AppError('Only admins can create projects', 403);
    }
    const { title, description } = req.body;
    const members = [req.user._id];
    const project = await Project.create({
      title,
      description: description || '',
      owner: req.user._id,
      members,
    });
    const populated = await Project.findById(project._id).populate('owner members', 'name email role');
    res.status(201).json({ project: populated });
  } catch (e) {
    next(e);
  }
};

export const listProjects = async (req, res, next) => {
  try {
    let query = {};
    if (req.user.role !== 'Admin') {
      query = {
        $or: [{ owner: req.user._id }, { members: req.user._id }],
      };
    }
    const projects = await Project.find(query)
      .populate('owner members', 'name email role')
      .sort({ createdAt: -1 });
    res.json({ projects });
  } catch (e) {
    next(e);
  }
};

export const getProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id).populate('owner members', 'name email role');
    if (!project) {
      throw new AppError('Project not found', 404);
    }
    if (!canViewProject(project, req.user)) {
      throw new AppError('Not authorized to view this project', 403);
    }
    res.json({ project });
  } catch (e) {
    next(e);
  }
};

export const updateProject = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }
    const project = await Project.findById(req.params.id);
    if (!project) {
      throw new AppError('Project not found', 404);
    }
    if (!canMutateProject(project, req.user)) {
      throw new AppError('Not authorized to update this project', 403);
    }
    const { title, description } = req.body;
    if (title !== undefined) project.title = title;
    if (description !== undefined) project.description = description;
    await project.save();
    const populated = await Project.findById(project._id).populate('owner members', 'name email role');
    res.json({ project: populated });
  } catch (e) {
    next(e);
  }
};

export const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      throw new AppError('Project not found', 404);
    }
    if (!canMutateProject(project, req.user)) {
      throw new AppError('Not authorized to delete this project', 403);
    }
    await Task.deleteMany({ projectId: project._id });
    await project.deleteOne();
    res.json({ message: 'Project deleted' });
  } catch (e) {
    next(e);
  }
};

export const addMember = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }
    const project = await Project.findById(req.params.id);
    if (!project) {
      throw new AppError('Project not found', 404);
    }
    if (!canMutateProject(project, req.user)) {
      throw new AppError('Not authorized to add members', 403);
    }
    const { userId, email } = req.body;
    let userToAdd = null;
    if (userId) {
      userToAdd = await User.findById(userId);
    } else if (email) {
      userToAdd = await User.findOne({ email: email.toLowerCase().trim() });
    } else {
      return res.status(400).json({ message: 'userId or email is required' });
    }
    if (!userToAdd) {
      throw new AppError('User not found', 404);
    }
    if (isProjectMember(project, userToAdd._id)) {
      return res.status(400).json({ message: 'User is already a member' });
    }
    project.members.push(userToAdd._id);
    await project.save();
    const populated = await Project.findById(project._id).populate('owner members', 'name email role');
    res.json({ project: populated });
  } catch (e) {
    next(e);
  }
};

export const removeMember = async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      throw new AppError('Project not found', 404);
    }
    if (!canMutateProject(project, req.user)) {
      throw new AppError('Not authorized to remove members', 403);
    }
    const { userId } = req.params;
    if (project.owner.toString() === userId) {
      throw new AppError('Cannot remove project owner', 400);
    }
    project.members = project.members.filter((m) => m.toString() !== userId);
    await project.save();
    const populated = await Project.findById(project._id).populate('owner members', 'name email role');
    res.json({ project: populated });
  } catch (e) {
    next(e);
  }
};
