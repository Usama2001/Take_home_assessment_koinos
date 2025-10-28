# Setup Guide



## Installation

### 1. Install Node.js 18

```bash
nvm install 18
nvm use 18
```

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

## Running the Application

### Development Mode

**Terminal 1 - Backend Server:**
```bash
cd backend
npm start
```

The backend server will run on `http://localhost:3001`

**Terminal 2 - Frontend Server:**
```bash
cd frontend
npm start
```

The frontend server will run on `http://localhost:3000` and automatically open in your browser.

### Testing

**Run Backend Tests:**
```bash
cd backend
npm test
```

**Run Frontend Tests:**
```bash
cd frontend
npm test
```

**Run Tests with Coverage:**
```bash
# Backend
cd backend
npm test -- --coverage

# Frontend
cd frontend
npm test -- --coverage
```

## Project Structure

```
Take Home Assessment/
├── backend/              # Node.js/Express API
│   ├── src/
│   │   ├── routes/      # API route handlers
│   │   └── services/    # Business logic
│   ├── data/           # JSON data files
│   ├── server.js       # Express app entry point
│   └── package.json
├── frontend/            # React application
│   ├── src/
│   │   ├── components/ # React components
│   │   └── App.js      # Root component
│   └── package.json
├── README.md           # Project overview
├── SOLUTION.md         # Solution documentation
└── SETUP.md           # This file
```

## API Endpoints

### GET /api/items
Returns paginated list of items.

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `q` (optional): Search query string

**Example:**
```
GET /api/items?page=1&limit=10&q=laptop
```

### GET /api/items/:id
Returns a single item by ID.

**Example:**
```
GET /api/items/1
```

### GET /api/stats
Returns statistics about all items.

**Example:**
```
GET /api/stats
```

### GET /health
Health check endpoint.

**Example:**
```
GET /health
```

## Features Implemented

### Backend
- ✅ Async I/O operations (no blocking)
- ✅ In-memory caching with file watcher
- ✅ Server-side search functionality
- ✅ Pagination support
- ✅ Comprehensive test coverage

### Frontend
- ✅ Memory leak prevention
- ✅ Virtualized list rendering
- ✅ Debounced search
- ✅ Pagination controls
- ✅ Loading skeletons
- ✅ Error handling with retry
- ✅ Responsive design
- ✅ Accessibility features

## Troubleshooting

### Port Already in Use

If port 3000 or 3001 is already in use:

**Backend:**
```bash
PORT=3002 npm start
```

**Frontend:**
Create a `.env` file in the frontend directory:
```
PORT=3002
```

### Module Not Found

If you encounter module not found errors:
```bash
rm -rf node_modules package-lock.json
npm install
```

### Tests Not Running

Make sure you're in the correct directory and dependencies are installed:
```bash
cd backend  # or cd frontend
npm install
npm test
```

## Production Build

### Frontend
```bash
cd frontend
npm run build
```

The optimized build will be in the `build/` directory.

### Backend
```bash
cd backend
# Ensure NODE_ENV is set
NODE_ENV=production npm start
```

## Additional Resources

- [Solution Documentation](./SOLUTION.md) - Detailed explanation of all improvements
- [README](./README.md) - Project overview and requirements

