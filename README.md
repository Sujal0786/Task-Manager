# TaskFlow Manager

Full-stack project management application with role-based access, JWT authentication, and a modern React dashboard.

## Project overview

TaskFlow Manager helps teams organize work into projects and tasks with clear **Admin** vs **Member** permissions, progress tracking, and a dashboard tailored to each role.

## Features

- Email/password authentication with JWT and bcrypt
- **Admin** users: create/manage projects, manage members, full task CRUD and assignment
- **Member** users: see only projects they belong to and tasks assigned to them; update status on assigned tasks only
- Task workflow: **Todo**, **In Progress**, **Completed**
- Priorities: **Low**, **Medium**, **High**
- Due dates with overdue highlighting on the UI
- Dashboard with aggregate stats and completion progress
- Responsive SaaS-style layout with sidebar, top bar, loading/empty states, and confirmations on destructive actions

## Tech stack

| Layer    | Technology                          |
| -------- | ----------------------------------- |
| Frontend | React 18, Vite, Tailwind CSS        |
| Backend  | Node.js 18+, Express.js             |
| Database | MongoDB Atlas + Mongoose            |
| Auth     | JWT + bcrypt                        |
| Deploy   | Render (see `render.yaml` template) |

## Screenshots

_Add screenshots of Dashboard, Projects, and Project detail here after deployment._

## Folder structure

```text
root/
  backend/
    src/
      config/        # Database connection
      controllers/   # Route handlers
      middleware/    # Auth, errors
      models/        # Mongoose models
      routes/        # Express routers
      utils/         # JWT helpers, seed script
      server.js
    package.json
    .env.example
  frontend/
    src/
      api/           # Axios client
      components/    # UI building blocks
      context/       # Auth context
      pages/         # Route-level views
      routes/        # Router configuration
      utils/         # Formatting helpers
      App.jsx
      main.jsx
    package.json
    .env.example
  README.md
  render.yaml
```

## API endpoints

### Auth

| Method | Path               | Description              |
| ------ | ------------------ | ------------------------ |
| POST   | `/api/auth/signup` | Register (Member role)   |
| POST   | `/api/auth/login`  | Login, returns JWT       |
| GET    | `/api/auth/me`     | Current user (protected) |

### Projects (protected)

| Method | Path                                   | Description                         |
| ------ | -------------------------------------- | ----------------------------------- |
| POST   | `/api/projects`                        | Create project (Admin only)         |
| GET    | `/api/projects`                        | List projects (role-aware)          |
| GET    | `/api/projects/:id`                    | Project detail                      |
| PUT    | `/api/projects/:id`                   | Update project (Admin)              |
| DELETE | `/api/projects/:id`                  | Delete project (Admin)              |
| POST   | `/api/projects/:id/members`          | Add member by `userId` or `email`   |
| DELETE | `/api/projects/:id/members/:userId`  | Remove member (Admin)               |

### Tasks (protected)

| Method | Path                                   | Description                                      |
| ------ | -------------------------------------- | ------------------------------------------------ |
| POST   | `/api/projects/:projectId/tasks`       | Create task (Admin)                              |
| GET    | `/api/projects/:projectId/tasks`       | List tasks (Admin: all, Member: assigned only)   |
| GET    | `/api/tasks/my`                        | Tasks assigned to current user                   |
| PUT    | `/api/tasks/:id`                       | Update task (Admin: full, Member: status only)   |
| DELETE | `/api/tasks/:id`                       | Delete task (Admin)                              |

### Dashboard (protected)

| Method | Path               | Description                         |
| ------ | ------------------ | ----------------------------------- |
| GET    | `/api/dashboard`   | Aggregated stats for current user |

### Health

| Method | Path            | Description   |
| ------ | --------------- | ------------- |
| GET    | `/api/health`   | Service check |

## Local setup

### Prerequisites

- Node.js 18+
- MongoDB Atlas cluster (or local MongoDB) and connection string

### Backend

```bash
cd backend
cp .env.example .env
# Set MONGO_URI, JWT_SECRET, FRONTEND_URL (e.g. http://localhost:5173)
npm install
npm run seed   # optional: demo users + sample data
npm run dev    # or npm start
```

