const projectRepository = require('../repositories/projectRepository');
const taskRepository = require('../repositories/taskRepository');

const reportController = {
  // Export workspace report
  async exportReport(req, res) {
    try {
      const { workspaceId, format } = req.query;

      if (!workspaceId) {
        return res.status(400).json({
          success: false,
          message: 'workspaceId parameter is required.'
        });
      }

      const projects = await projectRepository.findAll({ workspaceId });
      const tasks = await taskRepository.findAll({ workspaceId });

      if (format === 'csv' || format === 'excel') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', 'attachment; filename="nexora_workspace_report.csv"');

        // Compile CSV Rows
        let csvContent = '--- NEXORA WORKSPACE REPORT ---\n';
        csvContent += `Generated At: ${new Date().toLocaleString()}\n\n`;

        // 1. Projects Section
        csvContent += '--- PROJECTS SUMMARY ---\n';
        csvContent += 'ID,Project Name,Category,Status,Priority,Start Date,Deadline,Health Score,Progress (%),Est Hours\n';
        projects.forEach(p => {
          csvContent += `"${p.id}","${p.name.replace(/"/g, '""')}","${p.category}","${p.status}","${p.priority}","${p.startDate || ''}","${p.deadline || ''}","${p.healthScore}","${p.progress}%","${p.estimatedHours}"\n`;
        });

        csvContent += '\n';

        // 2. Tasks Section
        csvContent += '--- TASKS DETAILS ---\n';
        csvContent += 'ID,Project ID,Task Title,Status,Priority,Deadline,Assignee ID,Est Hours,Tags\n';
        tasks.forEach(t => {
          csvContent += `"${t.id}","${t.projectId}","${t.title.replace(/"/g, '""')}","${t.status}","${t.priority}","${t.deadline || ''}","${t.assignedUserId || 'Unassigned'}","${t.estimatedHours}","${t.tags || ''}"\n`;
        });

        return res.status(200).send(csvContent);
      } 
      
      // Default: return structured JSON payload representing detailed report variables
      // which the frontend parses into styled PDF printable components
      return res.status(200).json({
        success: true,
        report: {
          generatedAt: new Date().toISOString(),
          workspaceId: parseInt(workspaceId, 10),
          projectsCount: projects.length,
          tasksCount: tasks.length,
          completedTasks: tasks.filter(t => t.status === 'Completed').length,
          inProgressTasks: tasks.filter(t => t.status === 'In Progress').length,
          overdueTasksCount: tasks.filter(t => t.status !== 'Completed' && t.deadline && new Date(t.deadline) < new Date()).length,
          projects,
          tasks
        }
      });

    } catch (error) {
      console.error('Report export error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error compiling workspace report.'
      });
    }
  }
};

module.exports = reportController;
