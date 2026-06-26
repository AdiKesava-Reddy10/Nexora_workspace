const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Task = sequelize ? sequelize.define('Task', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  projectId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'Pending',
    allowNull: false // Pending, In Progress, Completed, On Hold, Cancelled, Archived
  },
  priority: {
    type: DataTypes.STRING,
    defaultValue: 'Medium',
    allowNull: false // Low, Medium, High, Critical
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  deadline: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  estimatedHours: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    allowNull: false
  },
  assignedUserId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  creatorId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  isRecurring: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  recurrenceInterval: {
    type: DataTypes.STRING,
    allowNull: true // Daily, Weekly, Monthly
  },
  parentTaskId: {
    type: DataTypes.INTEGER,
    allowNull: true // references another Task for subtasks
  },
  tags: {
    type: DataTypes.TEXT,
    allowNull: true // comma separated values
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  attachments: {
    type: DataTypes.TEXT,
    allowNull: true // JSON string of attachments: [{name, url}]
  }
}, {
  timestamps: true
}) : null;

module.exports = Task;
