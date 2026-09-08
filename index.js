require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const taskRoutes = require('./routes/taskRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/api/tasks', taskRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', message: 'Task Management API is running' });
});

mongoose
  .connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/taskmanagement')
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Express server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
