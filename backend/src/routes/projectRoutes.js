import { Router } from 'express';
import { body, param } from 'express-validator';
import {
  addMember,
  createProject,
  deleteProject,
  getProject,
  listProjects,
  removeMember,
  updateProject,
} from '../controllers/projectController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

router.use(protect);

const projectBody = [
  body('title').trim().notEmpty().withMessage('Project title is required'),
  body('description').optional().isString(),
];

const projectUpdateBody = [
  body('title').optional().trim().notEmpty().withMessage('Project title cannot be empty'),
  body('description').optional().isString(),
];

router.post('/', projectBody, createProject);
router.get('/', listProjects);
router.get('/:id', param('id').isMongoId().withMessage('Invalid project id'), getProject);
router.put('/:id', param('id').isMongoId().withMessage('Invalid project id'), projectUpdateBody, updateProject);
router.delete('/:id', param('id').isMongoId().withMessage('Invalid project id'), deleteProject);
router.post(
  '/:id/members',
  param('id').isMongoId().withMessage('Invalid project id'),
  body('userId').optional().isMongoId().withMessage('Invalid user id'),
  body('email').optional().isEmail().withMessage('Invalid email'),
  addMember
);
router.delete(
  '/:id/members/:userId',
  param('id').isMongoId().withMessage('Invalid project id'),
  param('userId').isMongoId().withMessage('Invalid user id'),
  removeMember
);

export default router;
