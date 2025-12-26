import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import contentRoutes from './routes/content.routes';
const app: Express = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true
}));

// Debug middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`📨 ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/content', contentRoutes); 
// Health check
app.get('/health', (req: Request, res: Response) => {
  console.log('✅ Health check called');
  res.json({ status: 'OK', message: 'Server is running' });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('❌ Error:', err);
  res.status(err.status || 500).json({ 
    message: err.message || 'Internal server error'
  });
});

export default app;