API listens on `http://localhost:5000` by default.

### Frontend

```bash
cd frontend
cp .env.example .env
# VITE_API_URL should point to the API root including /api, e.g.:
# VITE_API_URL=http://localhost:5000/api
npm install
npm run dev
```

Open `http://localhost:5173`.

## Environment variables

### Backend (`backend/.env`)

| Name           | Description                                      |
| -------------- | ------------------------------------------------ |
| `PORT`         | Server port (default `5000`)                     |
| `MONGO_URI`    | MongoDB connection string                        |
| `JWT_SECRET`   | Secret for signing JWTs                          |
| `FRONTEND_URL` | Allowed CORS origin(s), comma-separated if many  |
| `NODE_ENV`     | `development` or `production`                    |

### Frontend (`frontend/.env`)

| Name            | Description                                      |
| --------------- | ------------------------------------------------ |
| `VITE_API_URL`  | Base URL for API calls, e.g. `https://.../api`   |

## Seed command

From `backend/` after configuring `.env`:

```bash
npm run seed
```

Creates/updates demo users and sample project/tasks:

| Role   | Email            | Password    |
| ------ | ---------------- | ----------- |
| Admin  | `admin@test.com` | `Admin@123` |
| Member | `member@test.com`| `Member@123`|

## Render deployment

You can deploy **two Web Services** (or Static Site + Web Service) on Render.

### Backend service

- **Root Directory:** `backend`
- **Build Command:** `npm install`
- **Start Command:** `npm start`
- **Environment variables**

  - `MONGO_URI` – Atlas URI  
  - `JWT_SECRET` – long random string  
  - `FRONTEND_URL` – public frontend URL (e.g. `https://taskflow-frontend.onrender.com`)  
  - `NODE_ENV` – `production`  

### Frontend service (static)

- **Root Directory:** `frontend`
- **Build Command:** `npm install && npm run build`
- **Publish Directory:** `dist`
- **Environment variable**

  - `VITE_API_URL` – `https://<your-backend>.onrender.com/api`

After first deploy, update `FRONTEND_URL` on the backend to match the deployed frontend URL, then redeploy the backend so CORS allows the correct origin.

A starter blueprint is in `render.yaml` (adjust names/plan as needed).

## Demo credentials

See **Seed command** above for `admin@test.com` / `Admin@123` and `member@test.com` / `Member@123`.

## Live URLs (placeholders)

- **Frontend:** `https://your-frontend.onrender.com`
- **Backend:** `https://your-backend.onrender.com`

## GitHub repository (placeholder)

`https://github.com/your-username/taskflow-manager`

## Demo video link (placeholder)

`https://www.youtube.com/watch?v=YOUR_VIDEO_ID`

## Demo video script (60–90 seconds)

1. **Intro (5s):** “TaskFlow Manager is a role-based project management app for small teams.”
2. **Login as Admin (10s):** Sign in with `admin@test.com`, show dashboard cards and completion bar.
3. **Projects (15s):** Open Projects, highlight sample project, open detail; show tasks table, priorities, due dates, overdue tag.
4. **Admin actions (20s):** Create a quick task, assign to member, change status; add a member by email; mention delete confirmations.
5. **Logout / Member (20s):** Log in as `member@test.com`; show only assigned tasks on project page and **My Tasks**; change a task status; note missing delete/admin buttons.
6. **Close (5s):** “Stack: React, Node, MongoDB, JWT—ready for Render and GitHub.”

## Testing checklist

- [ ] Signup creates Member user; validation errors for short password/invalid email
- [ ] Login returns JWT; `/auth/me` reflects current user
- [ ] Admin can create project; Member receives 403 on `POST /projects`
- [ ] Member only sees member projects; Admin sees broader project list
- [ ] Member cannot add/remove members or delete project/task
- [ ] Member can change status only on assigned tasks
- [ ] Admin can CRUD tasks and assign only to project members
- [ ] Dashboard stats change when tasks move to Completed
- [ ] Overdue tasks show when due date is before today and status not Completed
- [ ] Logout clears session; protected routes redirect to login
- [ ] CORS works when `FRONTEND_URL` matches deployed frontend

## License

MIT (adjust as needed for your course or organization).
