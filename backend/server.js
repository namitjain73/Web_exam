const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const http = require('http');
const socketIO = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: process.env.NODE_ENV === 'development' ? '*' : ['http://localhost:5173'],
    credentials: true
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Database Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/trips', require('./routes/trips'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/itinerary', require('./routes/itinerary'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/voting', require('./routes/voting'));
app.use('/api/settlements', require('./routes/settlements'));

// Socket.io Events
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('join-trip', (tripId) => {
    socket.join(`trip-${tripId}`);
    socket.broadcast.to(`trip-${tripId}`).emit('user-joined', {
      userId: socket.id,
      message: 'A user joined the trip'
    });
  });

  socket.on('expense-added', (data) => {
    io.to(`trip-${data.tripId}`).emit('expense-updated', data);
  });

  socket.on('activity-added', (data) => {
    io.to(`trip-${data.tripId}`).emit('activity-updated', data);
  });

  socket.on('expense-deleted', (data) => {
    io.to(`trip-${data.tripId}`).emit('expense-removed', data);
  });

  socket.on('settlement-marked', (data) => {
    io.to(`trip-${data.tripId}`).emit('settlement-updated', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
