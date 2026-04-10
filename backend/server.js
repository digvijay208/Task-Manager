const express = require('express');
const cors = require('cors');

const app = express();
const PORT = Number(process.env.PORT) || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// In-memory task storage
let tasks = [
  { id: '1', title: 'Welcome to Task Manager', completed: false, createdAt: new Date().toISOString() },
  { id: '2', title: 'Click checkbox to complete', completed: true, createdAt: new Date().toISOString() },
  { id: '3', title: 'Delete tasks you no longer need', completed: false, createdAt: new Date().toISOString() }
];

let nextId = 4;

// GET /tasks - Return all tasks
app.get('/tasks', (req, res) => {
  const { filter } = req.query;

  let filteredTasks = [...tasks];

  if (filter === 'completed') {
    filteredTasks = filteredTasks.filter(task => task.completed);
  } else if (filter === 'incomplete') {
    filteredTasks = filteredTasks.filter(task => !task.completed);
  }

  // Sort by creation date (newest first)
  filteredTasks.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  res.json(filteredTasks);
});

// POST /tasks - Create a new task
app.post('/tasks', (req, res) => {
  const { title } = req.body;

  // Basic validation
  if (!title || typeof title !== 'string') {
    return res.status(400).json({ error: 'Title is required and must be a string' });
  }

  const trimmedTitle = title.trim();

  if (trimmedTitle.length === 0) {
    return res.status(400).json({ error: 'Title cannot be empty' });
  }

  if (trimmedTitle.length > 200) {
    return res.status(400).json({ error: 'Title must be 200 characters or less' });
  }

  const newTask = {
    id: String(nextId++),
    title: trimmedTitle,
    completed: false,
    createdAt: new Date().toISOString()
  };

  tasks.push(newTask);
  res.status(201).json(newTask);
});

// PATCH /tasks/:id - Update a task
app.patch('/tasks/:id', (req, res) => {
  const { id } = req.params;
  const { title, completed } = req.body;

  const taskIndex = tasks.findIndex(task => task.id === id);

  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  const task = tasks[taskIndex];

  // Update fields if provided
  if (title !== undefined) {
    if (typeof title !== 'string') {
      return res.status(400).json({ error: 'Title must be a string' });
    }

    const trimmedTitle = title.trim();

    if (trimmedTitle.length === 0) {
      return res.status(400).json({ error: 'Title cannot be empty' });
    }

    if (trimmedTitle.length > 200) {
      return res.status(400).json({ error: 'Title must be 200 characters or less' });
    }

    task.title = trimmedTitle;
  }

  if (completed !== undefined) {
    if (typeof completed !== 'boolean') {
      return res.status(400).json({ error: 'Completed must be a boolean' });
    }
    task.completed = completed;
  }

  res.json(task);
});

// DELETE /tasks/:id - Delete a task
app.delete('/tasks/:id', (req, res) => {
  const { id } = req.params;

  const taskIndex = tasks.findIndex(task => task.id === id);

  if (taskIndex === -1) {
    return res.status(404).json({ error: 'Task not found' });
  }

  tasks.splice(taskIndex, 1);
  res.status(204).send();
});

app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
