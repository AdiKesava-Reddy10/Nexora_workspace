const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const sequelize = require('../config/db');

// Import Sequelize models
const User = require('../models/User');
const Workspace = require('../models/Workspace');
const WorkspaceMember = require('../models/WorkspaceMember');
const Project = require('../models/Project');
const Task = require('../models/Task');
const TaskComment = require('../models/TaskComment');
const TaskActivity = require('../models/TaskActivity');
const ChatMessage = require('../models/ChatMessage');
const Notification = require('../models/Notification');

let isFallbackMode = false;
const jsonDbPath = path.join(__dirname, '../../data/db.json');

// Initialize JSON database folder if needed
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Function to read JSON Database
function readJSONDb() {
  try {
    if (!fs.existsSync(jsonDbPath)) {
      return null;
    }
    const rawData = fs.readFileSync(jsonDbPath, 'utf8');
    return JSON.parse(rawData);
  } catch (error) {
    console.error('Error reading JSON DB:', error.message);
    return null;
  }
}

// Function to write JSON Database
function writeJSONDb(data) {
  try {
    fs.writeFileSync(jsonDbPath, JSON.stringify(data, null, 2), 'utf8');
  } catch (error) {
    console.error('Error writing JSON DB:', error.message);
  }
}

// Pre-generated password hash for seed users ('password123')
const SEED_PASSWORD_HASH = bcrypt.hashSync('password123', 10);

