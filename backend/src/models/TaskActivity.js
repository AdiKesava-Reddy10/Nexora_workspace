const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const TaskActivity = sequelize ? sequelize.define('TaskActivity', {
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
  activityType: {
    type: DataTypes.STRING,
    allowNull: false // Create, StatusChange, PriorityChange, AssignmentChange, CommentAdded, SubtaskAdded
  },
  details: {
    type: DataTypes.TEXT,
    allowNull: true // detail string like "Changed status from Pending to In Progress"
  }
}, {
  timestamps: true,
  updatedAt: false // Only createdAt is needed for activity logs
}) : null;

module.exports = TaskActivity;
