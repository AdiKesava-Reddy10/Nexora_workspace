const projectRepository = require('../repositories/projectRepository');
const taskRepository = require('../repositories/taskRepository');

const projectController = {
  // List projects in a workspace
  async list(req, res) {
    try {
      const { workspaceId } = req.query;
      if (!workspaceId) {
        return res.status(400).json({
          success: false,
          message: 'workspaceId query parameter is required.'
        });
      }

      const projects = await projectRepository.findAll({ workspaceId });
      return res.status(200).json({
        success: true,
        projects
      });
    } catch (error) {
      console.error('Project list error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error listing projects.'
      });
    }
  },

  // Create project
  async create(req, res) {
    try {
      const { name, description, category, status, priority, startDate, endDate, deadline, estimatedHours, tags, workspaceId } = req.body;

      if (!name || !workspaceId) {
        return res.status(400).json({
          success: false,
          message: 'Project name and workspaceId are required.'
        });
      }

      const project = await projectRepository.create({
        name,
        description: description || '',
        category: category || 'General',
        status: status || 'Planning',
        priority: priority || 'Medium',
        startDate: startDate || null,
        endDate: endDate || null,
        deadline: deadline || null,
        estimatedHours: parseFloat(estimatedHours || 0.00),
        progress: 0,
        healthScore: 100,
        tags: tags || '',
        ownerId: req.user.id,
        workspaceId: parseInt(workspaceId, 10)
      });

      return res.status(201).json({
        success: true,
        message: 'Project created successfully.',
        project
      });
    } catch (error) {
      console.error('Project create error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error creating project.'
      });
    }
  },

  // Get project by ID
  async getById(req, res) {
    try {
      const project = await projectRepository.findById(req.params.id);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found.'
        });
      }
      return res.status(200).json({
        success: true,
        project
      });
    } catch (error) {
      console.error('Get project error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error fetching project.'
      });
    }
  },

  // Update project
  async update(req, res) {
    try {
      const project = await projectRepository.findById(req.params.id);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found.'
        });
      }

      const updated = await projectRepository.update(req.params.id, req.body);
      return res.status(200).json({
        success: true,
        message: 'Project updated successfully.',
        project: updated
      });
    } catch (error) {
      console.error('Project update error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error updating project.'
      });
    }
  },

  // Delete project
  async delete(req, res) {
    try {
      const success = await projectRepository.delete(req.params.id);
      if (!success) {
        return res.status(404).json({
          success: false,
          message: 'Project not found.'
        });
      }
      return res.status(200).json({
        success: true,
        message: 'Project and all associated tasks deleted successfully.'
      });
    } catch (error) {
      console.error('Project delete error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error deleting project.'
      });
    }
  },

  // Archive project
  async archive(req, res) {
    try {
      const updated = await projectRepository.update(req.params.id, { status: 'Archived' });
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Project not found.'
        });
      }
      return res.status(200).json({
        success: true,
        message: 'Project archived successfully.',
        project: updated
      });
    } catch (error) {
      console.error('Project archive error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error archiving project.'
      });
    }
  },

  // Restore project
  async restore(req, res) {
    try {
      const updated = await projectRepository.update(req.params.id, { status: 'Active' });
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Project not found.'
        });
      }
      return res.status(200).json({
        success: true,
        message: 'Project restored to Active successfully.',
        project: updated
      });
    } catch (error) {
      console.error('Project restore error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error restoring project.'
      });
    }
  },

  // Duplicate project (including tasks)
  async duplicate(req, res) {
    try {
      const sourceProject = await projectRepository.findById(req.params.id);
      if (!sourceProject) {
        return res.status(404).json({
          success: false,
          message: 'Source project not found.'
        });
      }

      // Clone project metadata
      const clonedProject = await projectRepository.create({
        workspaceId: sourceProject.workspaceId,
        name: `Copy of ${sourceProject.name}`,
        description: sourceProject.description,
        category: sourceProject.category,
        status: 'Planning', // Cloned projects default back to planning
        priority: sourceProject.priority,
        startDate: sourceProject.startDate,
        endDate: sourceProject.endDate,
        deadline: sourceProject.deadline,
        estimatedHours: parseFloat(sourceProject.estimatedHours),
        tags: sourceProject.tags,
        ownerId: req.user.id
      });

      // Get all tasks for source project
      const sourceTasks = await taskRepository.findAll({ projectId: sourceProject.id });

      // Clone each task
      for (const t of sourceTasks) {
        await taskRepository.create({
          projectId: clonedProject.id,
          title: t.title,
          description: t.description,
          status: 'Pending', // reset status
          priority: t.priority,
          startDate: t.startDate,
          deadline: t.deadline,
          estimatedHours: parseFloat(t.estimatedHours),
          assignedUserId: t.assignedUserId,
          creatorId: req.user.id,
          isRecurring: t.isRecurring,
          recurrenceInterval: t.recurrenceInterval,
          tags: t.tags,
          notes: t.notes
        });
      }

      return res.status(201).json({
        success: true,
        message: 'Project duplicated successfully with all task logs.',
        project: clonedProject
      });
    } catch (error) {
      console.error('Project duplication error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error duplicating project.'
      });
    }
  }
};

module.exports = projectController;
