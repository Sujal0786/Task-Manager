import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import { User } from '../models/User.js';
import { signToken } from '../utils/jwt.js';
import { AppError } from '../utils/AppError.js';

export const signup = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }
    const { name, email, password, role: roleBody } = req.body;
    const role = roleBody === 'Admin' || roleBody === 'Member' ? roleBody : 'Member';
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }
    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({
      name,
      email,
      password: hashed,
      role,
    });
    const token = signToken(user._id.toString());
    res.status(201).json({ token, user });
  } catch (e) {
    next(e);
  }
};

export const login = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array()[0].msg });
    }
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    user.password = undefined;
    const token = signToken(user._id.toString());
    res.json({ token, user });
  } catch (e) {
    next(e);
  }
};

export const me = async (req, res, next) => {
  try {
    res.json({ user: req.user });
  } catch (e) {
    next(e);
  }
};
