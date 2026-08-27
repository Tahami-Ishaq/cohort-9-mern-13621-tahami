# Notes App

A full-stack notes application built with React and Node.js. Users can register, log in, manage their profile, and create, view, update, and delete personal notes.

## Stack

- Frontend: React, React Router, Vite
- Backend: Node.js, Express, PostgreSQL
- Authentication: JSON Web Tokens and bcrypt
- Testing: Jest and React Testing Library for the frontend; Mocha, Chai, and Supertest for the backend

## Project Structure

```text
.
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   └── services/
│   └── test/
└── frontend/
	├── src/
	│   ├── components/
	│   ├── context/
	│   ├── pages/
	│   ├── routes/
	│   └── services/
	└── test/
```

## Prerequisites

- Node.js 18 or later
- npm
- PostgreSQL

## Configuration

Create `backend/.env` with your PostgreSQL connection details and JWT secret:

```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=notes_app
JWT_SECRET=replace_with_a_long_random_secret
```

The frontend uses the backend origin from `VITE_API_URL`. Leave it unset when the frontend and backend are served from the same origin, or set it for a separate local server:

```env
VITE_API_URL=http://localhost:5000
```

## Installation

Install dependencies in both applications:

```bash
cd backend
npm install

cd ../frontend
npm install
```

Make sure the PostgreSQL database named in `DB_NAME` exists before starting the backend.

## Running Locally

Start the backend in one terminal:

```bash
cd backend
npm run dev
```

Start the frontend in another terminal:

```bash
cd frontend
npm run dev
```

The Vite development server prints the frontend URL, usually `http://localhost:5173`. The backend health check is available at `http://localhost:5000/`.

## Tests and Quality Checks

Backend:

```bash
cd backend
npm test
npm run test:coverage
```

Frontend:

```bash
cd frontend
npm test
npm run test:coverage
npm run lint
npm run build
```

## API Endpoints

The API prefix is `/api/v1`.

| Method | Endpoint | Authentication | Description |
| --- | --- | --- | --- |
| `POST` | `/auth/register` | No | Register a user |
| `POST` | `/auth/login` | No | Log in and receive a token |
| `GET` | `/auth/me` | Bearer token | Get the current user's profile |
| `POST` | `/notes` | Bearer token | Create a note |
| `GET` | `/notes` | Bearer token | List the user's notes |
| `GET` | `/notes/:id` | Bearer token | Get one note |
| `PUT` | `/notes/:id` | Bearer token | Update a note |
| `DELETE` | `/notes/:id` | Bearer token | Delete a note |

Health check:

```text
GET /
```
![alt text](<Screenshot 2026-08-27 205609.png>)

![alt text](<Screenshot 2026-08-27 205436.png>)

