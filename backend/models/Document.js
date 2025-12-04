const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  trip: { type: mongoose.Schema.Types.ObjectId, ref: 'Trip', required: true },
  itineraryDate: Date,
  filename: { type: String, required: true },
  fileUrl: { type: String, required: true },
  fileType: { type: String, enum: ['ticket', 'booking', 'id', 'receipt', 'other'], default: 'other' },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  description: String,
  linkedActivity: { type: mongoose.Schema.Types.ObjectId, ref: 'Itinerary' },
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Document', documentSchema);
