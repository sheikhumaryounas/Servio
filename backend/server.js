import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

// Import routes & handlers
import authRoutes from './routes/auth.js';
import providerRoutes from './routes/providers.js';
import requestRoutes from './routes/requests.js';
import { socketHandler } from './socket/socketHandler.js';
import connectMongo from './config/mongo.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);

const JWT_SECRET = process.env.JWT_SECRET || 'abhi_kaun_free_hai_secret_key_123';

// Setup Socket.io with permissive CORS for development
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Enforce JWT handshake authentication for socket connections
io.use((socket, next) => {
  const token = socket.handshake.auth?.token;
  if (!token) {
    console.log(`[Socket] Connection rejected: No auth token provided for socket ${socket.id}`);
    return next(new Error('Authentication error: Token required'));
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.user = decoded; // Attach user claims { userId, role } to the socket object
    next();
  } catch (err) {
    console.log(`[Socket] Connection rejected: Invalid auth token for socket ${socket.id}`);
    next(new Error('Authentication error: Invalid token'));
  }
});

// Middlewares
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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
  res.json({ message: 'Servio API is running' });
});

// Socket Connection handling
socketHandler(io);

const DEFAULT_PORT = parseInt(process.env.PORT, 10) || 5000;
const MAX_PORT = DEFAULT_PORT + 10;

const listenOnPort = (port) => {
  return new Promise((resolve, reject) => {
    const onError = (err) => {
      cleanup();
      reject(err);
    };
    const onListening = () => {
      cleanup();
      resolve(port);
    };

    const cleanup = () => {
      httpServer.off('error', onError);
      httpServer.off('listening', onListening);
    };

    httpServer.once('error', onError);
    httpServer.once('listening', onListening);
    httpServer.listen(port);
  });
};

const start = async () => {
  if (process.env.DB_URI) {
    try {
      await connectMongo(process.env.DB_URI);
    } catch (err) {
      console.error('Failed to connect to MongoDB, continuing with file DB', err);
    }
  }

  let currentPort = DEFAULT_PORT;
  while (currentPort <= MAX_PORT) {
    try {
      const port = await listenOnPort(currentPort);
      console.log(`========================================`);
      console.log(`🚀 Server running on http://localhost:${port}`);
      console.log(`🔌 Socket.io server initialized and listening`);
      console.log(`========================================`);
      return;
    } catch (err) {
      if (err.code === 'EADDRINUSE') {
        console.warn(`Port ${currentPort} is already in use, trying port ${currentPort + 1}...`);
        currentPort += 1;
      } else {
        console.error('Server failed to start:', err);
        process.exit(1);
      }
    }
  }

  console.error(`Unable to bind to ports ${DEFAULT_PORT}-${MAX_PORT}. Please stop the process using port ${DEFAULT_PORT} or set a different PORT.`);
  process.exit(1);
};

start();
