# TaskFlow Manager

## 🚀 Live Deployment

| Service | URL |
|----------|-----|
| **Frontend (Vercel)** | https://taskflow-manager-gamma.vercel.app |
| **Backend (Render)** | https://taskflow-backend-4zhd.onrender.com |
| **API Health Check** | https://taskflow-backend-4zhd.onrender.com/api/health → `{"status":"ok"}` |

---

## ✅ Deployment Notes

- Blueprint deployment on Render was initially blocked because of:
  - payment modal issue
  - invalid `node` environment configuration

### Fix Applied

- Switched to **New → Web Service (Free Plan)**
- Updated `render.yaml`
  - `runtime: node`
  - `plan: free`

### Render Configuration

| Setting | Value |
|---------|-------|
| Repository | `Task-Manager` |
| Root Directory | `backend` |
| Build Command | `npm install` |
| Start Command | `npm start` |

### Environment Variables Configured

```env
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
FRONTEND_URL=https://taskflow-manager-gamma.vercel.app
NODE_ENV=production
```

### Frontend Redeployment

Updated Vercel environment variable:

```env
VITE_API_URL=https://taskflow-backend-4zhd.onrender.com/api
```

Frontend was redeployed successfully after updating the API URL.

---

## Project Overview

TaskFlow Manager is a full-stack project management application with role-based access, JWT authentication, and a modern React dashboard.

The platform helps teams organize projects and tasks with clear **Admin** vs **Member** permissions, progress tracking, and responsive UI workflows.

---

## Features

- Email/password authentication with JWT and bcrypt
- Admin users:
  - create/manage projects
  - manage members
  - full task CRUD and assignment
- Member users:
  - see only assigned projects/tasks
  - update task status only
- Task workflow:
  - Todo
  - In Progress
  - Completed
- Priority levels:
  - Low
  - Medium
  - High
- Due dates with overdue highlighting
- Dashboard with aggregate stats and progress tracking
- Responsive SaaS-style UI
- Protected routes and role-based access control
- Loading states and delete confirmations

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas + Mongoose |
| Authentication | JWT + bcrypt |
| Deployment | Vercel + Render |

---


---

## Folder Structure

```text
root/
  backend/
    src/
      config/        # Database connection
      controllers/   # Route handlers
      middleware/    # Auth and error handling
      models/        # Mongoose models
      routes/        # Express routes
      utils/         # JWT helpers and seed script
      server.js
    package.json
    .env.example

  frontend/
    src/
      api/           # Axios client
      components/    # Reusable UI components
      context/       # Auth context
      pages/         # Route-level pages
      routes/        # Router configuration
      utils/         # Utility helpers
      App.jsx
      main.jsx
    package.json
    .env.example

  README.md
  render.yaml
```

---

# API Endpoints

## Auth Routes

| Method | Endpoint | Description |
|--------|-----------|-------------|
| POST | `/api/auth/signup` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/auth/me` | Get current user |

---

## Project Routes (Protected)

| Method | Endpoint | Description |
|--------|-----------|-------------|
| POST | `/api/projects` | Create project |
| GET | `/api/projects` | Get all projects |
| GET | `/api/projects/:id` | Get project details |
| PUT | `/api/projects/:id` | Update project |
| DELETE | `/api/projects/:id` | Delete project |
| POST | `/api/projects/:id/members` | Add member |
| DELETE | `/api/projects/:id/members/:userId` | Remove member |

---

## Task Routes (Protected)

| Method | Endpoint | Description |
|--------|-----------|-------------|
| POST | `/api/projects/:projectId/tasks` | Create task |
| GET | `/api/projects/:projectId/tasks` | Get tasks |
| GET | `/api/tasks/my` | Get assigned tasks |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |

---

## Dashboard Route

| Method | Endpoint | Description |
|--------|-----------|-------------|
| GET | `/api/dashboard` | Dashboard statistics |

---

## Health Route

| Method | Endpoint | Description |
|--------|-----------|-------------|
| GET | `/api/health` | API health check |

---

# Local Setup

## Prerequisites

- Node.js 18+
- MongoDB Atlas

---

## Backend Setup

```bash
cd backend

cp .env.example .env

npm install

npm run seed

npm run dev
```

Backend runs on:

```text
http://localhost:5000
```

---

## Frontend Setup

```bash
cd frontend

cp .env.example .env

npm install

npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

---

# Environment Variables

## Backend `.env`

```env
PORT=5000
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:5173
NODE_ENV=development
```

---

## Frontend `.env`

```env
VITE_API_URL=http://localhost:5000/api
```

---

# Seed Command

Run from backend folder:

```bash
npm run seed
```

Demo credentials:

| Role | Email | Password |
|------|--------|----------|
| Admin | admin@test.com | Admin@123 |
| Member | member@test.com | Member@123 |

---

# Deployment

## Backend (Render)

| Setting | Value |
|---------|-------|
| Root Directory | `backend` |
| Build Command | `npm install` |
| Start Command | `npm start` |

### Backend Environment Variables

```env
MONGO_URI=your_mongodb_uri
JWT_SECRET=your_secret
FRONTEND_URL=https://taskflow-manager-gamma.vercel.app
NODE_ENV=production
```

---

## Frontend (Vercel)

### Environment Variable

```env
VITE_API_URL=https://taskflow-backend-4zhd.onrender.com/api
```

---

# Demo Credentials

| Role | Email | Password |
|------|--------|----------|
| Admin | admin@test.com | Admin@123 |
| Member | member@test.com | Member@123 |

---

# Live URLs

- Frontend:
  https://taskflow-manager-gamma.vercel.app

- Backend:
  https://taskflow-backend-4zhd.onrender.com

- API Health:
  https://taskflow-backend-4zhd.onrender.com/api/health

---

# GitHub Repository

```text
https://github.com/your-username/taskflow-manager
```

---

# Demo Video

```text
https://www.youtube.com/watch?v=YOUR_VIDEO_ID
```

---

# Testing Checklist

- [ ] User signup works
- [ ] Login returns JWT
- [ ] Protected routes require auth
- [ ] Admin can create projects/tasks
- [ ] Members only see assigned tasks
- [ ] Role-based access control works
- [ ] Dashboard statistics update correctly
- [ ] Overdue tasks highlight properly
- [ ] Logout clears session
- [ ] CORS works with deployed frontend

---

# License

MIT License
