const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// We will only define models if sequelize is successfully loaded
const User = sequelize ? sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  },
  phone: {
    type: DataTypes.STRING,
    allowNull: true
  },
  profession: {
    type: DataTypes.STRING,
    allowNull: true
  },
  organization: {
    type: DataTypes.STRING,
    allowNull: true
  },
  skills: {
    type: DataTypes.TEXT,
    allowNull: true // comma separated values
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  avatar: {
    type: DataTypes.STRING,
    allowNull: true
  },
  role: {
    type: DataTypes.STRING,
    defaultValue: 'Developer',
    allowNull: false // Admin, Project Manager, Team Lead, Developer, Student, Freelancer, Viewer
  },
  status: {
    type: DataTypes.STRING,
    defaultValue: 'Offline',
    allowNull: false // Online, Offline
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  otpCode: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  timestamps: true
}) : null;

module.exports = User;
