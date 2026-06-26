const taskRepository = require('../repositories/taskRepository');
const projectRepository = require('../repositories/projectRepository');

const taskController = {
  // List tasks
  async list(req, res) {
    try {
      const { projectId, assignedUserId, workspaceId, status } = req.query;
      
      const filters = {};
      if (projectId) filters.projectId = projectId;
      if (assignedUserId) filters.assignedUserId = assignedUserId;
      if (workspaceId) filters.workspaceId = workspaceId;
      if (status) filters.status = status;

      const tasks = await taskRepository.findAll(filters);
      return res.status(200).json({
        success: true,
        tasks
      });
    } catch (error) {
      console.error('Task list error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error listing tasks.'
      });
    }
  },

  // Create task
  async create(req, res) {
    try {
      const { title, description, projectId, status, priority, startDate, deadline, estimatedHours, assignedUserId, isRecurring, recurrenceInterval, parentTaskId, tags, notes, attachments } = req.body;

      if (!title || !projectId) {
        return res.status(400).json({
          success: false,
          message: 'Task title and projectId are required.'
        });
      }

      // Verify project exists
      const project = await projectRepository.findById(projectId);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found.'
        });
      }

      const task = await taskRepository.create({
        title,
        description: description || '',
        projectId: parseInt(projectId, 10),
        status: status || 'Pending',
        priority: priority || 'Medium',
        startDate: startDate || null,
        deadline: deadline || null,
        estimatedHours: parseFloat(estimatedHours || 0.00),
        assignedUserId: assignedUserId ? parseInt(assignedUserId, 10) : null,
        creatorId: req.user.id,
        isRecurring: isRecurring || false,
        recurrenceInterval: recurrenceInterval || null,
        parentTaskId: parentTaskId ? parseInt(parentTaskId, 10) : null,
        tags: tags || '',
        notes: notes || '',
        attachments: attachments || null
      });

      // Update project progress dynamically
      await recalculateProjectProgress(projectId);

      return res.status(201).json({
        success: true,
        message: 'Task created successfully.',
        task
      });
    } catch (error) {
      console.error('Task create error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error creating task.'
      });
    }
  },

  // Get task by ID
  async getById(req, res) {
    try {
      const task = await taskRepository.findById(req.params.id);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found.'
        });
      }
      return res.status(200).json({
        success: true,
        task
      });
    } catch (error) {
      console.error('Get task error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error fetching task.'
      });
    }
  },

  // Update task
  async update(req, res) {
    try {
      const task = await taskRepository.findById(req.params.id);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found.'
        });
      }

      const updated = await taskRepository.update(req.params.id, req.body, req.user.id);
      
      // Update project progress
      await recalculateProjectProgress(task.projectId);

      return res.status(200).json({
        success: true,
        message: 'Task updated successfully.',
        task: updated
      });
    } catch (error) {
      console.error('Task update error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error updating task.'
      });
    }
  },

  // Delete task
  async delete(req, res) {
    try {
      const task = await taskRepository.findById(req.params.id);
      if (!task) {
        return res.status(404).json({
          success: false,
          message: 'Task not found.'
        });
      }

      const success = await taskRepository.delete(req.params.id);
      
      // Update project progress
      await recalculateProjectProgress(task.projectId);

      return res.status(200).json({
        success: true,
        message: 'Task deleted successfully.'
      });
    } catch (error) {
      console.error('Task delete error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error deleting task.'
      });
    }
  },

  // Duplicate task
  async duplicate(req, res) {
    try {
      const sourceTask = await taskRepository.findById(req.params.id);
      if (!sourceTask) {
        return res.status(404).json({
          success: false,
          message: 'Source task not found.'
        });
      }

      const cloned = await taskRepository.create({
        projectId: sourceTask.projectId,
        title: `${sourceTask.title} (Clone)`,
        description: sourceTask.description,
        status: 'Pending',
        priority: sourceTask.priority,
        startDate: sourceTask.startDate,
        deadline: sourceTask.deadline,
        estimatedHours: parseFloat(sourceTask.estimatedHours),
        assignedUserId: sourceTask.assignedUserId,
        creatorId: req.user.id,
        isRecurring: sourceTask.isRecurring,
        recurrenceInterval: sourceTask.recurrenceInterval,
        parentTaskId: sourceTask.parentTaskId,
        tags: sourceTask.tags,
        notes: sourceTask.notes,
        attachments: sourceTask.attachments
      });

      // Update project progress
      await recalculateProjectProgress(sourceTask.projectId);

      return res.status(201).json({
        success: true,
        message: 'Task duplicated successfully.',
        task: cloned
      });
    } catch (error) {
      console.error('Task duplication error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error duplicating task.'
      });
    }
  },

  // Comments
  async getComments(req, res) {
    try {
      const comments = await taskRepository.findComments(req.params.id);
      return res.status(200).json({
        success: true,
        comments
      });
    } catch (error) {
      console.error('Get comments error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error listing comments.'
      });
    }
  },

  async addComment(req, res) {
    try {
      const { commentText } = req.body;
      if (!commentText) {
        return res.status(400).json({
          success: false,
          message: 'commentText parameter is required.'
        });
      }

      const comment = await taskRepository.addComment(req.params.id, req.user.id, commentText);
      return res.status(201).json({
        success: true,
        message: 'Comment added.',
        comment
      });
    } catch (error) {
      console.error('Add comment error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error adding comment.'
      });
    }
  },

  // Activity Log
  async getActivityLog(req, res) {
    try {
      const activities = await taskRepository.findActivityLog(req.params.id);
      return res.status(200).json({
        success: true,
        activities
      });
    } catch (error) {
      console.error('Get activity log error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error listing activities.'
      });
    }
  }
};

// Helper: updates parent project progress based on task stats
async function recalculateProjectProgress(projectId) {
  try {
    const tasks = await taskRepository.findAll({ projectId });
    if (tasks.length === 0) {
      await projectRepository.update(projectId, { progress: 0 });
      return;
    }

    const completed = tasks.filter(t => t.status === 'Completed').length;
    const progress = Math.round((completed / tasks.length) * 100);

    // Dynamic project health calculation
    const today = new Date().toISOString().split('T')[0];
    const overdueCount = tasks.filter(t => t.status !== 'Completed' && t.deadline && t.deadline < today).length;
    const healthScore = Math.max(100 - overdueCount * 15, 20);

    await projectRepository.update(projectId, { progress, healthScore });
  } catch (err) {
    console.error('Recalculate project progress error:', err.message);
  }
}

module.exports = taskController;
