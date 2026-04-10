# Task Manager Assignment

This project is a full stack Task Manager app built for the provided assignment.

## Tech Stack

- Frontend: React + Vite
- Backend: Node.js + Express
- Storage: In-memory task array (no database)

## Features Implemented

### Core requirements

- View task list
- Add a new task
- Mark task as completed/incomplete
- Delete a task
- Loading and error states in the UI
- Backend validation with clear JSON error responses

### Optional bonuses completed

- Filter tasks (all, active, completed)
- Edit task title

## Project Structure

- `backend/` Express REST API
- `frontend/` React application

## API Endpoints

- `GET /tasks`
- `POST /tasks`
- `PATCH /tasks/:id`
- `DELETE /tasks/:id`

`GET /tasks` also supports optional query `?filter=completed` or `?filter=incomplete`.

## Run Locally

### 1) Start backend

```bash
cd backend
npm install
npm run dev
```

Backend runs on `http://localhost:3001`.

### 2) Start frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173` by default.

## Assumptions and Trade-offs

- Used in-memory storage to keep scope aligned with assignment time expectations.
- Refetch after each mutation keeps API/client logic simple and reliable for this size of app.
- Added optional bonus features (filtering and edit task title) after core requirements.
