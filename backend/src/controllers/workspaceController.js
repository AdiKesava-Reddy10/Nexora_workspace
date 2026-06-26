const workspaceRepository = require('../repositories/workspaceRepository');
const projectRepository = require('../repositories/projectRepository');
const taskRepository = require('../repositories/taskRepository');
const userRepository = require('../repositories/userRepository');

const workspaceController = {
  // Get workspaces current user belongs to
  async list(req, res) {
    try {
      const workspaces = await workspaceRepository.findAllByUserId(req.user.id);
      return res.status(200).json({
        success: true,
        workspaces
      });
    } catch (error) {
      console.error('Workspaces list error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error listing workspaces.'
      });
    }
  },

  // Create workspace
  async create(req, res) {
    try {
      const { name, description, avatar } = req.body;
      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Workspace name is required.'
        });
      }

      const workspace = await workspaceRepository.create({
        name,
        description: description || '',
        avatar: avatar || 'https://images.unsplash.com/photo-1508962914676-134849a727f0?w=150',
        ownerId: req.user.id
      });

      return res.status(201).json({
        success: true,
        message: 'Workspace created successfully.',
        workspace
      });
    } catch (error) {
      console.error('Workspace create error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error creating workspace.'
      });
    }
  },

  // Get members list
  async getMembers(req, res) {
    try {
      const members = await workspaceRepository.findMembers(req.params.id);
      return res.status(200).json({
        success: true,
        members
      });
    } catch (error) {
      console.error('Workspace members fetch error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error fetching workspace members.'
      });
    }
  },

  // Invite member by email
  async inviteMember(req, res) {
    try {
      const { email, role } = req.body;
      const workspaceId = req.params.id;

      if (!email) {
        return res.status(400).json({
          success: false,
          message: 'Email address is required.'
        });
      }

      const targetUser = await userRepository.findByEmail(email);
      if (!targetUser) {
        return res.status(404).json({
          success: false,
          message: `User with email '${email}' not found. Ask them to register first.`
        });
      }

      const member = await workspaceRepository.addMember(workspaceId, targetUser.id, role || 'Developer');
      return res.status(200).json({
        success: true,
        message: `${targetUser.name} successfully added to the workspace.`,
        member
      });
    } catch (error) {
      console.error('Workspace invite member error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error inviting user.'
      });
    }
  },

  // Update member role
  async updateMemberRole(req, res) {
    try {
      const { userId, role } = req.body;
      const workspaceId = req.params.id;

      if (!userId || !role) {
        return res.status(400).json({
          success: false,
          message: 'userId and role are required parameters.'
        });
      }

      const updated = await workspaceRepository.updateMemberRole(workspaceId, userId, role);
      if (!updated) {
        return res.status(404).json({
          success: false,
          message: 'Membership link not found.'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Member role updated successfully.',
        member: updated
      });
    } catch (error) {
      console.error('Update member role error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error updating role.'
      });
    }
  },

  // Remove member
  async removeMember(req, res) {
    try {
      const { userId } = req.body;
      const workspaceId = req.params.id;

      if (!userId) {
        return res.status(400).json({
          success: false,
          message: 'userId parameter is required.'
        });
      }

      const removed = await workspaceRepository.removeMember(workspaceId, userId);
      if (!removed) {
        return res.status(404).json({
          success: false,
          message: 'Member membership not found.'
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Member removed from workspace successfully.'
      });
    } catch (error) {
      console.error('Remove member error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error removing member.'
      });
    }
  },

  // Fetch workspace analytics data
  async getAnalytics(req, res) {
    try {
      const workspaceId = parseInt(req.params.id, 10);
      
      const projects = await projectRepository.findAll({ workspaceId });
      const tasks = await taskRepository.findAll({ workspaceId });

      const totalProjects = projects.length;
      const completedProjects = projects.filter(p => p.status === 'Completed').length;
      const activeProjects = projects.filter(p => p.status === 'Active' || p.status === 'Planning').length;

      const totalTasks = tasks.length;
      const completedTasks = tasks.filter(t => t.status === 'Completed').length;
      const inProgressTasks = tasks.filter(t => t.status === 'In Progress').length;
      const pendingTasks = tasks.filter(t => t.status === 'Pending').length;
      const onHoldTasks = tasks.filter(t => t.status === 'On Hold').length;
      const criticalTasks = tasks.filter(t => t.priority === 'Critical').length;
      const highPriorityTasks = tasks.filter(t => t.priority === 'High').length;

      // Overdue tasks calculation
      const today = new Date().toISOString().split('T')[0];
      const overdueTasks = tasks.filter(t => t.status !== 'Completed' && t.deadline && t.deadline < today).length;

      // Completion rates
      const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      const projectCompletionRate = totalProjects > 0 ? Math.round((completedProjects / totalProjects) * 100) : 0;

      // Workload by developer
      const users = await userRepository.findAll();
      const workloadAnalytics = [];
      const userWorkloadMap = {};

      // Seed all users with 0 tasks
      users.forEach(u => {
        userWorkloadMap[u.id] = { id: u.id, name: u.name, avatar: u.avatar, tasksCount: 0, completedCount: 0, hours: 0 };
      });

      tasks.forEach(t => {
        if (t.assignedUserId && userWorkloadMap[t.assignedUserId]) {
          userWorkloadMap[t.assignedUserId].tasksCount++;
          if (t.status === 'Completed') {
            userWorkloadMap[t.assignedUserId].completedCount++;
          }
          userWorkloadMap[t.assignedUserId].hours += parseFloat(t.estimatedHours || 0);
        }
      });

      Object.values(userWorkloadMap).forEach(val => {
        if (val.tasksCount > 0) {
          workloadAnalytics.push(val);
        }
      });

      // Weekly productivity score calculation
      const productivityScore = Math.round((completedTasks * 10 + inProgressTasks * 5) / (totalTasks || 1) * 10);

      // Monthly task metrics (mock timelines grouping)
      const weeklyProgress = [
        { name: 'Week 1', completed: Math.round(completedTasks * 0.2), total: Math.round(totalTasks * 0.25) },
        { name: 'Week 2', completed: Math.round(completedTasks * 0.4), total: Math.round(totalTasks * 0.5) },
        { name: 'Week 3', completed: Math.round(completedTasks * 0.75), total: Math.round(totalTasks * 0.75) },
        { name: 'Week 4', completed: completedTasks, total: totalTasks }
      ];

      return res.status(200).json({
        success: true,
        stats: {
          totalProjects,
          completedProjects,
          activeProjects,
          totalTasks,
          completedTasks,
          inProgressTasks,
          pendingTasks,
          onHoldTasks,
          criticalTasks,
          highPriorityTasks,
          overdueTasks,
          taskCompletionRate,
          projectCompletionRate,
          productivityScore,
          workloadAnalytics,
          weeklyProgress
        }
      });
    } catch (error) {
      console.error('Workspace analytics error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error computing workspace statistics.'
      });
    }
  }
};

module.exports = workspaceController;
