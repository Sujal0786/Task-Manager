import { Router } from 'express';
import { body } from 'express-validator';
import { signup, login, me } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';

const router = Router();

const signupRules = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').optional().isIn(['Admin', 'Member']).withMessage('Role must be Admin or Member'),
];

const loginRules = [
  body('email').isEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

router.post('/signup', signupRules, signup);
router.post('/login', loginRules, login);
router.get('/me', protect, me);

export default router;
