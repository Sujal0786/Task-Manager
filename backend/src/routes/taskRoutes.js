import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  createTask,
  deleteTask,
  listProjectTasks,
  myTasks,
  updateTask,
} from '../controllers/taskController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

const statusValues = ['Todo', 'In Progress', 'Completed'];
const priorityValues = ['Low', 'Medium', 'High'];

const createTaskRules = [
  body('title').trim().notEmpty().withMessage('Task title is required'),
  body('description').optional().isString(),
  body('assignedTo').isMongoId().withMessage('Assignee is required'),
  body('status').optional().isIn(statusValues),
  body('priority').optional().isIn(priorityValues),
  body('dueDate').notEmpty().withMessage('Due date is required').isISO8601().withMessage('Invalid due date'),
];

const updateTaskRules = [
  body('title').optional().trim().notEmpty(),
  body('description').optional().isString(),
  body('assignedTo').optional().isMongoId(),
  body('status').optional().isIn(statusValues),
  body('priority').optional().isIn(priorityValues),
  body('dueDate').optional().isISO8601(),
];

router.get('/tasks/my', myTasks);

router.post(
  '/projects/:projectId/tasks',
  param('projectId').isMongoId().withMessage('Invalid project id'),
  createTaskRules,
  createTask
);
router.get(
  '/projects/:projectId/tasks',
  param('projectId').isMongoId().withMessage('Invalid project id'),
  listProjectTasks
);
router.put('/tasks/:id', param('id').isMongoId().withMessage('Invalid task id'), updateTaskRules, updateTask);
router.delete('/tasks/:id', param('id').isMongoId().withMessage('Invalid task id'), deleteTask);

export default router;
