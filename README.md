# RavindraNexus HRMS

RavindraNexus HRMS is a full-stack Human Resource Management System built for organizations that need a single place to manage employee operations, approvals, attendance, salary records, documents, reporting, and internal communication.

The project has:

- a `client` app built with React + Vite
- a `server` app built with Node.js + Express + MongoDB
- JWT-based authentication with role-based access
- real-time notifications and chat using Socket.IO

## Table of Contents

- [Overview](#overview)
- [Core Features](#core-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [How the System Works](#how-the-system-works)
- [Frontend Routes](#frontend-routes)
- [Backend API Overview](#backend-api-overview)
- [Environment Variables](#environment-variables)
- [Local Setup](#local-setup)
- [Deployment Guide](#deployment-guide)
- [Security Notes](#security-notes)
- [Known Considerations](#known-considerations)
- [Troubleshooting](#troubleshooting)
- [Future Improvements](#future-improvements)

## Overview

This HRMS supports two primary roles:

- `admin`: manages employees, approvals, attendance visibility, salary entries, documents, reports, and team communication
- `employee`: manages attendance, leave requests, personal documents, chat, notifications, salary view, and profile

The application is designed around a practical HR workflow:

1. A user signs up.
2. Employee accounts wait for admin approval.
3. Approved users log in and access role-based dashboards.
4. Admins maintain employee records, upload/generate documents, assign tasks, and review leave/attendance.
5. Employees mark attendance, request leave, view salary/documents, and communicate through chat.

## Core Features

### Authentication and Approval Flow

- Employee and admin registration
- JWT-based login
- Employee approval and rejection flow
- Role-based route protection
- Auto-logout on invalid/expired token on the frontend

### Admin Features

- Admin dashboard with HR metrics
- Employee create, edit, delete, search, filter, and pagination
- Pending employee approval management
- Live attendance snapshot
- Leave approval and rejection
- Salary record creation
- Report analytics with CSV and PDF export
- Offer letter PDF generation
- Employee document upload
- Profile management
- Real-time chat and notifications

### Employee Features

- Personal dashboard overview
- Daily check-in and check-out
- Monthly attendance report
- Leave application with leave balance checks
- Salary history and current salary details
- Salary slip calculation based on attendance and leave
- Document upload, preview, download, and delete
- Notifications panel
- Direct and group chat
- Calendar view
- Profile update with avatar, bio, skills, and experience

### Real-Time Features

- Instant notifications for approvals, leaves, and documents
- Live chat with direct and group conversations
- Seen/delivered message state
- Typing indicators
- Live attendance updates for admins

## Tech Stack

### Frontend

- React 19
- Vite
- React Router
- Redux Toolkit
- Axios
- Socket.IO Client
- Chart.js / Recharts
- jsPDF

### Backend

- Node.js
- Express
- MongoDB with Mongoose
- JWT
- bcryptjs
- Multer
- Socket.IO
- Puppeteer
- dotenv
- cors

## Project Structure

```text
HRMS/
|-- client/
|   |-- public/
|   |-- src/
|   |   |-- assets/
|   |   |-- components/
|   |   |-- context/
|   |   |-- pages/
|   |   |   |-- admin/
|   |   |   |-- employee/
|   |   |   `-- shared/
|   |   |-- store/
|   |   `-- utils/
|   |-- .env
|   |-- package.json
|   `-- vite.config.js
|-- server/
|   |-- controllers/
|   |-- middleware/
|   |-- models/
|   |-- routes/
|   |-- uploads/
|   |-- utils/
|   |-- .env
|   |-- index.js
|   `-- package.json
`-- README.md
```

## How the System Works

### 1. Authentication Layer

- `server/controllers/authController.js` handles registration, login, profile update, and approval workflow.
- `server/middleware/authMiddleware.js` verifies JWT and applies role checks.
- `client/src/components/ProtectedRoute.jsx` protects admin and employee routes in the UI.

### 2. Employee Master Data

- Employee data is stored in the `Employee` collection.
- Login-enabled users are stored in the `User` collection.
- Employee records can be linked to user accounts through email.

### 3. Attendance Flow

- Employees check in and check out from the employee dashboard.
- The system records late check-in and early logout flags.
- Admins can see a live attendance snapshot.
- Attendance updates are broadcast over Socket.IO.

### 4. Leave Flow

- Employees apply for leave from the employee panel.
- Leave balance is validated before request creation.
- Admins approve or reject leave requests.
- Approved leaves reduce balance from the linked employee record.
- Notifications are pushed to both admin and employee sides.

### 5. Salary Flow

- Admins create salary records.
- Employees can view salary history.
- Salary slip generation logic also calculates:
  - working days
  - overtime
  - deductions from approved leaves
  - final salary estimate

### 6. Document Flow

- Admins can upload employee documents.
- Employees can upload their own documents.
- Offer letters are generated as PDF using Puppeteer.
- Sensitive document metadata like original file name and file path is encrypted before storage.
- Documents can be previewed or downloaded only by authorized users.

### 7. Chat and Notifications

- Real-time messaging supports direct and group chats.
- Department-based groups are automatically maintained.
- Messages support text, file, image, edit, and delete flows.
- Notification events are pushed in real time through Socket.IO.

## Frontend Routes

### Public

- `/login`
- `/signup`

### Admin

- `/admin`
- `/admin/employees`
- `/admin/attendance`
- `/admin/pending-approvals`
- `/admin/salary`
- `/admin/tasks`
- `/admin/chat`
- `/admin/leaves`
- `/admin/documents`
- `/admin/reports`
- `/admin/generate-offer`
- `/admin/profile`
- `/admin/profile/:id`

### Employee

- `/employee`
- `/employee/attendance`
- `/employee/salary`
- `/employee/tasks`
- `/employee/leaves`
- `/employee/documents`
- `/employee/calendar`
- `/employee/chat`
- `/employee/notifications`
- `/employee/profile`

## Backend API Overview

Base URL format:

```text
http://localhost:5001/api
```

### Auth

- `POST /auth/register`
- `POST /auth/login`
- `PUT /auth/profile`
- `GET /auth/users`
- `GET /auth/users/pending`
- `PATCH /auth/users/approve/:id`
- `PATCH /auth/users/reject/:id`

### Profile

- `GET /profile/me`
- `GET /profile/:id`
- `PUT /profile/update`
- `POST /profile/add-experience`
- `DELETE /profile/delete-experience/:id`

### Employees

- `GET /employees`
- `POST /employees`
- `PUT /employees/:id`
- `DELETE /employees/:id`
- `POST /employees/:id/documents`
- `GET /employees/my/profile`
- `GET /employees/my/documents`
- `GET /employees/my/salary-slip`

### Attendance

- `POST /attendance/checkin`
- `POST /attendance/checkout`
- `GET /attendance/today`
- `GET /attendance/report`
- `GET /attendance/live`
- `GET /attendance`

### Leaves

- `POST /leaves`
- `GET /leaves`
- `GET /leaves/my`
- `PUT /leaves/:id/status`

### Salary

- `GET /salary/my`
- `POST /salary`

### Documents

- `POST /documents/generate-offer`
- `POST /documents/upload`
- `GET /documents/my`
- `GET /documents/preview/:id`
- `GET /documents/download/:id`
- `DELETE /documents/:id`
- `GET /documents/:employeeId`

### Dashboard

- `GET /dashboard/stats`
- `GET /dashboard/admin`
- `GET /dashboard/employee`

### Reports

- `GET /reports/analytics`
- `GET /reports/download/csv`
- `GET /reports/download/pdf`

### Notifications

- `GET /notifications`
- `PUT /notifications/:id/read`
- `PUT /notifications/read-all`

### Chat

- `GET /chat/bootstrap`
- `GET /chat/users`
- `GET /chat/direct/:userId`
- `GET /chat/group/:groupId`
- `PUT /chat/seen/:type/:targetId`
- `PUT /chat/edit/:id`
- `DELETE /chat/delete/:id`
- `POST /chat/send`
- `POST /chat/groups`
- `PUT /chat/groups/:id/members`

### Utility

- `GET /test`
- `GET /health`

## Environment Variables

## Frontend: `client/.env`

Recommended:

```env
VITE_API_URL=http://localhost:5001
VITE_SOCKET_URL=http://localhost:5001
```

Supported legacy fallback:

```env
REACT_APP_API=http://localhost:5001
REACT_APP_SOCKET_URL=http://localhost:5001
```

### Backend: `server/.env`

Example:

```env
PORT=5001
APP_NAME=RavindraNexus
MONGO_URI=mongodb://localhost:27017/hrms
JWT_SECRET=replace_with_a_long_random_secret
JWT_EXPIRE=30d
CLIENT_URL=http://localhost:5173
DOCUMENT_METADATA_SECRET=replace_with_another_long_random_secret
```

Notes:

- `CLIENT_URL` can contain one or more frontend domains separated by commas.
- `DOCUMENT_METADATA_SECRET` is used for document metadata encryption fallback and should be set in production.
- If `PORT` is not provided, the backend defaults to `5001`.

## Local Setup

### 1. Clone the project

```bash
git clone <your-repository-url>
cd HRMS
```

### 2. Install frontend dependencies

```bash
cd client
npm install
```

### 3. Install backend dependencies

```bash
cd ../server
npm install
```

### 4. Configure environment files

Create or update:

- `client/.env`
- `server/.env`

Use the sample values from the environment section above.

### 5. Start backend

```bash
cd server
npm run dev
```

### 6. Start frontend

Open a second terminal:

```bash
cd client
npm run dev
```

### 7. Open the app

Frontend:

```text
http://localhost:5173
```

Backend:

```text
http://localhost:5001/api/health
```

## Available Scripts

### Client

- `npm run dev` starts Vite dev server
- `npm run build` creates production build
- `npm run preview` previews the production build
- `npm run lint` runs ESLint

### Server

- `npm start` starts the production server
- `npm run dev` starts the backend with Nodemon

## Deployment Guide

### Frontend Deployment

When deploying the Vite frontend:

- set `VITE_API_URL` to the backend domain
- set `VITE_SOCKET_URL` to the backend domain
- ensure SPA rewrites are enabled for frontend routes

Example:

```env
VITE_API_URL=https://your-backend-domain.com
VITE_SOCKET_URL=https://your-backend-domain.com
```

### Backend Deployment

When deploying the backend:

- set `MONGO_URI`
- set `JWT_SECRET`
- set `DOCUMENT_METADATA_SECRET`
- set `CLIENT_URL` to the deployed frontend domain
- ensure file upload directories are writable
- ensure Puppeteer is supported in your hosting environment

Example:

```env
CLIENT_URL=https://your-frontend-domain.com
```

### Full Deployment Checklist

- frontend env uses `VITE_*` keys
- backend env contains database and JWT secrets
- frontend domain is whitelisted in backend CORS
- MongoDB network access allows the deployed backend
- uploads directory is persistent if you need document retention
- Puppeteer can launch in the hosting provider

## Security Notes

- Passwords are hashed using `bcryptjs`.
- JWT secures protected API routes.
- Role-based authorization is enforced on sensitive actions.
- Document file paths and original names are encrypted before being stored.
- Admin-only features are protected at both route and controller level.

Important:

- never commit real secrets to Git
- rotate exposed secrets before production use
- use strong random values for `JWT_SECRET` and `DOCUMENT_METADATA_SECRET`

## Known Considerations

- File uploads are stored on the server filesystem, so ephemeral hosting can remove uploaded assets after restart.
- Puppeteer-based PDF generation may require extra setup on some cloud platforms.
- Salary calculations are based on current business logic in controllers and may need adjustment for company policy.
- `Employee` and `User` records are linked mainly through email, so those records should stay consistent.

## Troubleshooting

### Frontend is live but API calls fail

Check:

- `VITE_API_URL` is set correctly in frontend hosting
- `VITE_SOCKET_URL` is set correctly
- backend `CLIENT_URL` includes the frontend domain
- browser network tab is not receiving HTML instead of JSON

### Login works locally but not after deploy

Check:

- production frontend env variables are defined
- backend CORS is configured with the correct deployed domain
- backend server is reachable and healthy

### Chat or notifications do not work

Check:

- `VITE_SOCKET_URL` points to the backend root domain, not `/api`
- Socket.IO is allowed by hosting and reverse proxy settings
- browser console has no connection or CORS errors

### Offer letter or PDF report generation fails

Check:

- Puppeteer dependencies are available on the server
- the hosting environment allows headless browser execution

### Uploaded documents disappear after redeploy

Cause:

- the hosting provider may use non-persistent filesystem storage

Fix:

- move uploads to persistent cloud storage such as S3, Cloudinary, or similar

## Future Improvements

- move uploaded files to cloud object storage
- add refresh token flow
- add automated tests for critical HR workflows
- add audit logging for approvals and admin actions
- add better analytics and export options
- add department and reporting hierarchy management
- add payroll policy configuration from admin panel

## Summary

RavindraNexus HRMS is a practical MERN-style HR system covering the main internal HR operations for both admins and employees. It combines authentication, approvals, attendance, salary, documents, reports, notifications, and chat into one unified workflow.

If you want, I can also make the next version of this README more polished with:

- badges
- screenshots section
- API examples with request/response
- contributor and license sections
- Hindi + English mixed documentation style
