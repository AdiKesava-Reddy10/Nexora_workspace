const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const TaskComment = sequelize ? sequelize.define('TaskComment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  taskId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  commentText: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  timestamps: true
}) : null;

module.exports = TaskComment;
