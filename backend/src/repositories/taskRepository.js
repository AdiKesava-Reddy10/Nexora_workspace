const db = require('./db');

const taskRepository = {
  async findById(id) {
    const intId = parseInt(id, 10);
    if (db.isFallback()) {
      const data = db.readJSONDb();
      if (!data || !data.tasks) return null;
      const task = data.tasks.find(t => t.id === intId);
      return task ? { ...task } : null;
    } else {
      const { Task } = db.getModels();
      const task = await Task.findByPk(intId);
      return task ? task.toJSON() : null;
    }
  },

  async findAll(filters = {}) {
    const projectId = filters.projectId ? parseInt(filters.projectId, 10) : null;
    const assignedUserId = filters.assignedUserId ? parseInt(filters.assignedUserId, 10) : null;
    const workspaceId = filters.workspaceId ? parseInt(filters.workspaceId, 10) : null;

    if (db.isFallback()) {
      const data = db.readJSONDb();
      if (!data || !data.tasks) return [];
      
      let list = [...data.tasks];
      
      // If we filtered by workspaceId but not by projectId directly
      if (workspaceId && !projectId) {
        const workspaceProjectIds = data.projects
          .filter(p => p.workspaceId === workspaceId)
          .map(p => p.id);
        list = list.filter(t => workspaceProjectIds.includes(t.projectId));
      }
      
      if (projectId) {
        list = list.filter(t => t.projectId === projectId);
      }
      
      if (assignedUserId) {
        list = list.filter(t => t.assignedUserId === assignedUserId);
      }

      if (filters.status) {
        list = list.filter(t => t.status.toLowerCase() === filters.status.toLowerCase());
      }
      
      return list;
    } else {
      const { Task, Project } = db.getModels();
      const whereClause = {};
      
      if (projectId) {
        whereClause.projectId = projectId;
      } else if (workspaceId) {
        // If workspaceId is supplied, we need tasks whose projects belong to this workspace
        const projects = await Project.findAll({ where: { workspaceId } });
        const projectIds = projects.map(p => p.id);
        whereClause.projectId = projectIds;
      }
      
      if (assignedUserId) {
        whereClause.assignedUserId = assignedUserId;
      }

      if (filters.status) {
        whereClause.status = filters.status;
      }
      
      const list = await Task.findAll({ where: whereClause });
      return list.map(t => t.toJSON());
    }
  },

  async create(taskData) {
    if (db.isFallback()) {
      const data = db.readJSONDb();
      const newId = data.tasks.length > 0 ? Math.max(...data.tasks.map(t => t.id)) + 1 : 1;
      const newTask = {
        id: newId,
        status: taskData.status || 'Pending',
        priority: taskData.priority || 'Medium',
        estimatedHours: taskData.estimatedHours || 0.00,
        isRecurring: taskData.isRecurring || false,
        recurrenceInterval: taskData.recurrenceInterval || null,
        parentTaskId: taskData.parentTaskId || null,
        attachments: taskData.attachments || null,
        ...taskData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      data.tasks.push(newTask);
      
      // Auto-log creation activity
      const activityId = data.activities.length > 0 ? Math.max(...data.activities.map(a => a.id)) + 1 : 1;
      data.activities.push({
        id: activityId,
        taskId: newId,
        userId: taskData.creatorId,
        activityType: 'Create',
        details: 'Task created',
        createdAt: new Date().toISOString()
      });

      db.writeJSONDb(data);
      return { ...newTask };
    } else {
      const { Task, TaskActivity } = db.getModels();
      const task = await Task.create(taskData);
      
      // Auto-log creation activity
      await TaskActivity.create({
        taskId: task.id,
        userId: taskData.creatorId,
        activityType: 'Create',
        details: 'Task created'
      });
      return task.toJSON();
    }
  },

  async update(id, updateData, userId = 1) {
    const intId = parseInt(id, 10);
    if (db.isFallback()) {
      const data = db.readJSONDb();
      const index = data.tasks.findIndex(t => t.id === intId);
      if (index === -1) return null;
      
      const oldTask = data.tasks[index];
      const updatedTask = {
        ...oldTask,
        ...updateData,
        updatedAt: new Date().toISOString()
      };
      
      // Log activities if key parameters changed
      const changes = [];
      if (updateData.status && updateData.status !== oldTask.status) {
        changes.push(`status to ${updateData.status}`);
      }
      if (updateData.priority && updateData.priority !== oldTask.priority) {
        changes.push(`priority to ${updateData.priority}`);
      }
      if (updateData.assignedUserId && updateData.assignedUserId !== oldTask.assignedUserId) {
        changes.push(`assignee to User #${updateData.assignedUserId}`);
      }

      if (changes.length > 0) {
        const activityId = data.activities.length > 0 ? Math.max(...data.activities.map(a => a.id)) + 1 : 1;
        data.activities.push({
          id: activityId,
          taskId: intId,
          userId,
          activityType: 'StatusChange',
          details: `Changed ${changes.join(', ')}`,
          createdAt: new Date().toISOString()
        });
      }

      data.tasks[index] = updatedTask;
      db.writeJSONDb(data);
      return { ...updatedTask };
    } else {
      const { Task, TaskActivity } = db.getModels();
      const task = await Task.findByPk(intId);
      if (!task) return null;
      
      const oldStatus = task.status;
      const oldPriority = task.priority;
      const oldAssignee = task.assignedUserId;

      await task.update(updateData);
      
      const changes = [];
      if (updateData.status && updateData.status !== oldStatus) {
        changes.push(`status to ${updateData.status}`);
      }
      if (updateData.priority && updateData.priority !== oldPriority) {
        changes.push(`priority to ${updateData.priority}`);
      }
      if (updateData.assignedUserId && updateData.assignedUserId !== oldAssignee) {
        changes.push(`assignee to User #${updateData.assignedUserId}`);
      }

      if (changes.length > 0) {
        await TaskActivity.create({
          taskId: task.id,
          userId,
          activityType: 'StatusChange',
          details: `Changed ${changes.join(', ')}`
        });
      }

      return task.toJSON();
    }
  },

  async delete(id) {
    const intId = parseInt(id, 10);
    if (db.isFallback()) {
      const data = db.readJSONDb();
      const index = data.tasks.findIndex(t => t.id === intId);
      if (index === -1) return false;
      
      // Delete child tasks (subtasks)
      data.tasks = data.tasks.filter(t => t.parentTaskId !== intId);
      // Delete comments
      data.comments = data.comments.filter(c => c.taskId !== intId);
      // Delete activities
      data.activities = data.activities.filter(a => a.taskId !== intId);
      
      data.tasks.splice(index, 1);
      db.writeJSONDb(data);
      return true;
    } else {
      const { Task, TaskComment, TaskActivity } = db.getModels();
      const task = await Task.findByPk(intId);
      if (!task) return false;
      
      // Delete subtasks, comments, activities
      await Task.destroy({ where: { parentTaskId: intId } });
      await TaskComment.destroy({ where: { taskId: intId } });
      await TaskActivity.destroy({ where: { taskId: intId } });
      await task.destroy();
      return true;
    }
  },

  // Comments
  async findComments(taskId) {
    const intTaskId = parseInt(taskId, 10);
    if (db.isFallback()) {
      const data = db.readJSONDb();
      if (!data) return [];
      const comments = data.comments.filter(c => c.taskId === intTaskId);
      return comments.map(c => {
        const u = data.users.find(user => user.id === c.userId);
        return {
          ...c,
          user: u ? { name: u.name, avatar: u.avatar } : null
        };
      });
    } else {
      const { TaskComment, User } = db.getModels();
      const comments = await TaskComment.findAll({ where: { taskId: intTaskId } });
      const results = [];
      for (const c of comments) {
        const u = await User.findByPk(c.userId);
        results.push({
          ...c.toJSON(),
          user: u ? { name: u.name, avatar: u.avatar } : null
        });
      }
      return results;
    }
  },

  async addComment(taskId, userId, commentText) {
    const intTaskId = parseInt(taskId, 10);
    const intUserId = parseInt(userId, 10);
    if (db.isFallback()) {
      const data = db.readJSONDb();
      const newId = data.comments.length > 0 ? Math.max(...data.comments.map(c => c.id)) + 1 : 1;
      const newComment = {
        id: newId,
        taskId: intTaskId,
        userId: intUserId,
        commentText,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      data.comments.push(newComment);
      
      // Auto-log activity
      const activityId = data.activities.length > 0 ? Math.max(...data.activities.map(a => a.id)) + 1 : 1;
      data.activities.push({
        id: activityId,
        taskId: intTaskId,
        userId: intUserId,
        activityType: 'CommentAdded',
        details: 'Added a comment',
        createdAt: new Date().toISOString()
      });

      db.writeJSONDb(data);
      const u = data.users.find(user => user.id === intUserId);
      return { ...newComment, user: u ? { name: u.name, avatar: u.avatar } : null };
    } else {
      const { TaskComment, TaskActivity, User } = db.getModels();
      const c = await TaskComment.create({
        taskId: intTaskId,
        userId: intUserId,
        commentText
      });
      await TaskActivity.create({
        taskId: intTaskId,
        userId: intUserId,
        activityType: 'CommentAdded',
        details: 'Added a comment'
      });
      const u = await User.findByPk(intUserId);
      return { ...c.toJSON(), user: u ? { name: u.name, avatar: u.avatar } : null };
    }
  },

  // Activity Log
  async findActivityLog(taskId) {
    const intTaskId = parseInt(taskId, 10);
    if (db.isFallback()) {
      const data = db.readJSONDb();
      if (!data) return [];
      const activities = data.activities.filter(a => a.taskId === intTaskId);
      return activities.map(a => {
        const u = data.users.find(user => user.id === a.userId);
        return {
          ...a,
          user: u ? { name: u.name, avatar: u.avatar } : null
        };
      });
    } else {
      const { TaskActivity, User } = db.getModels();
      const activities = await TaskActivity.findAll({ where: { taskId: intTaskId }, order: [['createdAt', 'DESC']] });
      const results = [];
      for (const a of activities) {
        const u = await User.findByPk(a.userId);
        results.push({
          ...a.toJSON(),
          user: u ? { name: u.name, avatar: u.avatar } : null
        });
      }
      return results;
    }
  }
};

module.exports = taskRepository;
