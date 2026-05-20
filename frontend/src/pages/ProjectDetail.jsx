import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios.js';
import Spinner from '../components/Spinner.jsx';
import Alert from '../components/Alert.jsx';
import Modal from '../components/Modal.jsx';
import ConfirmDialog from '../components/ConfirmDialog.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatDate, isOverdue, priorityBadgeClass, statusBadgeClass, STATUS_OPTIONS, PRIORITY_OPTIONS } from '../utils/format.js';

const emptyTask = {
  title: '',
  description: '',
  assignedTo: '',
  status: 'Todo',
  priority: 'Medium',
  dueDate: '',
};

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [projectModal, setProjectModal] = useState(false);
  const [projectForm, setProjectForm] = useState({ title: '', description: '' });

  const [memberEmail, setMemberEmail] = useState('');
  const [memberModal, setMemberModal] = useState(false);
  const [memberError, setMemberError] = useState('');

  const [taskModal, setTaskModal] = useState(false);
  const [taskForm, setTaskForm] = useState(emptyTask);
  const [editingTask, setEditingTask] = useState(null);
  const [taskError, setTaskError] = useState('');

  const [confirmProjectDelete, setConfirmProjectDelete] = useState(false);
  const [confirmTaskDelete, setConfirmTaskDelete] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [pRes, tRes] = await Promise.all([api.get(`/projects/${id}`), api.get(`/projects/${id}/tasks`)]);
      setProject(pRes.data.project);
      setTasks(tRes.data.tasks);
      setProjectForm({
        title: pRes.data.project.title,
        description: pRes.data.project.description || '',
      });
    } catch (e) {
      setError(e.response?.data?.message || 'Unable to load project');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const memberOptions = useMemo(() => project?.members || [], [project]);

  const openTaskModal = (task) => {
    setTaskError('');
    if (task) {
      setEditingTask(task);
      setTaskForm({
        title: task.title,
        description: task.description || '',
        assignedTo: task.assignedTo?._id || task.assignedTo,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : '',
      });
    } else {
      setEditingTask(null);
      setTaskForm({
        ...emptyTask,
        assignedTo: memberOptions[0]?._id || '',
        dueDate: new Date().toISOString().slice(0, 10),
      });
    }
    setTaskModal(true);
  };

  const saveProject = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await api.put(`/projects/${id}`, projectForm);
      setProjectModal(false);
      await loadAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update project');
    } finally {
      setActionLoading(false);
    }
  };

  const addMember = async (e) => {
    e.preventDefault();
    setMemberError('');
    setActionLoading(true);
    try {
      await api.post(`/projects/${id}/members`, { email: memberEmail });
      setMemberEmail('');
      setMemberModal(false);
      await loadAll();
    } catch (err) {
      setMemberError(err.response?.data?.message || 'Unable to add member');
    } finally {
      setActionLoading(false);
    }
  };

  const removeMember = async (userId) => {
    if (!window.confirm('Remove this member from the project?')) return;
    setActionLoading(true);
    try {
      await api.delete(`/projects/${id}/members/${userId}`);
      await loadAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to remove member');
    } finally {
      setActionLoading(false);
    }
  };

  const saveTask = async (e) => {
    e.preventDefault();
    setTaskError('');
    setActionLoading(true);
    try {
      const payload = {
        ...taskForm,
        dueDate: new Date(taskForm.dueDate).toISOString(),
      };
      if (editingTask) {
        await api.put(`/tasks/${editingTask._id}`, payload);
      } else {
        await api.post(`/projects/${id}/tasks`, payload);
      }
      setTaskModal(false);
      await loadAll();
    } catch (err) {
      setTaskError(err.response?.data?.message || 'Unable to save task');
    } finally {
      setActionLoading(false);
    }
  };

  const deleteTask = async () => {
    if (!confirmTaskDelete) return;
    setActionLoading(true);
    try {
      await api.delete(`/tasks/${confirmTaskDelete._id}`);
      setConfirmTaskDelete(null);
      await loadAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete task');
    } finally {
      setActionLoading(false);
    }
  };

  const deleteProject = async () => {
    setActionLoading(true);
    try {
      await api.delete(`/projects/${id}`);
      navigate('/projects', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to delete project');
    } finally {
      setActionLoading(false);
      setConfirmProjectDelete(false);
    }
  };

  const quickStatusChange = async (task, status) => {
    try {
      await api.put(`/tasks/${task._id}`, { status });
      await loadAll();
    } catch (err) {
      setError(err.response?.data?.message || 'Unable to update status');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center py-24">
        <Spinner label="Loading project…" />
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="space-y-4">
        <Alert type="error">{error}</Alert>
        <Link to="/projects" className="text-sm font-semibold text-brand-700">
          ← Back to projects
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <Link to="/projects" className="text-xs font-semibold text-brand-700 hover:text-brand-800">
            ← All projects
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-slate-900">{project.title}</h1>
          <p className="mt-1 max-w-2xl text-sm text-slate-600">{project.description || 'No description provided.'}</p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-500">
            <span className="rounded-full bg-slate-100 px-2 py-1 font-medium text-slate-700">
              Owner: {project.owner?.name}
            </span>
            <span className="rounded-full bg-slate-100 px-2 py-1 font-medium text-slate-700">
              Created {new Date(project.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        {isAdmin && (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setProjectModal(true)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
            >
              Edit project
            </button>
            <button
              type="button"
              onClick={() => setMemberModal(true)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-800 hover:bg-slate-50"
            >
              Add member
            </button>
            <button
              type="button"
              onClick={() => openTaskModal(null)}
              className="rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-700"
            >
              New task
            </button>
            <button
              type="button"
              onClick={() => setConfirmProjectDelete(true)}
              className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-50"
            >
              Delete project
            </button>
          </div>
        )}
      </div>

      {error && <Alert type="error">{error}</Alert>}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-slate-200 lg:col-span-1">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Team</h2>
            <span className="text-xs text-slate-500">{memberOptions.length} people</span>
          </div>
          <ul className="mt-4 space-y-3 text-sm">
            {memberOptions.map((m) => (
              <li key={m._id} className="flex items-center justify-between gap-2">
                <div>
                  <div className="font-medium text-slate-900">{m.name}</div>
                  <div className="text-xs text-slate-500">{m.email}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
                    {m.role}
                  </span>
                  {isAdmin && m._id !== project.owner?._id && (
                    <button
                      type="button"
                      onClick={() => removeMember(m._id)}
                      className="text-xs font-semibold text-rose-600 hover:text-rose-800"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-card ring-1 ring-slate-200 lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold text-slate-900">Tasks</h2>
            {isAdmin && (
              <button
                type="button"
                onClick={() => openTaskModal(null)}
                className="text-xs font-semibold text-brand-700 hover:text-brand-900"
              >
                + Add task
              </button>
            )}
          </div>

          {tasks.length === 0 ? (
            <p className="mt-6 text-center text-sm text-slate-500">No tasks yet for your access level.</p>
          ) : (
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="text-xs uppercase tracking-wide text-slate-500">
                    <th className="pb-2 pr-4 font-medium">Task</th>
                    <th className="pb-2 pr-4 font-medium">Assignee</th>
                    <th className="pb-2 pr-4 font-medium">Status</th>
                    <th className="pb-2 pr-4 font-medium">Priority</th>
                    <th className="pb-2 pr-4 font-medium">Due</th>
                    <th className="pb-2 font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {tasks.map((t) => {
                    const overdue = isOverdue(t.dueDate, t.status);
                    return (
                      <tr key={t._id}>
                        <td className="py-3 pr-4">
                          <div className="font-medium text-slate-900">{t.title}</div>
                          <div className="text-xs text-slate-500 line-clamp-1">{t.description}</div>
                        </td>
                        <td className="py-3 pr-4 text-xs text-slate-700">{t.assignedTo?.name}</td>
                        <td className="py-3 pr-4">
                          {isAdmin ? (
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${statusBadgeClass(t.status)}`}
                            >
                              {t.status}
                            </span>
                          ) : (
                            <select
                              className="w-full max-w-[160px] rounded-md border border-slate-200 px-2 py-1 text-xs"
                              value={t.status}
                              onChange={(e) => quickStatusChange(t, e.target.value)}
                            >
                              {STATUS_OPTIONS.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                          )}
                        </td>
                        <td className="py-3 pr-4">
                          <span className={`inline-flex rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset ${priorityBadgeClass(t.priority)}`}>
                            {t.priority}
                          </span>
                        </td>
                        <td className={`py-3 pr-4 text-xs ${overdue ? 'font-semibold text-rose-600' : 'text-slate-600'}`}>
                          {formatDate(t.dueDate)}
                          {overdue && <span className="ml-1 rounded bg-rose-50 px-1 text-[10px] uppercase">Overdue</span>}
                        </td>
                        <td className="py-3 text-right text-xs">
                          {isAdmin && (
                            <div className="flex justify-end gap-2">
                              <button type="button" className="font-semibold text-brand-700" onClick={() => openTaskModal(t)}>
                                Edit
                              </button>
                              <button type="button" className="font-semibold text-rose-600" onClick={() => setConfirmTaskDelete(t)}>
                                Delete
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <Modal
        open={projectModal}
        title="Edit project"
        onClose={() => !actionLoading && setProjectModal(false)}
        footer={
          <>
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => setProjectModal(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              form="edit-project-form"
              type="submit"
              disabled={actionLoading}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 disabled:opacity-60"
            >
              {actionLoading ? 'Saving…' : 'Save changes'}
            </button>
          </>
        }
      >
        <form id="edit-project-form" onSubmit={saveProject} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600">Title</label>
            <input
              required
              value={projectForm.title}
              onChange={(e) => setProjectForm((f) => ({ ...f, title: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-brand-500 focus:ring-2"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Description</label>
            <textarea
              rows={3}
              value={projectForm.description}
              onChange={(e) => setProjectForm((f) => ({ ...f, description: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-brand-500 focus:ring-2"
            />
          </div>
        </form>
      </Modal>

      <Modal
        open={memberModal}
        title="Add project member"
        onClose={() => !actionLoading && setMemberModal(false)}
        footer={
          <>
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => setMemberModal(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              form="add-member-form"
              type="submit"
              disabled={actionLoading}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 disabled:opacity-60"
            >
              {actionLoading ? 'Saving…' : 'Add member'}
            </button>
          </>
        }
      >
        {memberError && (
          <div className="mb-3">
            <Alert type="error">{memberError}</Alert>
          </div>
        )}
        <form id="add-member-form" onSubmit={addMember} className="space-y-3">
          <p className="text-xs text-slate-500">Enter the email of an existing user. They will be added to this project.</p>
          <input
            type="email"
            required
            value={memberEmail}
            onChange={(e) => setMemberEmail(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-brand-500 focus:ring-2"
            placeholder="colleague@company.com"
          />
        </form>
      </Modal>

      <Modal
        open={taskModal}
        title={editingTask ? 'Edit task' : 'New task'}
        onClose={() => !actionLoading && setTaskModal(false)}
        footer={
          <>
            <button
              type="button"
              disabled={actionLoading}
              onClick={() => setTaskModal(false)}
              className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              form="task-form"
              type="submit"
              disabled={actionLoading}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 disabled:opacity-60"
            >
              {actionLoading ? 'Saving…' : 'Save task'}
            </button>
          </>
        }
      >
        {taskError && (
          <div className="mb-3">
            <Alert type="error">{taskError}</Alert>
          </div>
        )}
        <form id="task-form" onSubmit={saveTask} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-600">Title</label>
            <input
              required
              disabled={!isAdmin && editingTask}
              value={taskForm.title}
              onChange={(e) => setTaskForm((f) => ({ ...f, title: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-brand-500 focus:ring-2 disabled:bg-slate-50"
            />
          </div>
          <div>
            <label className="text-xs font-semibold text-slate-600">Description</label>
            <textarea
              rows={3}
              disabled={!isAdmin && editingTask}
              value={taskForm.description}
              onChange={(e) => setTaskForm((f) => ({ ...f, description: e.target.value }))}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-brand-500 focus:ring-2 disabled:bg-slate-50"
            />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="text-xs font-semibold text-slate-600">Assignee</label>
              <select
                required
                disabled={!isAdmin}
                value={taskForm.assignedTo}
                onChange={(e) => setTaskForm((f) => ({ ...f, assignedTo: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-brand-500 focus:ring-2 disabled:bg-slate-50"
              >
                {memberOptions.map((m) => (
                  <option key={m._id} value={m._id}>
                    {m.name} ({m.email})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Due date</label>
              <input
                type="date"
                required
                disabled={!isAdmin}
                value={taskForm.dueDate}
                onChange={(e) => setTaskForm((f) => ({ ...f, dueDate: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-brand-500 focus:ring-2 disabled:bg-slate-50"
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Status</label>
              <select
                value={taskForm.status}
                onChange={(e) => setTaskForm((f) => ({ ...f, status: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-brand-500 focus:ring-2"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600">Priority</label>
              <select
                disabled={!isAdmin}
                value={taskForm.priority}
                onChange={(e) => setTaskForm((f) => ({ ...f, priority: e.target.value }))}
                className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-brand-500 focus:ring-2 disabled:bg-slate-50"
              >
                {PRIORITY_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {!isAdmin && (
            <p className="text-xs text-slate-500">As a member you can adjust status for your tasks from the table or here.</p>
          )}
        </form>
      </Modal>

      <ConfirmDialog
        open={confirmProjectDelete}
        title="Delete project?"
        description="This will permanently delete the project and all of its tasks."
        confirmLabel="Delete project"
        loading={actionLoading}
        onCancel={() => !actionLoading && setConfirmProjectDelete(false)}
        onConfirm={deleteProject}
      />

      <ConfirmDialog
        open={Boolean(confirmTaskDelete)}
        title="Delete task?"
        description="This action cannot be undone."
        confirmLabel="Delete task"
        loading={actionLoading}
        onCancel={() => !actionLoading && setConfirmTaskDelete(null)}
        onConfirm={deleteTask}
      />
    </div>
  );
}