// Default seed data
const seedData = {
  users: [
    {
      id: 1,
      name: 'Alex Carter',
      email: 'admin@nexora.com',
      password: SEED_PASSWORD_HASH,
      phone: '+1 (555) 123-4567',
      profession: 'SaaS Founder',
      organization: 'Nexora Inc.',
      skills: 'Product Strategy, Node.js, System Architecture, React',
      bio: 'Founder and Lead Architect of Nexora Workspace. Passionate about building world-class collaborative platforms.',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
      role: 'Admin',
      status: 'Offline',
      verified: true,
      otpCode: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Sarah Jenkins',
      email: 'sarah@nexora.com',
      password: SEED_PASSWORD_HASH,
      phone: '+1 (555) 987-6543',
      profession: 'Technical Product Manager',
      organization: 'Nexora Inc.',
      skills: 'Scrum, Agile, Project Delivery, User Experience',
      bio: 'Agile evangelist managing sprint workflows and project lifecycles at Nexora HQ.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      role: 'Project Manager',
      status: 'Offline',
      verified: true,
      otpCode: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 3,
      name: 'Devon Miller',
      email: 'dev@nexora.com',
      password: SEED_PASSWORD_HASH,
      phone: '+1 (555) 246-8101',
      profession: 'Full Stack Engineer',
      organization: 'Nexora Inc.',
      skills: 'React 19, Tailwind CSS, Express, MySQL, Socket.io',
      bio: 'Full stack wizard building out the core collaborative features of the workspace.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      role: 'Developer',
      status: 'Offline',
      verified: true,
      otpCode: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  workspaces: [
    {
      id: 1,
      name: 'Nexora HQ Development',
      description: 'Central workspace for Nexora platform engineering, design, and marketing teams.',
      slug: 'nexora-hq-development',
      avatar: 'https://images.unsplash.com/photo-1508962914676-134849a727f0?w=150',
      ownerId: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  workspaceMembers: [
    { id: 1, workspaceId: 1, userId: 1, role: 'Admin', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 2, workspaceId: 1, userId: 2, role: 'Project Manager', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 3, workspaceId: 1, userId: 3, role: 'Developer', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  ],
  projects: [
    {
      id: 1,
      workspaceId: 1,
      name: 'Nexora Workspace MVP',
      description: 'Develop the initial core features including user workspace selection, drag-and-drop Kanban, real-time channels, and AI assistance integrations.',
      category: 'Software Development',
      status: 'Active',
      priority: 'High',
      startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString().split('T')[0], // 5 days ago
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15).toISOString().split('T')[0], // 15 days from now
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 15).toISOString().split('T')[0],
      healthScore: 88,
      estimatedHours: 120.00,
      progress: 45,
      tags: 'v1.0.0,Development,SaaS',
      ownerId: 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 2,
      workspaceId: 1,
      name: 'Nexora Branding & Design System',
      description: 'Create premium visual assets, layout grids, animations config, logo vectors, and custom tailwind setups for glassmorphism styling.',
      category: 'Design & Branding',
      status: 'Planning',
      priority: 'Medium',
      startDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 2).toISOString().split('T')[0], // 2 days from now
      endDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().split('T')[0], // 30 days from now
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().split('T')[0],
      healthScore: 100,
      estimatedHours: 60.00,
      progress: 10,
      tags: 'Figma,UI,Design-System',
      ownerId: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  tasks: [
    {
      id: 1,
      projectId: 1,
      title: 'Setup Database and Repository Fallback Layer',
      description: 'Create a custom database repository abstraction that checks for a live MySQL connection and automatically falls back to an in-memory db.json file database if MySQL is unavailable.',
      status: 'Completed',
      priority: 'Critical',
      startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString().split('T')[0],
      deadline: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString().split('T')[0],
      estimatedHours: 16.00,
      assignedUserId: 1,
      creatorId: 1,
      isRecurring: false,
      recurrenceInterval: null,
      parentTaskId: null,
      tags: 'Backend,Database,Architecture',
      notes: 'Remember to sync file updates synchronously to protect data integrity.',
      attachments: JSON.stringify([{ name: 'db-design-schema.png', url: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400' }]),
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 2,
      projectId: 1,
      title: 'Build Socket.io Multi-Workspace Sync Engine',
      description: 'Configure socket rooms matching workspace IDs. Implement events for drag-and-drop column changes, comments additions, typing alerts, and active member counts.',
      status: 'In Progress',
      priority: 'High',
      startDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString().split('T')[0],
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 4).toISOString().split('T')[0],
      estimatedHours: 24.00,
      assignedUserId: 3,
      creatorId: 1,
      isRecurring: false,
      recurrenceInterval: null,
      parentTaskId: null,
      tags: 'Backend,WebSockets,Realtime',
      notes: 'Make sure standard HTTP polling is used as a backup fallback if WebSocket connection is interrupted.',
      attachments: null,
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 3,
      projectId: 1,
      title: 'Implement Gemini AI Smart Task Generator',
      description: 'Establish AI controller that handles prompt processing. Returns simulated descriptive lists, predictions on delay probabilities, and project summarization charts.',
      status: 'Pending',
      priority: 'High',
      startDate: new Date().toISOString().split('T')[0],
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 8).toISOString().split('T')[0],
      estimatedHours: 12.00,
      assignedUserId: 3,
      creatorId: 2,
      isRecurring: false,
      recurrenceInterval: null,
      parentTaskId: null,
      tags: 'AI,Backend,Integration',
      notes: 'Local rules-based fallback handles prompt logic if GEMINI_API_KEY is not defined.',
      attachments: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 4,
      projectId: 1,
      title: 'Design Landing Page and Onboarding System',
      description: 'Implement modern landing page including particle animation grids, aurora background animations, FAQ expanders, pricing, and login modals.',
      status: 'Pending',
      priority: 'Medium',
      startDate: new Date().toISOString().split('T')[0],
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 10).toISOString().split('T')[0],
      estimatedHours: 20.00,
      assignedUserId: 2,
      creatorId: 2,
      isRecurring: false,
      recurrenceInterval: null,
      parentTaskId: null,
      tags: 'Frontend,CSS,UIUX',
      notes: 'Must feel extremely premium. Glassmorphic shadows, hover scale transformations, Inter font family.',
      attachments: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 5,
      projectId: 1,
      title: 'Conduct Initial QA and Client Testing',
      description: 'Sub-task for testing core login/logout validation, task checklist updates, and spreadsheet downloads.',
      status: 'Pending',
      priority: 'Low',
      startDate: new Date().toISOString().split('T')[0],
      deadline: new Date(Date.now() + 1000 * 60 * 60 * 24 * 12).toISOString().split('T')[0],
      estimatedHours: 8.00,
      assignedUserId: 2,
      creatorId: 1,
      isRecurring: false,
      recurrenceInterval: null,
      parentTaskId: 1, // Sub-task of Task 1
      tags: 'QA,Testing',
      notes: null,
      attachments: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ],
  comments: [
    {
      id: 1,
      taskId: 2,
      userId: 1,
      commentText: 'Make sure typing indicators are restricted to users viewing the active task card.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString()
    },
    {
      id: 2,
      taskId: 2,
      userId: 3,
      commentText: 'Working on it! Sockets are configured to broadcast within a task-specific room.',
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
    }
  ],
  activities: [
    { id: 1, taskId: 1, userId: 1, activityType: 'Create', details: 'Task created', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString() },
    { id: 2, taskId: 1, userId: 1, activityType: 'StatusChange', details: 'Changed status to Completed', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() },
    { id: 3, taskId: 2, userId: 1, activityType: 'Create', details: 'Task created', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() },
    { id: 4, taskId: 2, userId: 3, activityType: 'StatusChange', details: 'Changed status to In Progress', createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() }
  ],
  messages: [
    { id: 1, workspaceId: 1, senderId: 1, recipientId: null, groupId: 'general', messageText: 'Welcome everyone to the Nexora HQ Workspace! This is where we coordinate and build.', reactions: JSON.stringify({ "🎉": [1, 2, 3] }), createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString() },
    { id: 2, workspaceId: 1, senderId: 2, recipientId: null, groupId: 'general', messageText: 'Thanks Alex! Excited to collaborate on our MVP sprint.', reactions: null, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() },
    { id: 3, workspaceId: 1, senderId: 3, recipientId: null, groupId: 'general', messageText: 'API configurations are looking solid. DB fallback is fully operational.', reactions: JSON.stringify({ "👍": [1] }), createdAt: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString() }
  ],
  notifications: [
    { id: 1, userId: 3, title: 'Task Assigned', message: 'Alex Carter assigned you to task "Build Socket.io Multi-Workspace Sync Engine".', type: 'Task', isRead: false, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() },
    { id: 2, userId: 2, title: 'Project Health Update', message: 'Project "Nexora Workspace MVP" health score updated to 88%.', type: 'Project', isRead: true, createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 1).toISOString() }
  ]
};

// Main initializer function
async function initializeDatabase() {
  if (sequelize) {
    try {
      await sequelize.authenticate();
      console.log('Successfully connected to MySQL database via Sequelize.');
      
      // Sync models with MySQL database
      await sequelize.sync({ force: false }); // Change to true in dev if schema changes often
      console.log('MySQL Database synchronized.');

      // Check if tables are empty, and seed if they are
      const userCount = await User.count();
      if (userCount === 0) {
        console.log('MySQL tables are empty. Seeding default data...');
        // Insert users
        await User.bulkCreate(seedData.users);
        // Insert workspaces
        await Workspace.bulkCreate(seedData.workspaces);
        // Insert workspace members
        await WorkspaceMember.bulkCreate(seedData.workspaceMembers);
        // Insert projects
        await Project.bulkCreate(seedData.projects);
        // Insert tasks
        await Task.bulkCreate(seedData.tasks);
        // Insert comments
        await TaskComment.bulkCreate(seedData.comments);
        // Insert activities
        await TaskActivity.bulkCreate(seedData.activities);
        // Insert chat messages
        await ChatMessage.bulkCreate(seedData.messages);
        // Insert notifications
        await Notification.bulkCreate(seedData.notifications);
        console.log('MySQL Database seeded successfully!');
      }
      isFallbackMode = false;
    } catch (error) {
      console.warn('MySQL Database connection failed. Entering JSON Fallback Mode.', error.message);
      isFallbackMode = true;
      setupJSONFallback();
    }
  } else {
    console.warn('Sequelize was not initialized. Entering JSON Fallback Mode.');
    isFallbackMode = true;
    setupJSONFallback();
  }
}

// Setup local JSON File Database
function setupJSONFallback() {
  console.log(`Checking local JSON store at ${jsonDbPath}...`);
  const data = readJSONDb();
  if (!data) {
    console.log('JSON DB does not exist. Initializing JSON DB with seed data...');
    writeJSONDb(seedData);
    console.log('JSON DB initialized and seeded successfully.');
  } else {
    console.log('JSON DB successfully loaded with existing records.');
  }
}

// Immediate execution trigger for setup
initializeDatabase();

// Export fallback status and database methods
module.exports = {
  isFallback: () => isFallbackMode,
  sequelize,
  getModels: () => ({
    User, Workspace, WorkspaceMember, Project, Task, TaskComment, TaskActivity, ChatMessage, Notification
  }),
  readJSONDb,
  writeJSONDb
};
