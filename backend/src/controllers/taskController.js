import { validationResult } from 'express-validator';
import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';
import { User } from '../models/User.js';
import { AppError } from '../utils/AppError.js';
import { canViewProject, canMutateProject, isProjectMember } from './projectController.js';

const loadProject = async (projectId) => Project.findById(projectId);

export const createTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }
    const { projectId } = req.params;
    const project = await loadProject(projectId);
    if (!project) {
      throw new AppError('Project not found', 404);
    }
    if (!canViewProject(project, req.user)) {
      throw new AppError('Not authorized', 403);
    }
    if (req.user.role !== 'Admin') {
      throw new AppError('Only admins can create tasks', 403);
    }
    if (!canMutateProject(project, req.user)) {
      throw new AppError('Not authorized to manage tasks on this project', 403);
    }
    const { title, description, assignedTo, status, priority, dueDate } = req.body;
    const assignee = await User.findById(assignedTo);
    if (!assignee) {
      throw new AppError('Assignee not found', 404);
    }
    if (!isProjectMember(project, assignee._id)) {
      return res.status(400).json({ message: 'Assigned user must be a project member' });
    }
    const task = await Task.create({
      title,
      description: description || '',
      projectId: project._id,
      assignedTo,
      createdBy: req.user._id,
      status: status || 'Todo',
      priority: priority || 'Medium',
      dueDate: new Date(dueDate),
    });
    const populated = await Task.findById(task._id)
      .populate('assignedTo createdBy', 'name email role')
      .populate('projectId', 'title');
    res.status(201).json({ task: populated });
  } catch (e) {
    next(e);
  }
};

export const listProjectTasks = async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const project = await loadProject(projectId);
    if (!project) {
      throw new AppError('Project not found', 404);
    }
    if (!canViewProject(project, req.user)) {
      throw new AppError('Not authorized', 403);
    }
    let filter = { projectId: project._id };
    if (req.user.role === 'Member') {
      filter.assignedTo = req.user._id;
    }
    const tasks = await Task.find(filter)
      .populate('assignedTo createdBy', 'name email role')
      .sort({ dueDate: 1, createdAt: -1 });
    res.json({ tasks });
  } catch (e) {
    next(e);
  }
};

export const myTasks = async (req, res, next) => {
  try {
    const tasks = await Task.find({ assignedTo: req.user._id })
      .populate('projectId', 'title')
      .populate('createdBy', 'name email')
      .sort({ dueDate: 1 });
    res.json({ tasks });
  } catch (e) {
    next(e);
  }
};

export const updateTask = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }
    const task = await Task.findById(req.params.id).populate('projectId');
    if (!task) {
      throw new AppError('Task not found', 404);
    }
    const project = task.projectId;
    if (!canViewProject(project, req.user)) {
      throw new AppError('Not authorized', 403);
    }
    const isAdmin = req.user.role === 'Admin';
    const isAssignee = task.assignedTo.toString() === req.user._id.toString();

    if (isAdmin) {
      if (!canMutateProject(project, req.user)) {
        throw new AppError('Not authorized to update tasks on this project', 403);
      }
      const { title, description, assignedTo, status, priority, dueDate } = req.body;
      if (title !== undefined) task.title = title;
      if (description !== undefined) task.description = description;
      if (status !== undefined) task.status = status;
      if (priority !== undefined) task.priority = priority;
      if (dueDate !== undefined) task.dueDate = new Date(dueDate);
      if (assignedTo !== undefined) {
        const assignee = await User.findById(assignedTo);
        if (!assignee) {
          throw new AppError('Assignee not found', 404);
        }
        if (!isProjectMember(project, assignee._id)) {
          return res.status(400).json({ message: 'Assigned user must be a project member' });
        }
        task.assignedTo = assignedTo;
      }
    } else {
      if (!isAssignee) {
        throw new AppError('Members can only update their assigned tasks', 403);
      }
      const { status } = req.body;
      if (status === undefined) {
        return res.status(400).json({ message: 'Members can only update task status' });
      }
      const allowed = ['Todo', 'In Progress', 'Completed'];
      if (!allowed.includes(status)) {
        return res.status(400).json({ message: 'Invalid status' });
      }
      task.status = status;
    }
    await task.save();
    const populated = await Task.findById(task._id)
      .populate('assignedTo createdBy', 'name email role')
      .populate('projectId', 'title');
    res.json({ task: populated });
  } catch (e) {
    next(e);
  }
};

export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id).populate('projectId');
    if (!task) {
      throw new AppError('Task not found', 404);
    }
    if (req.user.role !== 'Admin') {
      throw new AppError('Only admins can delete tasks', 403);
    }
    if (!canMutateProject(task.projectId, req.user)) {
      throw new AppError('Not authorized to delete this task', 403);
    }
    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (e) {
    next(e);
  }
};
