import dotenv from 'dotenv';
import express from 'express';
import connectDB from './config/db.js';
import {validateEnv} from './config/validateEnv.js';
import {isMockMode} from './config/appMode.js';
import colors from 'colors';
import morgan from 'morgan';
import cors from 'cors';
import helmet from 'helmet';
import cron from 'node-cron';
import authRoutes from './routes/authRoutes.js';
import customerRoutes from './routes/customerRoutes.js';
import saasRoutes from './routes/saasRoutes.js';
import {handleRazorpayWebhook} from './controllers/billingController.js';
import {apiLimiter, authLimiter} from './middlewares/rateLimiter.js';
import {
  errorHandler,
  notFoundHandler,
} from './middlewares/errorHandler.js';
import {processDueScheduledCalls} from './controllers/callsController.js';

dotenv.config();
validateEnv();
connectDB();

const app = express();

if (process.env.TRUST_PROXY === '1') {
  app.set('trust proxy', 1);
}

app.use(helmet());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN?.split(',').filter(Boolean) || true,
    credentials: true,
  }),
);

app.post(
  '/api/v1/billing/webhook',
  express.raw({type: 'application/json'}),
  handleRazorpayWebhook,
);

app.use(express.json({limit: '1mb'}));
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

app.get('/health', (req, res) => {
  res.json({
    ok: true,
    service: 'cred8-api',
    mockMode: isMockMode(),
    env: process.env.NODE_ENV || 'development',
    ts: new Date().toISOString(),
  });
});

app.get('/', (req, res) => {
  res.json({name: 'CREDI8 API', version: '1'});
});

app.use('/api/v1/auth', authLimiter, authRoutes);
app.use('/api/v1/customer', apiLimiter, customerRoutes);
app.use('/api/v1', apiLimiter, saasRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

const PORT = Number(process.env.PORT || 8086);

cron.schedule('* * * * *', () => {
  processDueScheduledCalls().catch(err =>
    console.error('Scheduled calls worker:', err),
  );
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`.bgCyan.white);
});
