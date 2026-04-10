import { useEffect, useMemo, useState } from 'react';

const API_BASE = 'http://localhost:3001';

const FILTERS = [
  { key: 'all', label: 'All Tasks' },
  { key: 'incomplete', label: 'Active' },
  { key: 'completed', label: 'Completed' },
];

function App() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [title, setTitle] = useState('');
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [editTitle, setEditTitle] = useState('');

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [formError, setFormError] = useState('');

  const [actionPending, setActionPending] = useState({});

  const taskCountLabel = useMemo(() => {
    const remaining = tasks.filter((task) => !task.completed).length;
    const suffix = remaining === 1 ? 'task' : 'tasks';
    return `${remaining} ${suffix} left`;
  }, [tasks]);

  useEffect(() => {
    fetchTasks(filter);
  }, [filter]);

  async function fetchTasks(selectedFilter) {
    setIsLoading(true);
    setError('');

    try {
      const query = selectedFilter === 'all' ? '' : `?filter=${selectedFilter}`;
      const response = await fetch(`${API_BASE}/tasks${query}`);

      if (!response.ok) {
        throw new Error('Unable to load tasks.');
      }

      const data = await response.json();
      setTasks(data);
    } catch (loadError) {
      setError(loadError.message || 'Something went wrong while loading tasks.');
    } finally {
      setIsLoading(false);
    }
  }

  function validateTitle(value) {
    const trimmed = value.trim();

    if (!trimmed) {
      return 'Task title cannot be empty.';
    }

    if (trimmed.length > 200) {
      return 'Task title must be 200 characters or less.';
    }

    return '';
  }

  async function handleCreateTask(event) {
    event.preventDefault();
    const validationError = validateTitle(title);

    if (validationError) {
      setFormError(validationError);
      return;
    }

    setFormError('');
    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: title.trim() }),
      });

      if (!response.ok) {
        const message = await response.json();
        throw new Error(message.error || 'Unable to create task.');
      }

      setTitle('');
      await fetchTasks(filter);
    } catch (createError) {
      setFormError(createError.message || 'Failed to add task.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleToggleTask(task) {
    setActionPending((prev) => ({ ...prev, [task.id]: true }));

    try {
      const response = await fetch(`${API_BASE}/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !task.completed }),
      });

      if (!response.ok) {
        const message = await response.json();
        throw new Error(message.error || 'Unable to update task.');
      }

      await fetchTasks(filter);
    } catch (toggleError) {
      setError(toggleError.message || 'Failed to update task status.');
    } finally {
      setActionPending((prev) => ({ ...prev, [task.id]: false }));
    }
  }

  async function handleDeleteTask(taskId) {
    setActionPending((prev) => ({ ...prev, [taskId]: true }));

    try {
      const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const message = await response.json();
        throw new Error(message.error || 'Unable to delete task.');
      }

      if (editingTaskId === taskId) {
        setEditingTaskId(null);
        setEditTitle('');
      }

      await fetchTasks(filter);
    } catch (deleteError) {
      setError(deleteError.message || 'Failed to delete task.');
    } finally {
      setActionPending((prev) => ({ ...prev, [taskId]: false }));
    }
  }

  function startEditing(task) {
    setEditingTaskId(task.id);
    setEditTitle(task.title);
    setError('');
  }

  function cancelEditing() {
    setEditingTaskId(null);
    setEditTitle('');
  }

  async function saveEdit(taskId) {
    const validationError = validateTitle(editTitle);

    if (validationError) {
      setError(validationError);
      return;
    }

    setActionPending((prev) => ({ ...prev, [taskId]: true }));

    try {
      const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: editTitle.trim() }),
      });

      if (!response.ok) {
        const message = await response.json();
        throw new Error(message.error || 'Unable to edit task.');
      }

      cancelEditing();
      await fetchTasks(filter);
    } catch (editError) {
      setError(editError.message || 'Failed to edit task.');
    } finally {
      setActionPending((prev) => ({ ...prev, [taskId]: false }));
    }
  }

  return (
    <div className="app-shell">
      <div className="ambient-glow ambient-left" aria-hidden="true" />
      <div className="ambient-glow ambient-right" aria-hidden="true" />

      <main className="task-panel">
        <header className="header-area">
          <p className="eyebrow">Task Manager</p>
          <h1>Stay focused. Finish what matters.</h1>
          <p className="subtitle">
            Capture tasks quickly, manage status with confidence, and keep your day clear.
          </p>
        </header>

        <form className="task-form" onSubmit={handleCreateTask}>
          <label htmlFor="task-input" className="sr-only">
            Add a new task
          </label>
          <input
            id="task-input"
            type="text"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="What needs to be done?"
            maxLength={200}
            disabled={isSubmitting}
          />
          <button className="primary-btn" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Adding...' : 'Add Task'}
          </button>
        </form>

        {formError ? <p className="feedback error">{formError}</p> : null}

        <div className="toolbar">
          <div className="filter-group" role="tablist" aria-label="Filter tasks">
            {FILTERS.map((option, index) => (
              <button
                key={option.key}
                type="button"
                role="tab"
                aria-selected={filter === option.key}
                className={`filter-chip ${filter === option.key ? 'is-active' : ''}`}
                onClick={() => setFilter(option.key)}
                style={{ animationDelay: `${index * 40}ms` }}
              >
                {option.label}
              </button>
            ))}
          </div>
          <p className="counter">{taskCountLabel}</p>
        </div>

        {error ? <p className="feedback error">{error}</p> : null}

        {isLoading ? (
          <div className="loading-state" role="status" aria-live="polite">
            <span className="spinner" aria-hidden="true" />
            Loading tasks...
          </div>
        ) : null}

        {!isLoading && tasks.length === 0 ? (
          <div className="empty-state">
            <h2>Nothing here yet</h2>
            <p>Add your first task above and start building momentum.</p>
          </div>
        ) : null}

        {!isLoading && tasks.length > 0 ? (
          <ul className="task-list" aria-live="polite">
            {tasks.map((task, index) => {
              const pending = Boolean(actionPending[task.id]);

              return (
                <li
                  key={task.id}
                  className={`task-row ${task.completed ? 'is-complete' : ''}`}
                  style={{ animationDelay: `${index * 45}ms` }}
                >
                  <button
                    type="button"
                    className={`toggle-btn ${task.completed ? 'is-complete' : ''}`}
                    aria-label={task.completed ? `Mark ${task.title} as incomplete` : `Mark ${task.title} as complete`}
                    onClick={() => handleToggleTask(task)}
                    disabled={pending}
                  >
                    <span className="toggle-dot" />
                  </button>

                  <div className="task-content">
                    {editingTaskId === task.id ? (
                      <div className="edit-wrap">
                        <input
                          type="text"
                          value={editTitle}
                          onChange={(event) => setEditTitle(event.target.value)}
                          maxLength={200}
                          disabled={pending}
                        />
                        <div className="edit-actions">
                          <button
                            type="button"
                            className="ghost-btn"
                            onClick={() => saveEdit(task.id)}
                            disabled={pending}
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            className="ghost-btn"
                            onClick={cancelEditing}
                            disabled={pending}
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="task-title">{task.title}</p>
                        <p className="task-time">{new Date(task.createdAt).toLocaleString()}</p>
                      </>
                    )}
                  </div>

                  {editingTaskId !== task.id ? (
                    <div className="task-actions">
                      <button
                        type="button"
                        className="ghost-btn"
                        onClick={() => startEditing(task)}
                        disabled={pending}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className="ghost-btn danger"
                        onClick={() => handleDeleteTask(task.id)}
                        disabled={pending}
                      >
                        Delete
                      </button>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ul>
        ) : null}
      </main>
    </div>
  );
}

export default App;
