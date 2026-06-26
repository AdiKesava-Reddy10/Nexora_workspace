const db = require('./db');

const notificationRepository = {
  async create(notifData) {
    if (db.isFallback()) {
      const data = db.readJSONDb();
      const newId = data.notifications.length > 0 ? Math.max(...data.notifications.map(n => n.id)) + 1 : 1;
      const newNotif = {
        id: newId,
        isRead: false,
        type: notifData.type || 'System',
        ...notifData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      data.notifications.push(newNotif);
      db.writeJSONDb(data);
      return { ...newNotif };
    } else {
      const { Notification } = db.getModels();
      const notif = await Notification.create(notifData);
      return notif.toJSON();
    }
  },

  async findAllByUserId(userId) {
    const intUserId = parseInt(userId, 10);
    if (db.isFallback()) {
      const data = db.readJSONDb();
      if (!data || !data.notifications) return [];
      
      const list = data.notifications.filter(n => n.userId === intUserId);
      // Sort newest first
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return list;
    } else {
      const { Notification } = db.getModels();
      const list = await Notification.findAll({
        where: { userId: intUserId },
        order: [['createdAt', 'DESC']]
      });
      return list.map(n => n.toJSON());
    }
  },

  async markAsRead(id) {
    const intId = parseInt(id, 10);
    if (db.isFallback()) {
      const data = db.readJSONDb();
      const notif = data.notifications.find(n => n.id === intId);
      if (!notif) return null;
      notif.isRead = true;
      notif.updatedAt = new Date().toISOString();
      db.writeJSONDb(data);
      return { ...notif };
    } else {
      const { Notification } = db.getModels();
      const notif = await Notification.findByPk(intId);
      if (!notif) return null;
      await notif.update({ isRead: true });
      return notif.toJSON();
    }
  },

  async markAllAsRead(userId) {
    const intUserId = parseInt(userId, 10);
    if (db.isFallback()) {
      const data = db.readJSONDb();
      let updatedCount = 0;
      data.notifications.forEach(n => {
        if (n.userId === intUserId && !n.isRead) {
          n.isRead = true;
          n.updatedAt = new Date().toISOString();
          updatedCount++;
        }
      });
      if (updatedCount > 0) {
        db.writeJSONDb(data);
      }
      return updatedCount;
    } else {
      const { Notification } = db.getModels();
      const [updatedRows] = await Notification.update(
        { isRead: true },
        { where: { userId: intUserId, isRead: false } }
      );
      return updatedRows;
    }
  }
};

module.exports = notificationRepository;
