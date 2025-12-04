const mongoose = require('mongoose');

const tripSchema = new mongoose.Schema({
  title: { type: String, required: true },
  destination: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  description: String,
  coverImage: String,
  organizer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    role: { type: String, enum: ['admin', 'editor', 'viewer'], default: 'editor' },
    joinedAt: { type: Date, default: Date.now },
    currency: { type: String, default: 'USD' }
  }],
  inviteCode: { type: String, unique: true },
  inviteLink: String,
  status: { type: String, enum: ['planning', 'ongoing', 'completed'], default: 'planning' },
  visibility: { type: String, enum: ['private', 'public'], default: 'private' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Trip', tripSchema);
