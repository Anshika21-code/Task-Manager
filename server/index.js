const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
app.use(cors());
app.use(express.json());

let tasks = [];

// GET all tasks
app.get('/tasks', (req, res) => {
  res.json({ success: true, data: tasks });
});

// POST create task
app.post('/tasks', (req, res) => {
  const { title } = req.body;
  if (!title || title.trim() === '') {
    return res.status(400).json({ success: false, message: 'Title is required' });
  }
  const task = {
    id: uuidv4(),
    title: title.trim(),
    completed: false,
    createdAt: new Date().toISOString(),
  };
  tasks.push(task);
  res.status(201).json({ success: true, data: task });
});

// PATCH update task status (and optionally title)
app.patch('/tasks/:id', (req, res) => {
  const task = tasks.find(t => t.id === req.params.id);
  if (!task) return res.status(404).json({ success: false, message: 'Task not found' });

  if (typeof req.body.completed === 'boolean') task.completed = req.body.completed;
  if (req.body.title && req.body.title.trim() !== '') task.title = req.body.title.trim();

  res.json({ success: true, data: task });
});

// DELETE task
app.delete('/tasks/:id', (req, res) => {
  const index = tasks.findIndex(t => t.id === req.params.id);
  if (index === -1) return res.status(404).json({ success: false, message: 'Task not found' });

  tasks.splice(index, 1);
  res.json({ success: true, message: 'Task deleted' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));