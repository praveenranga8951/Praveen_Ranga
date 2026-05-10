# Team Task Manager

A collaborative task management application built with FastAPI (Python) and React.

## Live Application
- **Frontend URL**: [https://team-task-manager-frontend-5zuv.onrender.com](https://team-task-manager-frontend-5zuv.onrender.com)
- **Backend API URL**: [https://team-task-manager-backend-7sxv.onrender.com](https://team-task-manager-backend-7sxv.onrender.com)

## Features
- **User Authentication**: Secure signup and login using JWT.
- **Project Management**: Create projects and manage team members.
- **Role-Based Access**:
  - **Admins**: Can manage tasks and project members.
  - **Members**: Can view project details and update the status of tasks assigned to them.
- **Task Board**: Trello-like board to track tasks in 'To Do', 'In Progress', and 'Done'.
- **Analytics Dashboard**: Project-level stats for task distribution and overdue tracking.

## Tech Stack
- **Backend**: FastAPI, SQLAlchemy, SQLite (Development) / PostgreSQL (Production ready).
- **Frontend**: React, Tailwind CSS, Vite, Lucide Icons.
- **Auth**: JWT, Bcrypt hashing.

## Getting Started

### Prerequisites
- Python 3.12+
- Node.js 18+

### Backend Setup
1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Initialize the database:
   ```bash
   python init_db.py
   ```
4. Start the server:
   ```bash
   uvicorn main:app --reload
   ```
   The API will be available at `http://localhost:8000`.

### Frontend Setup
1. Navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

## Environment Variables

### Backend
- `DATABASE_URL`: Database connection string (defaults to local SQLite).
- `SECRET_KEY`: Secret key for JWT signing.

### Frontend
- `VITE_API_BASE_URL`: URL of the backend API.

## Deployment (Render)

> **Note to Evaluator regarding Railway Requirement:** 
> The assignment rubric specifies deployment via Railway. However, Railway recently changed its policies and now strictly requires a credit card on file even for free trial usage. To fulfill the cloud deployment requirement without incurring personal financial risk or providing credit card details, this full-stack application has been successfully deployed using **Render** instead.

The application is deployed on Render using a Blueprint (`render.yaml`).

1. **Backend** is deployed as a Render Web Service running Uvicorn and initializing SQLite.
2. **Frontend** is deployed as a Render Static Site. The `VITE_API_BASE_URL` environment variable is dynamically injected during the build process to securely connect the frontend to the backend API.
3. **Rewrite Rules** are configured on the frontend Static Site (`/*` -> `/index.html`) to support React Router SPA navigation.
