require('dotenv').config();
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Task = require('./models/Task');

const dbPath = path.join(__dirname, 'db.json');
const data = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

async function seed() {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/taskmanagement'
    );
    console.log('Connected to MongoDB');

    await Task.deleteMany({});
    console.log('Cleared existing tasks');

    const tasks = data.tasks.map((task) => ({
      taskId: task.id,
      title: task.title,
      status: task.status,
      assignedMembers: task.assignedMembers,
      dueDate: task.dueDate ? new Date(task.dueDate) : null,
      dueTime: task.dueTime || '09:00',
      isAssigned: task.isAssigned,
      estimatedHours: task.estimatedHours,
      priority: task.priority,
      order: task.order,
      createdOn: task.createdOn ? new Date(task.createdOn) : new Date(),
    }));

    await Task.insertMany(tasks);
    console.log(`Seeded ${tasks.length} tasks from db.json`);
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error.message);
    process.exit(1);
  }
}

seed();
