const express = require('express');
const Document = require('../models/Document');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Upload Document
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { tripId, filename, fileUrl, fileType, description, itineraryDate } = req.body;

    const document = new Document({
      trip: tripId,
      filename,
      fileUrl,
      fileType,
      description,
      itineraryDate,
      uploadedBy: req.user.userId
    });

    await document.save();
    await document.populate('uploadedBy', 'name email');

    res.json(document);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Trip Documents
router.get('/trip/:tripId', authMiddleware, async (req, res) => {
  try {
    const documents = await Document.find({ trip: req.params.tripId })
      .populate('uploadedBy', 'name email')
      .sort({ uploadedAt: -1 });

    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Documents by Date
router.get('/trip/:tripId/date/:date', authMiddleware, async (req, res) => {
  try {
    const startDate = new Date(req.params.date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(req.params.date);
    endDate.setHours(23, 59, 59, 999);

    const documents = await Document.find({
      trip: req.params.tripId,
      itineraryDate: { $gte: startDate, $lte: endDate }
    }).populate('uploadedBy', 'name email');

    res.json(documents);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete Document
router.delete('/:documentId', authMiddleware, async (req, res) => {
  try {
    const document = await Document.findById(req.params.documentId);
    if (!document) return res.status(404).json({ error: 'Document not found' });

    if (document.uploadedBy.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await Document.findByIdAndDelete(req.params.documentId);
    res.json({ message: 'Document deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
