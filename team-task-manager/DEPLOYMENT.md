# Deployment Guide: Team Task Manager on Railway

This guide explains how to deploy the Team Task Manager application to [Railway](https://railway.app/).

## Prerequisites
- A Railway account.
- Your project code pushed to a GitHub repository.

## Step 1: Deploy the Backend (FastAPI)
1.  **Create a New Project**: In the Railway dashboard, click **+ New Project** and select **Deploy from GitHub repo**.
2.  **Select Repository**: Choose the repository containing the Team Task Manager.
3.  **Root Directory**: Set the root directory to `team-task-manager/backend`.
4.  **Add PostgreSQL (Optional but Recommended)**:
    -   Click **+ Add Service** -> **Database** -> **Add PostgreSQL**.
    -   Railway will automatically provide a `DATABASE_URL`.
5.  **Set Environment Variables**:
    -   Go to the **Variables** tab of your backend service.
    -   Add `SECRET_KEY`: A long, random string for JWT security.
    -   If not using the Railway PostgreSQL service, add `DATABASE_URL`.
6.  **Public URL**: In the **Settings** tab, click **Generate Domain** to get your public API URL (e.g., `https://backend-production.up.railway.app`).

## Step 2: Deploy the Frontend (React)
1.  **Add a New Service**: In the same project, click **+ New Service** -> **GitHub Repo**.
2.  **Select Repository**: Choose the same repository.
3.  **Root Directory**: Set the root directory to `team-task-manager/frontend`.
4.  **Set Environment Variables**:
    -   Go to the **Variables** tab.
    -   Add `VITE_API_BASE_URL`: The public URL of your backend (from Step 1).
5.  **Public URL**: In the **Settings** tab, click **Generate Domain** to get your public frontend URL.

## Step 3: Verify Connection
1.  Navigate to your public frontend URL.
2.  Try signing up and creating a project. The frontend will communicate with the backend using the `VITE_API_BASE_URL`.

## Role-Based Access Control Note
-   The first user to create a project becomes the **Admin**.
-   Admins can add other users by their email via the "Manage Members" button.
-   Members can only update the status of tasks assigned to them.
