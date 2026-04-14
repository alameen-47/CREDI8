import dotenv from 'dotenv';
import express from 'express';
import mongoose from 'mongoose';
import connectDB from './config/db.js';
import {validateEnv} from './config/validateEnv.js';
import {isMockMode} from './config/appMode.js';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import cron from 'node-cron';
import logger from './utils/logger.js';
import authRoutes from './routes/authRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import saasRoutes from './routes/saasRoutes.js';
import {handleRazorpayWebhook} from './controllers/billingController.js';
import {apiLimiter, authLimiter} from './middlewares/rateLimiter.js';
import {errorHandler, notFoundHandler} from './middlewares/errorHandler.js';
import {processDueScheduledCalls} from './controllers/callsController.js';

import path from 'path';
import {fileURLToPath} from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({path: path.resolve(__dirname, '.env')});
validateEnv();
connectDB();

const app = express();

// ── Trust proxy (needed behind nginx / ALB for correct IP in rate-limiter) ──
if (process.env.TRUST_PROXY === '1') {
  app.set('trust proxy', 1);
}

// ── Security headers ─────────────────────────────────────────────────────────
app.use(helmet());

// ── CORS ─────────────────────────────────────────────────────────────────────
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',').map(o => o.trim()).filter(Boolean)
  : null;

app.use(
  cors({
    origin: (origin, cb) => {
      // Allow non-browser clients (React Native, Postman, cURL) which send no Origin
      if (!origin) return cb(null, true);
      // In dev or when no allowlist is set → allow everything
      if (!allowedOrigins || process.env.NODE_ENV !== 'production') {
        return cb(null, true);
      }
      if (allowedOrigins.includes(origin)) return cb(null, true);
      cb(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  }),
);

// ── Razorpay webhook: must receive raw body BEFORE json middleware ────────────
app.post(
  '/api/v1/billing/webhook',
  express.raw({type: 'application/json'}),
  handleRazorpayWebhook,
);

// ── Body parsing ─────────────────────────────────────────────────────────────
app.use(express.json({limit: '1mb'}));
app.use(express.urlencoded({extended: true}));

// ── HTTP request logging ─────────────────────────────────────────────────────
app.use(
  morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev', {
    stream: logger.stream,
  }),
);

// ── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  const dbState = mongoose.connection.readyState;
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const dbOk = dbState === 1;
  const status = dbOk ? 200 : 503;
  res.status(status).json({
    ok: dbOk,
    service: 'cred8-api',
    mockMode: isMockMode(),
    env: process.env.NODE_ENV || 'development',
    db: ['disconnected', 'connected', 'connecting', 'disconnecting'][dbState] ?? 'unknown',
    ts: new Date().toISOString(),
  });
});

app.get('/', (_req, res) => {
  res.json({name: 'CREDI8 API', version: '1'});
});

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/customer', apiLimiter, customerRoutes);
app.use('/api/v1', apiLimiter, saasRoutes);

// ── 404 + centralised error handler ──────────────────────────────────────────
app.use(notFoundHandler);
app.use(errorHandler);

// ── Scheduled calls worker (every minute) ────────────────────────────────────
cron.schedule('* * * * *', () => {
  processDueScheduledCalls().catch(err =>
    logger.error('Scheduled calls worker failed', {err: err.message}),
  );
});

// ── Start server ──────────────────────────────────────────────────────────────
const PORT = Number(process.env.PORT || 8086);
const server = app.listen(PORT, () => {
  logger.info(`CREDI8 API listening on port ${PORT}`, {
    env: process.env.NODE_ENV || 'development',
    mockMode: isMockMode(),
  });
});

// ── Graceful shutdown ─────────────────────────────────────────────────────────
async function shutdown(signal) {
  logger.info(`${signal} received — shutting down gracefully`);
  server.close(async () => {
    try {
      await mongoose.connection.close();
      logger.info('MongoDB connection closed');
    } catch (e) {
      logger.error('Error closing MongoDB', {err: e.message});
    }
    process.exit(0);
  });

  // Force exit after 10 s if something hangs
  setTimeout(() => {
    logger.error('Forced exit after 10 s timeout');
    process.exit(1);
  }, 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('uncaughtException', err => {
  logger.error('Uncaught exception', {err: err.message, stack: err.stack});
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection', {
    err: reason instanceof Error ? reason.message : String(reason),
  });
  process.exit(1);
});
