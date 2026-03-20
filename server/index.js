const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');

// Route files
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const leaveRoutes = require('./routes/leaveRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const taskRoutes = require('./routes/taskRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const documentRoutes = require('./routes/documentRoutes');
const reportRoutes = require('./routes/reportRoutes');

// Load environment variables resolving paths explicitly to server directory avoiding execution CWD failures
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB Connection
console.log('Attempting to securely connect to MongoDB Atlas cluster...');
mongoose.connect(process.env.MONGO_URI, {
  serverSelectionTimeoutMS: 5000 // Avoids infinite silent hangs
})
  .then(() => {
    console.log('MongoDB connection established successfully');
  })
  .catch((error) => {
    console.error('CRITICAL ERROR connecting to MongoDB! Make sure your IP is explicitly whitelisted inside your MongoDB Atlas Network Access Panel:', error.message);
  });

// Test API Route
app.get('/api/test', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running and test API route is working correctly.'
  });
});

// Notification Route
const notificationRoutes = require('./routes/notificationRoutes');

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/leaves', leaveRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/documents', documentRoutes);
app.use('/api/reports', reportRoutes);

// Socket.io Setup
const http = require('http');
const { Server } = require('socket.io');

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all for dev, restrict in production
    methods: ['GET', 'POST']
  }
});

// Store active users: userId -> socketId
const userSockets = new Map();

io.on('connection', (socket) => {
  console.log(`Socket connected: ${socket.id}`);

  socket.on('register', (userId) => {
    userSockets.set(userId, socket.id);
    console.log(`User ${userId} registered with socket ${socket.id}`);
  });

  socket.on('disconnect', () => {
    // Remove the disconnected socket
    for (let [userId, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        userSockets.delete(userId);
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
});

// Make io accessible to our router/controllers
app.set('io', io);
app.set('userSockets', userSockets);

// Start Server
server.listen(PORT, () => {
  console.log(`Server is running with Socket.io on port: ${PORT}`);
});
