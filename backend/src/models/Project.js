const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Project = sequelize ? sequelize.define('Project', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  workspaceId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category: {
    type: DataTypes.STRING,
    defaultValue: 'General',
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'Active',
    allowNull: false // Planning, Active, Completed, On Hold, Cancelled, Archived
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
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  deadline: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  healthScore: {
    type: DataTypes.INTEGER,
    defaultValue: 100,
    allowNull: false
  },
  estimatedHours: {
    type: DataTypes.DECIMAL(10, 2),
    defaultValue: 0.00,
    allowNull: false
  },
  progress: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false // 0 to 100
  },
  tags: {
    type: DataTypes.TEXT,
    allowNull: true // comma separated values
  },
  ownerId: {
    type: DataTypes.INTEGER,
    allowNull: false
  }
}, {
  timestamps: true
}) : null;

module.exports = Project;
