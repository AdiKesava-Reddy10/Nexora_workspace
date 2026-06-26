const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const ChatMessage = sequelize ? sequelize.define('ChatMessage', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  workspaceId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  recipientId: {
    type: DataTypes.INTEGER,
    allowNull: true // Null if sending to a group/channel channel
  },
  groupId: {
    type: DataTypes.STRING,
    allowNull: true,
    defaultValue: 'general' // Group channel name (e.g. 'general', 'announcements', 'development')
  },
  messageText: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  attachments: {
    type: DataTypes.TEXT,
    allowNull: true // JSON string of attachments: [{name, url}]
  },
  reactions: {
    type: DataTypes.TEXT,
    allowNull: true // JSON string of emoji reactions: { "👍": [userIds], "❤️": [userIds] }
  }
}, {
  timestamps: true
}) : null;

module.exports = ChatMessage;
