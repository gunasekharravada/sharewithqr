import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config/env.js';
import shareRoutes from './routes/shareRoutes.js';
import { shareController } from './controllers/shareController.js';
import { globalLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

// Security Headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// CORS Configuration
const allowedOrigin = config.clientUrl || '*';
app.use(cors({
  origin: config.nodeEnv === 'production' && config.clientUrl !== '*' ? config.clientUrl : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body Parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Global Rate Limiter for general API traffic
app.use('/api', globalLimiter);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'TempShare API',
    version: '1.1.0',
    storageDriver: config.storageDriver,
    database: config.databaseUrl ? 'postgresql' : 'sqlite'
  });
});

// Stats endpoint
app.get('/api/stats', shareController.getStats);

// Vercel Cron cleanup endpoints
app.get('/api/cleanup', shareController.handleCronCleanup);
app.post('/api/cleanup', shareController.handleCronCleanup);

// Share routes
app.use('/api/shares', shareRoutes);

// Central error handler
app.use(errorHandler);

export default app;
