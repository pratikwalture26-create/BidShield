import express from 'express';
import dotenv from 'dotenv';
import { apiRouter } from '../server/routes/api.js';

dotenv.config();

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get(['/api/health', '/health'], (_req, res) => {
  res.json({
    status: 'healthy',
    platform: 'BidShield',
    mode: 'Vercel Serverless Function',
    timestamp: new Date().toISOString(),
  });
});

// Support both /api/... and direct routing from Vercel rewrites
app.use('/api', apiRouter);
app.use('/', apiRouter);

export default app;
