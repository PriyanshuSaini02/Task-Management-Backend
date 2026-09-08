const express = require('express');
const Task = require('../models/Task');

const router = express.Router();

const pickTaskFields = (body) => ({
  title: body.title,
  status: body.status,
  assignedMembers: body.assignedMembers,
  dueDate: body.dueDate || null,
  dueTime: body.dueTime,
  isAssigned: body.isAssigned,
  estimatedHours: body.estimatedHours,
  priority: body.priority,
});

router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 5,
      status,
      priority,
      isAssigned,
      search,
      sortBy = 'order',
      sortOrder = 'asc',
    } = req.query;

    const filter = {};

    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (isAssigned !== undefined && isAssigned !== '') {
      filter.isAssigned = isAssigned === 'true';
    }
    if (search) {
      filter.title = { $regex: search, $options: 'i' };
    }

    const skip = (Number(page) - 1) * Number(limit);
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [tasks, total] = await Promise.all([
      Task.find(filter).sort(sort).skip(skip).limit(Number(limit)),
      Task.countDocuments(filter),
    ]);

    res.json({
      tasks,
      total,
      page: Number(page),
      totalPages: Math.ceil(total / Number(limit)),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/reorder', async (req, res) => {
  try {
    const { orderedIds } = req.body;
    if (!Array.isArray(orderedIds)) {
      return res.status(400).json({ message: 'orderedIds must be an array' });
    }

    const updates = orderedIds.map((id, index) =>
      Task.findByIdAndUpdate(id, { order: index + 1 }, { new: true })
    );

    const tasks = await Promise.all(updates);
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const task = new Task(pickTaskFields(req.body));
    await task.save();
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(req.params.id, pickTaskFields(req.body), {
      new: true,
      runValidators: true,
    });
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
