const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const WorkspaceMember = sequelize ? sequelize.define('WorkspaceMember', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  workspaceId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'Developer',
    allowNull: false // Admin, Project Manager, Team Lead, Developer, Student, Freelancer, Viewer
  }
}, {
  timestamps: true
}) : null;

module.exports = WorkspaceMember;
