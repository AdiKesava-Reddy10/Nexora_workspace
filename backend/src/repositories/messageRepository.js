const db = require('./db');

const messageRepository = {
  async create(msgData) {
    if (db.isFallback()) {
      const data = db.readJSONDb();
      const newId = data.messages.length > 0 ? Math.max(...data.messages.map(m => m.id)) + 1 : 1;
      const newMsg = {
        id: newId,
        recipientId: msgData.recipientId || null,
        groupId: msgData.groupId || 'general',
        attachments: msgData.attachments || null,
        reactions: msgData.reactions || null,
        ...msgData,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      data.messages.push(newMsg);
      db.writeJSONDb(data);

      const sender = data.users.find(u => u.id === msgData.senderId);
      return {
        ...newMsg,
        sender: sender ? { name: sender.name, avatar: sender.avatar } : null
      };
    } else {
      const { ChatMessage, User } = db.getModels();
      const msg = await ChatMessage.create(msgData);
      const sender = await User.findByPk(msgData.senderId);
      return {
        ...msg.toJSON(),
        sender: sender ? { name: sender.name, avatar: sender.avatar } : null
      };
    }
  },

  async findAll(filters = {}) {
    const workspaceId = parseInt(filters.workspaceId, 10);
    const groupId = filters.groupId || null;
    const senderId = filters.senderId ? parseInt(filters.senderId, 10) : null;
    const recipientId = filters.recipientId ? parseInt(filters.recipientId, 10) : null;

    if (db.isFallback()) {
      const data = db.readJSONDb();
      if (!data || !data.messages) return [];
      
      let list = data.messages.filter(m => m.workspaceId === workspaceId);
      
      if (groupId) {
        list = list.filter(m => m.groupId === groupId && !m.recipientId);
      } else if (senderId && recipientId) {
        // Direct messages between user A and user B
        list = list.filter(m => 
          (m.senderId === senderId && m.recipientId === recipientId) ||
          (m.senderId === recipientId && m.recipientId === senderId)
        );
      }

      // Sort by oldest first for chat flow
      list.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

      return list.map(m => {
        const sender = data.users.find(u => u.id === m.senderId);
        return {
          ...m,
          sender: sender ? { name: sender.name, avatar: sender.avatar } : null
        };
      });
    } else {
      const { ChatMessage, User } = db.getModels();
      const { Op } = require('sequelize');
      const whereClause = { workspaceId };
      
      if (groupId) {
        whereClause.groupId = groupId;
        whereClause.recipientId = null;
      } else if (senderId && recipientId) {
        whereClause[Op.or] = [
          { senderId, recipientId },
          { senderId: recipientId, recipientId: senderId }
        ];
      }

      const list = await ChatMessage.findAll({
        where: whereClause,
        order: [['createdAt', 'ASC']]
      });

      const results = [];
      for (const m of list) {
        const sender = await User.findByPk(m.senderId);
        results.push({
          ...m.toJSON(),
          sender: sender ? { name: sender.name, avatar: sender.avatar } : null
        });
      }
      return results;
    }
  }
};

module.exports = messageRepository;
