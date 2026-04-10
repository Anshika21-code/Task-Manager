import { useState, useEffect } from 'react';
import './App.css';

const API = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function App() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // all | active | completed
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

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

  return (
    <div className="container">
      <h1>Task Manager</h1>

      <form onSubmit={addTask} className="add-form">
        <input
          value={title}
          onChange={e => setTitle(e.target.value)}
          placeholder="Add a new task..."
        />
        <button type="submit">Add</button>
      </form>

      {error && <p className="error">{error}</p>}

      <div className="filters">
        {['all', 'active', 'completed'].map(f => (
          <button key={f} onClick={() => setFilter(f)} className={filter === f ? 'active' : ''}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
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
                  <button onClick={() => saveEdit(task.id)}>Save</button>
                  <button onClick={() => setEditingId(null)}>Cancel</button>
                </>
              ) : (
                <>
                  <span className="task-title">{task.title}</span>
                  <button onClick={() => { setEditingId(task.id); setEditTitle(task.title); }}>Edit</button>
                  <button className="delete" onClick={() => deleteTask(task.id)}>Delete</button>
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