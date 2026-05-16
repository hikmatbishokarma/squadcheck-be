# SquadCheck Backend

> **"Never train alone again."** — Real-time gym consistency and accountability platform.

NestJS REST API + Socket.IO server. Handles auth, real-time presence, AI squad formation, and session tracking.

## Quick Start

```bash
git clone <repo-url> squadcheck-backend
cd squadcheck-backend
npm install

cp .env.example .env
# Edit .env — set MONGO_URI, JWT_SECRET, GEMINI_API_KEY

npm run seed          # seed 5 sample gyms
npm run start:dev     # http://localhost:3001
```

## Environment

| Variable | Description |
|----------|-------------|
| `MONGO_URI` | MongoDB URI (e.g. `mongodb://localhost:27017/squadcheck`) |
| `JWT_SECRET` | Secret for JWT signing — change in production |
| `GEMINI_API_KEY` | Get one free at https://aistudio.google.com/apikey |
| `FRONTEND_URL` | CORS origin (default: `http://localhost:3000`) |
| `PORT` | Server port (default: `3001`) |

## API Overview

| Route | Description |
|-------|-------------|
| `POST /auth/linkedin` | Exchange LinkedIn profile for backend JWT |
| `GET /users/me` | Get own profile |
| `PATCH /users/me/onboarding` | Complete onboarding |
| `GET /gyms` | List all gyms |
| `POST /lobby/join` | Check into gym lobby |
| `POST /lobby/leave` | Leave gym lobby |
| `GET /squads/:gymId/suggested` | Get AI-suggested squads |
| `POST /squads` | Form a new squad |
| `GET /health` | Health check |

## Tech Stack

| | |
|---|---|
| Framework | NestJS 10 |
| Database | MongoDB + Mongoose |
| Real-time | Socket.IO (`/lobby` namespace) |
| Auth | JWT (`@nestjs/jwt`) |
| AI | Google Gemini 1.5 Flash |
| Validation | class-validator |

## WebSocket Quick Reference

```js
import { io } from 'socket.io-client';

const socket = io('http://localhost:3001/lobby', {
  auth: { token: 'your-backend-jwt' }
});

socket.emit('lobby:join', { gymId: '...' });
socket.on('lobby:active_users', ({ users }) => console.log(users));
socket.on('squad:formed', (squad) => console.log('New squad!', squad));
```
