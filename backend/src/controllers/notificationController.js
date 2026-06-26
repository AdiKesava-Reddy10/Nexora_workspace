const notificationRepository = require('../repositories/notificationRepository');

const notificationController = {
  // Get all notifications for current user
  async list(req, res) {
    try {
      const list = await notificationRepository.findAllByUserId(req.user.id);
      return res.status(200).json({
        success: true,
        notifications: list
      });
    } catch (error) {
      console.error('List notifications error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error listing notifications.'
      });
    }
  },

  // Mark notification as read
  async read(req, res) {
    try {
      const notif = await notificationRepository.markAsRead(req.params.id);
      if (!notif) {
        return res.status(404).json({
          success: false,
          message: 'Notification not found.'
        });
      }
      return res.status(200).json({
        success: true,
        message: 'Notification marked as read.',
        notification: notif
      });
    } catch (error) {
      console.error('Read notification error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error updating notification.'
      });
    }
  },

  // Mark all as read
  async readAll(req, res) {
    try {
      const updatedCount = await notificationRepository.markAllAsRead(req.user.id);
      return res.status(200).json({
        success: true,
        message: 'All notifications marked as read.',
        updatedCount
      });
    } catch (error) {
      console.error('Read all notifications error:', error.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error updating notifications.'
      });
    }
  }
};

module.exports = notificationController;
