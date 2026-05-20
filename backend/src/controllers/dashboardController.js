import { Project } from '../models/Project.js';
import { Task } from '../models/Task.js';

export const dashboard = async (req, res, next) => {
  try {
    const user = req.user;
    let projectFilter = {};
    if (user.role !== 'Admin') {
      projectFilter = {
        $or: [{ owner: user._id }, { members: user._id }],
      };
    }

    const projects = await Project.find(projectFilter).select('_id');
    const projectIds = projects.map((p) => p._id);

    const taskBase =
      user.role === 'Admin'
        ? {}
        : { assignedTo: user._id };

    const [totalProjects, allTasks] = await Promise.all([
      Project.countDocuments(projectFilter),
      Task.find({
        ...taskBase,
        ...(user.role === 'Admin' ? {} : { projectId: { $in: projectIds } }),
      })
        .select('status priority dueDate projectId assignedTo')
        .lean(),
    ]);

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const stats = {
      totalProjects,
      totalTasks: allTasks.length,
      todo: 0,
      inProgress: 0,
      completed: 0,
      overdue: 0,
      highPriority: 0,
    };

    for (const t of allTasks) {
      if (t.status === 'Todo') stats.todo += 1;
      else if (t.status === 'In Progress') stats.inProgress += 1;
      else if (t.status === 'Completed') stats.completed += 1;
      if (t.priority === 'High') stats.highPriority += 1;
      if (t.status !== 'Completed' && new Date(t.dueDate) < startOfToday) {
        stats.overdue += 1;
      }
    }

    const completionRate =
      stats.totalTasks === 0 ? 0 : Math.round((stats.completed / stats.totalTasks) * 100);

    res.json({
      stats: {
        ...stats,
        completionRate,
      },
    });
  } catch (e) {
    next(e);
  }
};
