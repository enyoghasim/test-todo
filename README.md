# TypeScript Todo API

A simple REST API for managing todos built with Express.js and TypeScript.

## Features

- ✅ TypeScript support
- ✅ Express.js server
- ✅ Local data storage (no database)
- ✅ GET endpoint for retrieving todos
- ✅ Proper error handling
- ✅ Health check endpoint

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm

### Installation

1. Clone or download the project
2. Install dependencies:
   ```bash
   npm install
   ```

### Scripts

- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start the production server
- `npm run dev` - Start the development server with hot reload

### Usage

1. Build the project:
   ```bash
   npm run build
   ```

2. Start the server:
   ```bash
   npm start
   ```

3. The server will start on `http://localhost:3000`

### API Endpoints

#### GET /todos
Returns a list of 10 sample todos.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Learn TypeScript",
      "description": "Study TypeScript fundamentals and advanced concepts",
      "completed": false,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
    // ... more todos
  ],
  "count": 10
}
```

#### GET /health
Health check endpoint to verify the API is running.

**Response:**
```json
{
  "success": true,
  "message": "Todo API is running!",
  "timestamp": "2025-06-10T15:12:19.251Z"
}
```

## Project Structure

```
typescript-todo-app/
├── src/
│   ├── app.ts          # Main Express application
│   ├── data.ts         # Mock todo data
│   └── types.ts        # TypeScript type definitions
├── dist/               # Compiled JavaScript files
├── package.json
├── tsconfig.json
└── README.md
```

## Todo Type

```typescript
interface Todo {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

## Development

For development with hot reload:
```bash
npm run dev
```

This will start the server with `nodemon` and automatically restart when you make changes to the source files.
