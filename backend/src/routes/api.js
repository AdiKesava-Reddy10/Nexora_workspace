const express = require('express');
const router = express.Router();

const authMiddleware = require('../middleware/authMiddleware');

const authController = require('../controllers/authController');
const workspaceController = require('../controllers/workspaceController');
const projectController = require('../controllers/projectController');
const taskController = require('../controllers/taskController');
const aiController = require('../controllers/aiController');
const reportController = require('../controllers/reportController');
const notificationController = require('../controllers/notificationController');

// --- AUTHENTICATION ROUTES ---
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/logout', authMiddleware.authenticate, authController.logout);
router.get('/auth/profile', authMiddleware.authenticate, authController.getProfile);
router.put('/auth/profile', authMiddleware.authenticate, authController.updateProfile);

// --- WORKSPACE ROUTES ---
router.get('/workspaces', authMiddleware.authenticate, workspaceController.list);
router.post('/workspaces', authMiddleware.authenticate, workspaceController.create);
router.get('/workspaces/:id/members', authMiddleware.authenticate, workspaceController.getMembers);
router.post('/workspaces/:id/members', authMiddleware.authenticate, workspaceController.inviteMember);
router.put('/workspaces/:id/members', authMiddleware.authenticate, workspaceController.updateMemberRole);
router.delete('/workspaces/:id/members', authMiddleware.authenticate, workspaceController.removeMember);
router.get('/workspaces/:id/analytics', authMiddleware.authenticate, workspaceController.getAnalytics);

// --- PROJECT ROUTES ---
router.get('/projects', authMiddleware.authenticate, projectController.list);
router.post('/projects', authMiddleware.authenticate, projectController.create);
router.get('/projects/:id', authMiddleware.authenticate, projectController.getById);
router.put('/projects/:id', authMiddleware.authenticate, projectController.update);
router.delete('/projects/:id', authMiddleware.authenticate, projectController.delete);
router.patch('/projects/:id/archive', authMiddleware.authenticate, projectController.archive);
router.patch('/projects/:id/restore', authMiddleware.authenticate, projectController.restore);
router.post('/projects/:id/duplicate', authMiddleware.authenticate, projectController.duplicate);

// --- TASK ROUTES ---
router.get('/tasks', authMiddleware.authenticate, taskController.list);
router.post('/tasks', authMiddleware.authenticate, taskController.create);
router.get('/tasks/:id', authMiddleware.authenticate, taskController.getById);
router.put('/tasks/:id', authMiddleware.authenticate, taskController.update);
router.delete('/tasks/:id', authMiddleware.authenticate, taskController.delete);
router.post('/tasks/:id/duplicate', authMiddleware.authenticate, taskController.duplicate);

// Task comments & activities
router.get('/tasks/:id/comments', authMiddleware.authenticate, taskController.getComments);
router.post('/tasks/:id/comments', authMiddleware.authenticate, taskController.addComment);
router.get('/tasks/:id/activities', authMiddleware.authenticate, taskController.getActivityLog);

// --- AI HELPER ROUTES ---
router.post('/ai/task-description', authMiddleware.authenticate, aiController.generateDescription);
router.post('/ai/predict-deadline', authMiddleware.authenticate, aiController.predictDelay);
router.post('/ai/priority-recommend', authMiddleware.authenticate, aiController.recommendPriority);
router.post('/ai/project-summary', authMiddleware.authenticate, aiController.getProjectSummary);
router.post('/ai/meeting-notes', authMiddleware.authenticate, aiController.generateMeetingNotes);

// --- REPORTS EXPORTS ROUTES ---
router.get('/reports/export', authMiddleware.authenticate, reportController.exportReport);

// --- NOTIFICATIONS ROUTES ---
router.get('/notifications', authMiddleware.authenticate, notificationController.list);
router.put('/notifications/:id/read', authMiddleware.authenticate, notificationController.read);
router.post('/notifications/read-all', authMiddleware.authenticate, notificationController.readAll);

module.exports = router;
