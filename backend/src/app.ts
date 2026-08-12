import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import apiRouter from './routes/api.js';
import { errorHandler } from './middleware/error.js';
import { checkAndSendNotifications } from './services/scheduler.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';

// Security Headers Setup
app.use(helmet());

// CORS configuration - allow request ONLY from configured frontend client
app.use(cors({
  origin: frontendUrl,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Request parsers with size limit validation to prevent buffer exploits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Rate Limiting to prevent denial-of-service / brute-force attacks
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' }
});
app.use('/api/', apiLimiter);

// Mount API routes
app.use('/api', apiRouter);

// Basic health check route
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Global error handler
app.use(errorHandler);

// Start Background Reminder Cron (Runs every 15 minutes)
const REMINDER_INTERVAL = 15 * 60 * 1000; // 15 minutes in milliseconds
setInterval(async () => {
  try {
    await checkAndSendNotifications();
  } catch (err) {
    console.error('[App] Background scheduler task failed:', err);
  }
}, REMINDER_INTERVAL);

// Run notification check immediately on startup
checkAndSendNotifications().catch((err) => {
  console.error('[App] Initial notification check failed:', err);
});

// Listen on configured port
app.listen(PORT, () => {
  console.log(`[Server] Trackathon API server running on port ${PORT}`);
  console.log(`[Server] Allowed CORS Origin: ${frontendUrl}`);
});
