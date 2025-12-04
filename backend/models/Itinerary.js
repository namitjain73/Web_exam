const mongoose = require('mongoose');

const itinerarySchema = new mongoose.Schema({
  trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
  date: { type: Date, required: true },
  activities: [{
    id: String,
    title: { type: String, required: true },
    description: String,
    location: String,
    startTime: Date,
    endTime: Date,
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    status: { type: String, enum: ['planned', 'confirmed', 'completed', 'cancelled'], default: 'planned' },
    attachments: [String],
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    votingPoll: { type: mongoose.Schema.Types.ObjectId, ref: 'Voting' },
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Itinerary', itinerarySchema);
