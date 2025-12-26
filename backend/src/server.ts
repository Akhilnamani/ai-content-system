import dotenv from 'dotenv';
import app from './app';
import { connectDB } from './config/database';

dotenv.config();

const PORT = process.env.PORT || 3001;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📝 API: http://localhost:${PORT}/api/v1`);
      console.log(`💻 Frontend: http://localhost:5173`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
