import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import { connectDB } from './config/db.js';

import authRoutes from './routes/authRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import taskRoutes from './routes/taskRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';

import { errorHandler, notFound } from './middleware/errorHandler.js';

const app = express();

/*
|--------------------------------------------------------------------------
| CORS CONFIGURATION
|--------------------------------------------------------------------------
*/

const rawOrigins =
  process.env.FRONTEND_URL || 'http://localhost:5173';

const allowedOrigins = rawOrigins
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    console.log('Incoming Origin:', origin);

    // allow requests with no origin
    // (Postman, mobile apps, server-to-server)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('CORS blocked'));
  },

  credentials: true,

  methods: [
    'GET',
    'POST',
    'PUT',
    'PATCH',
    'DELETE',
    'OPTIONS',
  ],

  allowedHeaders: [
    'Content-Type',
    'Authorization',
  ],
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

/*
|--------------------------------------------------------------------------
| MIDDLEWARE
|--------------------------------------------------------------------------
*/

app.use(express.json());

app.use(
  morgan(
    process.env.NODE_ENV === 'production'
      ? 'combined'
      : 'dev'
  )
);

/*
|--------------------------------------------------------------------------
| HEALTH ROUTE
|--------------------------------------------------------------------------
*/

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'taskflow-manager-api',
  });
});

/*
|--------------------------------------------------------------------------
| API ROUTES
|--------------------------------------------------------------------------
*/

app.use('/api/auth', authRoutes);

app.use('/api/projects', projectRoutes);

app.use('/api', taskRoutes);

app.use('/api/dashboard', dashboardRoutes);

/*
|--------------------------------------------------------------------------
| ERROR HANDLING
|--------------------------------------------------------------------------
*/

app.use(notFound);

app.use(errorHandler);

/*
|--------------------------------------------------------------------------
| SERVER
|--------------------------------------------------------------------------
*/

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('Failed to start server', err);

    process.exit(1);
  }
};

start();