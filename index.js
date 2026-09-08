require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const taskRoutes = require('./routes/taskRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      console.warn(`Blocked CORS origin: ${origin}`);
      callback(null, false);
    },
    credentials: true,
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
