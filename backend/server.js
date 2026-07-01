import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';

// Import routes & handlers
import authRoutes from './routes/auth.js';
import providerRoutes from './routes/providers.js';
import requestRoutes from './routes/requests.js';
import { socketHandler } from './socket/socketHandler.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

// Setup Socket.io with permissive CORS for development
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middlewares
app.use(cors());
app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// REST Routes
app.use('/api/auth', authRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/requests', requestRoutes);

// Base Route
app.get('/', (req, res) => {
  res.json({ message: 'Abhi Kaun Free Hai API is running' });
});

// Socket Connection handling
socketHandler(io);

const PORT = process.env.PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`========================================`);
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`🔌 Socket.io server initialized and listening`);
  console.log(`========================================`);
});
