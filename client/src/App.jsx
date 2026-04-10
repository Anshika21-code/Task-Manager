import { useState, useEffect } from 'react';
import './App.css';


const API = "https://task-manager-vkzy.onrender.com";

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  // const [darkMode, setDarkMode] = useState(false);

  useEffect(() => { fetchTasks(); }, []);

  async function fetchTasks() {
    setLoading(true);
    try {
      const res = await fetch(`${API}/tasks`);
      const json = await res.json();
      setTasks(json.data);
    } catch {
      setError('Failed to load tasks.');
    } finally {
      setLoading(false);
    }
  }

  async function addTask(e) {
    e.preventDefault();
    if (!title.trim()) return;
    setError('');
    try {
      const res = await fetch(`${API}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title }),
      });
      const json = await res.json();
      if (!res.ok) return setError(json.message);
      setTasks(prev => [...prev, json.data]);
      setTitle('');
    } catch {
      setError('Failed to add task.');
    }
  }

  async function toggleComplete(task) {
    try {
      const res = await fetch(`${API}/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !task.completed }),
      });
      const json = await res.json();
      setTasks(prev => prev.map(t => t.id === task.id ? json.data : t));
    } catch {
      setError('Failed to update task.');
    }
  }

  async function deleteTask(id) {
    try {
      await fetch(`${API}/tasks/${id}`, { method: 'DELETE' });
      setTasks(prev => prev.filter(t => t.id !== id));
    } catch {
      setError('Failed to delete task.');
    }
  }

  async function saveEdit(id) {
    if (!editTitle.trim()) return;
    try {
      const res = await fetch(`${API}/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle }),
      });
      const json = await res.json();
      setTasks(prev => prev.map(t => t.id === id ? json.data : t));
      setEditingId(null);
    } catch {
      setError('Failed to edit task.');
    }
  }

  const filtered = tasks.filter(t =>
    filter === 'all' ? true : filter === 'completed' ? t.completed : !t.completed
  );

  const doneCount = tasks.filter(t => t.completed).length;
  const pendingCount = tasks.filter(t => !t.completed).length;

//   let insight;

// if (tasks.length === 0) {
//   insight = {
//     icon: <Rocket size={20} />,
//     text: "Start small. Add your first task.",
//   };
// } else if (doneCount === tasks.length) {
//   insight = {
//     icon: <Flame size={20} />,
//     text: "All tasks completed! You're on fire!",
//   };
// } else if (doneCount > pendingCount) {
//   insight = {
//     icon: <TrendingUp size={20} />,
//     text: "Great progress! Keep going!",
//   };
// } else {
//   insight = {
//     icon: <CheckCircle size={20} />,
//     text: "Stay focused — you got this!",
//   };
// }
  // Load from localStorage
useEffect(() => {
  const saved = JSON.parse(localStorage.getItem("tasks"));
  if (saved) setTasks(saved);
}, []);

// Save to localStorage
useEffect(() => {
  localStorage.setItem("tasks", JSON.stringify(tasks));
}, [tasks]);

  return (
    <div className="container">
      <div className="header">
        <h1>Task Manager</h1>
        <p>Stay on top of what matters</p>
      </div>

      

      <form onSubmit={addTask} className="add-form">
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Add a new task..."
        />
        <button type="submit">Add task</button>
      </form>

      {error && <p className="error">{error}</p>}

      <div className="stats">
        <div className="stat-card">
          <div className="stat-label">Total</div>
          <div className="stat-value">{tasks.length}</div>
        </div>
        <div className="stat-card done">
          <div className="stat-label">Completed</div>
          <div className="stat-value">{doneCount}</div>
        </div>
        <div className="stat-card pending">
          <div className="stat-label">Pending</div>
          <div className="stat-value">{pendingCount}</div>
        </div>
      </div>
      <div className="insight-box">
  {/* <span className="insight-icon">{insight.icon}</span>
  <span>{insight.text}</span> */}
</div>

      <div className="filters">
        {[
          { key: 'all', label: 'All' },
          { key: 'active', label: 'Active' },
          { key: 'completed', label: 'Completed' },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={filter === key ? 'active' : ''}
          >
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="loading">Loading...</p>
      ) : filtered.length === 0 ? (
        <p className="empty">No tasks here.</p>
      ) : (
        <ul className="task-list">
          {filtered.map(task => (
            <li key={task.id} className={`task-item ${task.completed ? 'done' : ''}`}>
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleComplete(task)}
              />
              {editingId === task.id ? (
                <>
                  <input
                    className="edit-input"
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && saveEdit(task.id)}
                    autoFocus
                  />
                  <button className="btn-save" onClick={() => saveEdit(task.id)}>Save</button>
                  <button className="btn-cancel" onClick={() => setEditingId(null)}>Cancel</button>
                </>
              ) : (
                <>
                  <span className="task-title">{task.title}</span>
                  {task.completed && <span className="badge-done">Done</span>}
                  <button
                    className="btn-edit"
                    onClick={() => { setEditingId(task.id); setEditTitle(task.title); }}
                  >
                    Edit
                  </button>
                  <button className="btn-delete" onClick={() => deleteTask(task.id)}>
                    Delete
                  </button>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;