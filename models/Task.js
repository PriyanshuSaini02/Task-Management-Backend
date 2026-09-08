const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    taskId: { type: Number, unique: true },
    title: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['Todo', 'In Progress', 'Review', 'Done'],
      default: 'Todo',
    },
    assignedMembers: [{ type: String }],
    dueDate: { type: Date },
    dueTime: { type: String, default: '09:00' },
    isAssigned: { type: Boolean, default: false },
    estimatedHours: { type: Number, min: 0, default: 0 },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'Medium',
    },
    order: { type: Number, default: 0 },
    createdOn: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

taskSchema.pre('save', async function () {
  if (!this.taskId) {
    const lastTask = await this.constructor.findOne().sort({ taskId: -1 });
    this.taskId = lastTask ? lastTask.taskId + 1 : 1;
  }
  if (!this.order) {
    const maxOrder = await this.constructor.findOne().sort({ order: -1 });
    this.order = maxOrder ? maxOrder.order + 1 : 1;
  }
});

module.exports = mongoose.model('Task', taskSchema);
