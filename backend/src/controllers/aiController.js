const aiService = require('../services/aiService');
const projectRepository = require('../repositories/projectRepository');
const taskRepository = require('../repositories/taskRepository');

const aiController = {
  // Generate description
  async generateDescription(req, res) {
    try {
      const { title, category } = req.body;
      if (!title) {
        return res.status(400).json({
          success: false,
          message: 'Task title is required.'
        });
      }

      const description = await aiService.generateTaskDescription(title, category || 'General');
      return res.status(200).json({
        success: true,
        description
      });
    } catch (error) {
      console.error('AI Generate Description Error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error generating description.'
      });
    }
  },

  // Recommend priority
  async recommendPriority(req, res) {
    try {
      const { title, description } = req.body;
      if (!title) {
        return res.status(400).json({
          success: false,
          message: 'Task title is required.'
        });
      }

      const recommendation = await aiService.recommendTaskPriority(title, description || '');
      return res.status(200).json({
        success: true,
        recommendation
      });
    } catch (error) {
      console.error('AI Recommend Priority Error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error calculating priority recommendation.'
      });
    }
  },

  // Predict delay risk
  async predictDelay(req, res) {
    try {
      const { deadline, progress } = req.body;
      
      const prediction = await aiService.predictDeadlineDelay(deadline, progress || 0);
      return res.status(200).json({
        success: true,
        prediction
      });
    } catch (error) {
      console.error('AI Predict Delay Error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error calculating deadline risk.'
      });
    }
  },

  // Project Summary
  async getProjectSummary(req, res) {
    try {
      const { projectId } = req.body;
      if (!projectId) {
        return res.status(400).json({
          success: false,
          message: 'projectId parameter is required.'
        });
      }

      const project = await projectRepository.findById(projectId);
      if (!project) {
        return res.status(404).json({
          success: false,
          message: 'Project not found.'
        });
      }

      const tasks = await taskRepository.findAll({ projectId });
      const summary = await aiService.summarizeProject(project.name, tasks);

      return res.status(200).json({
        success: true,
        summary
      });
    } catch (error) {
      console.error('AI Project Summary Error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error compiling project summary.'
      });
    }
  },

  // Generate meeting notes
  async generateMeetingNotes(req, res) {
    try {
      const { transcript } = req.body;
      const notes = await aiService.generateMeetingNotes(transcript);
      return res.status(200).json({
        success: true,
        notes
      });
    } catch (error) {
      console.error('AI Meeting Notes Error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error generating meeting minutes.'
      });
    }
  }
};

module.exports = aiController;
