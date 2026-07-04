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

// Allowed origins: localhost dev + Vercel production frontend
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean);

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, Render health checks)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      return callback(null, true);
    }
    return callback(new Error(`CORS: Origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

// Setup Socket.io with permissive CORS
const io = new Server(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
        callback(null, true);
      } else {
        callback(null, true); // Allow all for sockets (JWT auth is enforced)
      }
    },
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
    socket.user = decoded;
    next();
  } catch (err) {
    console.log(`[Socket] Connection rejected: Invalid auth token for socket ${socket.id}`);
    next(new Error('Authentication error: Invalid token'));
  }
});

// Middlewares
app.use(cors(corsOptions));
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
  res.json({ message: 'Servio API is running', mongodb: 'connected' });
});

// Socket Connection handling
socketHandler(io);

// Render assigns a single PORT — no port scanning needed in production
const PORT = parseInt(process.env.PORT, 10) || 5000;

const start = async () => {
  if (!process.env.DB_URI) {
    console.error('❌ DB_URI environment variable is not set! MongoDB connection required.');
    console.error('Please set DB_URI in Render environment variables.');
    process.exit(1);
  }

  try {
    await connectMongo(process.env.DB_URI);
  } catch (err) {
    console.error('❌ Failed to connect to MongoDB:', err.message);
    process.exit(1);
  }

  httpServer.listen(PORT, '0.0.0.0', () => {
    console.log(`========================================`);
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🔌 Socket.io server initialized and listening`);
    console.log(`🌿 MongoDB connected successfully`);
    console.log(`========================================`);
  });
};

start();
