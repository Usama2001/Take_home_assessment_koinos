# Take-Home Assessment

Welcome, candidate! This project contains intentional issues that mimic real‑world scenarios. Your task is to refactor, optimize, and fix these problems.

## Objectives

### 🔧 Backend (Node.js)

**Refactor blocking I/O**
- `src/routes/items.js` uses `fs.readFileSync`. Replace with non‑blocking async operations.

**Performance**
- GET `/api/stats` recalculates stats on every request. Cache results, watch file changes, or introduce a smarter strategy.

**Testing**
- Add unit tests (Jest) for items routes (happy path + error cases).

### 💻 Frontend (React)

**Memory Leak**
- `Items.js` leaks memory if the component unmounts before fetch completes. Fix it.

**Pagination & Search**
- Implement paginated list with server‑side search (`q` param). Contribute to both client and server〈

**Performance**
- The list can grow large. Integrate virtualization (e.g., `react-window`) to keep UI smooth.

**UI/UX Polish**
- Feel free to enhance styling, accessibility, and add loading/skeleton states.

## 📦 What We Expect

- Idiomatic, clean code with comments where necessary.
- Tests that pass via `npm test` in both frontend and backend.
- A brief `SOLUTION.md` describing your approach and trade‑offs.

## Quick Start

```bash
# Required Node version: 18.XX
nvm install 18
nvm use 18

# Terminal 1 - Backend
cd backend
npm install
npm start

# Terminal 2 - Frontend
cd frontend
npm install
npm start
```

The frontend proxies `/api` requests to `http://localhost:3001`.

