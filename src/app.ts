import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import { mockTodos } from './data';
import { Todo } from './types';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// Routes
app.get('/todos', (req: Request, res: Response) => {
  try {
    // Return all 10 todos
    const todos: Todo[] = mockTodos;
    
    res.status(200).json({
      success: true,
      data: todos,
      count: todos.length,
      environment: process.env.NODE_ENV || 'development'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error instanceof Error ? error.message : 'Unknown error',
      environment: process.env.NODE_ENV || 'development'
    });
  }
});

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: 'Todo API is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Get todos: http://localhost:${PORT}/todos`);
});

export default app;
