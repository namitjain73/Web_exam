const mongoose = require('mongoose');

const votingSchema = new mongoose.Schema({
  trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
  title: { type: String, required: true },
  description: String,
  options: [{
    optionId: String,
    optionText: { type: String, required: true },
    votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    voteCount: { type: Number, default: 0 }
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  linkedActivity: { type: mongoose.Schema.Types.ObjectId, ref: 'Itinerary' },
  status: { type: String, enum: ['active', 'closed'], default: 'active' },
  deadline: Date,
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Voting', votingSchema);
