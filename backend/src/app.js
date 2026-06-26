const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Initialize DB switcher (runs database initialization immediately)
const db = require('./repositories/db');
const apiRoutes = require('./routes/api');
const messageRepository = require('./repositories/messageRepository');

const app = express();
const server = http.createServer(app);

// Initialize WebSockets
const io = socketIo(server, {
  cors: {
    origin: '*', // In production, refine to specific domains
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
  }
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Rate Limiter to prevent brute force/DOS
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP. Please try again after 15 minutes.'
  }
});
app.use('/api/', limiter);

// API Routes
app.use('/api', apiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'Operational',
    databaseMode: db.isFallback() ? 'JSON Fallback File' : 'MySQL Cloud (Sequelize)',
    timestamp: new Date().toISOString()
  });
});

// 404 Route handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: 'Resource not found. Verify the URL path.'
  });
});

// Centralized error boundary middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.message);
  res.status(500).json({
    success: false,
    message: 'An unexpected error occurred on the server.',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Real-Time Socket.io Coordination
io.on('connection', (socket) => {
  console.log(`WebSocket client connected: ${socket.id}`);

  // Join workspace room
  socket.on('join_workspace', ({ workspaceId, userId }) => {
    socket.join(`workspace_${workspaceId}`);
    console.log(`User #${userId} joined room workspace_${workspaceId}`);
    
    // Broadcast active status
    io.to(`workspace_${workspaceId}`).emit('user_joined_workspace', { userId });
  });

  // Typing indicators
  socket.on('typing', ({ workspaceId, userId, userName, groupId }) => {
    socket.to(`workspace_${workspaceId}`).emit('user_typing', { userId, userName, groupId });
  });

  // Stop typing indicator
  socket.on('stop_typing', ({ workspaceId, userId, groupId }) => {
    socket.to(`workspace_${workspaceId}`).emit('user_stopped_typing', { userId, groupId });
  });

  // Chat message broadcasting
  socket.on('send_message', async (data) => {
    try {
      const { workspaceId, senderId, messageText, groupId, recipientId } = data;
      
      // Save message to repository
      const savedMsg = await messageRepository.create({
        workspaceId,
        senderId,
        messageText,
        groupId,
        recipientId
      });

      // Broadcast to room
      io.to(`workspace_${workspaceId}`).emit('new_message', savedMsg);
    } catch (err) {
      console.error('Error broadcasting chat message:', err.message);
    }
  });

  // Kanban update broadcasting (triggered when a task moves columns)
  socket.on('update_kanban', ({ workspaceId, taskId, sourceStatus, targetStatus, userId }) => {
    console.log(`Task #${taskId} moved from ${sourceStatus} to ${targetStatus} in workspace #${workspaceId}`);
    
    // Broadcast status change to notify other users
    socket.to(`workspace_${workspaceId}`).emit('kanban_updated', {
      taskId,
      sourceStatus,
      targetStatus,
      userId
    });
  });

  // General task updates (edits, creations)
  socket.on('task_updated', ({ workspaceId, taskId, userId }) => {
    socket.to(`workspace_${workspaceId}`).emit('task_refreshed', { taskId, userId });
  });

  // Disconnection handler
  socket.on('disconnect', () => {
    console.log(`WebSocket client disconnected: ${socket.id}`);
  });
});

// Boot listening server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`  Nexora Workspace Server booted!         `);
  console.log(`  Running on: http://localhost:${PORT}     `);
  console.log(`  Environment: ${process.env.NODE_ENV}   `);
  console.log(`=========================================`);
});

module.exports = server; // Exporting for integration tests
