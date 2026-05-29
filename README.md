# Task List App

Full-stack task list application with CRUD operations, React, Express, SQLite, and tests.

## Overview

This is a small full-stack task manager application. The React client handles UI and user interactions; an Express API validates requests and persists data in SQLite. Tasks support create, read, update, delete, filtering, inline editing, and drag-and-drop reordering.

The project is split into a `client/` app and a `server/` app, with root scripts to run and test both together.

## Features

**Core**
- Add tasks with title validation (empty and whitespace-only titles rejected)
- List tasks with loading and empty states
- Mark tasks complete or incomplete
- Delete individual tasks
- Inline edit for task titles
- Error messages surfaced from API validation failures

**Bonus**
- Filter tasks by All / Active / Completed
- Remaining task count (incomplete tasks only)
- Clear completed tasks
- Drag-and-drop reordering (All filter only), persisted via a `position` column

## Tech Stack

| Layer | Choice |
|-------|--------|
| Frontend | React 19, Vite |
| Backend | Node.js, Express |
| Database | SQLite via `better-sqlite3` |
| Backend tests | Node test runner, Supertest |
| Frontend tests | Vitest, React Testing Library |

React and Express keep UI concerns separate from persistence and validation. SQLite provides real backend storage with minimal local setup—no external database service required.

## Getting Started

**Prerequisites:** Node.js 18+ (Node 20+ recommended)

```bash
# From the repo root
npm install
npm install --prefix client
npm install --prefix server

# Run client (:5173) and server (:3001) together
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The Vite dev server proxies `/api` requests to the Express server.

**Run individually**

```bash
npm run dev --prefix server   # http://localhost:3001
npm run dev --prefix client   # http://localhost:5173
```

The SQLite database file is created automatically at `server/data/dev.sqlite` on first server start.

## API Routes

Base URL: `http://localhost:3001/api`

### Task object

```json
{
  "id": 1,
  "title": "Finish assignment",
  "completed": false,
  "position": 0,
  "createdAt": "2026-01-01T12:00:00.000Z",
  "updatedAt": "2026-01-01T12:00:00.000Z"
}
```

### Endpoints

| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/tasks` | List all tasks (ordered by `position`) |
| `GET` | `/tasks?status=active` | List incomplete tasks |
| `GET` | `/tasks?status=completed` | List completed tasks |
| `POST` | `/tasks` | Create a task |
| `PATCH` | `/tasks/:id` | Update title and/or completed |
| `PUT` | `/tasks/reorder` | Persist a new task order |
| `DELETE` | `/tasks/:id` | Delete one task |
| `DELETE` | `/tasks/completed` | Delete all completed tasks |
| `GET` | `/health` | Health check |

**Examples**

```http
POST /api/tasks
Content-Type: application/json

{ "title": "Finish assignment" }
```

```http
PATCH /api/tasks/1
Content-Type: application/json

{ "completed": true }
```

```http
PUT /api/tasks/reorder
Content-Type: application/json

{ "order": [3, 1, 2] }
```

Error responses use a consistent shape:

```json
{ "error": "Task title is required" }
```

## Running Tests

```bash
# Run all tests (client + server)
npm test

# With coverage
npm test:coverage
```

**Server only**

```bash
npm test --prefix server
npm run test:coverage --prefix server
```

Uses an isolated temp SQLite database per test run (`DB_PATH` / `NODE_ENV=test`).

**Client only**

```bash
npm test --prefix client
npm run test:coverage --prefix client
```

## Design Notes

- **Validation on the server:** Title trimming, empty-title rejection, boolean checks, and reorder payload validation live in `server/src/routes/validation.js`, so invalid data cannot be saved by bypassing the UI.
- **Centralized API client:** The React app calls `client/src/api/tasksApi.js` instead of scattering `fetch` usage across components.
- **Client-side filtering:** The UI filters All / Active / Completed in `App.jsx` against the full task list. The API also supports `?status=` for the same filters; the client uses local filtering to avoid extra round trips for a small list.
- **Task ordering:** New tasks are inserted at the top (`position = 0`). Reordering is available on the All filter and persisted with `PUT /api/tasks/reorder`. Drag tracking uses vertical cursor position (including above/below the list and in side margins) to show an insertion line between tasks.
- **Testability:** `server/src/app.js` exports the Express app without listening, so Supertest can exercise routes in isolation. Backend tests reset a temp database between cases; frontend tests mock `fetch` or exercise components with React Testing Library.
- **Tradeoffs:** SQLite keeps local setup simple but is not ideal for multi-user production workloads. There is no authentication, migrations framework, or optimistic UI for reorder—the list updates after the reorder API succeeds (with rollback on failure).

## Assumptions

Users manage tasks without requiring authentication or separate user accounts. This implementation treats users as visitors of the app interface and uses a single shared task list persisted by the backend.

In a production version, I would add authentication and associate each task with a `user_id`. This would enable user-specific task lists, or attributing tasks to a specific user when adding to the shared task list.
