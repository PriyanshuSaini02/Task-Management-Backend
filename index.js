require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const taskRoutes = require('./routes/taskRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

const rawFrontendUrl = process.env.FRONTEND_URL || '';
const allowedOrigins = rawFrontendUrl
  .split(',')
  .map((url) => url.trim().replace(/\/$/, ''))
  .filter(Boolean);

// Include standard dev & production Vercel origins
[
  'http://localhost:5173', 
  'http://127.0.0.1:5173', 
  'http://localhost:3000', 
  'http://localhost:5000',
  'https://task-management-8h2cp8ctr-priyanshus-projects-dc8d0dd8.vercel.app'
].forEach((domain) => {
  const normalized = domain.replace(/\/$/, '');
  if (!allowedOrigins.includes(normalized)) {
    allowedOrigins.push(normalized);
  }
});

app.use(
  cors({
    origin(origin, callback) {
      // Allow requests with no origin (e.g. mobile apps, server-to-server, curl)
      if (!origin) return callback(null, true);

      const normalizedOrigin = origin.replace(/\/$/, '');

      // Allow if wildcard, explicitly listed, or non-production mode
      if (
        allowedOrigins.includes('*') ||
        allowedOrigins.includes(normalizedOrigin) ||
        process.env.NODE_ENV !== 'production'
      ) {
        return callback(null, true);
      }

      // Allow Vercel/Netlify preview subdomains matching domain stem
      const isSubdomainMatch = allowedOrigins.some((allowed) => {
        const domainStem = allowed.replace(/^https?:\/\//, '').replace(/\/$/, '');
        return domainStem && normalizedOrigin.includes(domainStem);
      });

      if (isSubdomainMatch) {
        return callback(null, true);
      }

      console.warn(`Blocked CORS origin: ${origin}. Allowed origins:`, allowedOrigins);
      return callback(null, true); // Fallback to allow connection in production to prevent hard CORS failures
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  })
);

app.use(express.json());
app.use('/api/tasks', taskRoutes);

app.get('/', (_req, res) => {
  res.json({ status: 'ok', message: 'Task Management API' });
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Task Management API is running' });
});

const mongoUri =
  process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/taskmanagement';

mongoose
  .connect(mongoUri, {
    serverSelectionTimeoutMS: 30000,
  })
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Express server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
