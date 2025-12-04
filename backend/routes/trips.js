const express = require('express');
const Trip = require('../models/Trip');
const authMiddleware = require('../middleware/auth');
const crypto = require('crypto');

const router = express.Router();

// Create Trip
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { title, destination, startDate, endDate, description, coverImage } = req.body;

    console.log('Create trip request:', { title, destination, startDate, endDate });

    if (!title || !destination || !startDate || !endDate) {
      return res.status(400).json({ error: 'Missing required fields: title, destination, startDate, endDate' });
    }

    const inviteCode = crypto.randomBytes(6).toString('hex').toUpperCase();
    const inviteLink = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/join/${inviteCode}`;

    const trip = new Trip({
      title,
      destination,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      description,
      coverImage,
      organizer: req.user.userId,
      inviteCode,
      inviteLink,
      members: [{ userId: req.user.userId, role: 'admin' }]
    });

    await trip.save();
    await trip.populate('members.userId', 'name email');

    console.log('Trip created successfully:', trip._id);

    res.json(trip);
  } catch (error) {
    console.error('Create trip error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get User's Trips
router.get('/', authMiddleware, async (req, res) => {
  try {
    const trips = await Trip.find({
      'members.userId': req.user.userId
    }).populate('organizer', 'name email').populate('members.userId', 'name email');

    res.json(trips);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Trip by ID
router.get('/:tripId', authMiddleware, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId)
      .populate('organizer', 'name email')
      .populate('members.userId', 'name email');

    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    res.json(trip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Join Trip
router.post('/join/:inviteCode', authMiddleware, async (req, res) => {
  try {
    const trip = await Trip.findOne({ inviteCode: req.params.inviteCode });
    if (!trip) return res.status(404).json({ error: 'Invalid invite code' });

    const memberExists = trip.members.find(m => m.userId.toString() === req.user.userId);
    if (memberExists) return res.status(400).json({ error: 'Already a member' });

    trip.members.push({ userId: req.user.userId, role: 'editor' });
    await trip.save();
    await trip.populate('members.userId', 'name email');

    res.json(trip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Trip
router.put('/:tripId', authMiddleware, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    const isAdmin = trip.members.find(m => 
      m.userId.toString() === req.user.userId && m.role === 'admin'
    );
    if (!isAdmin) return res.status(403).json({ error: 'Not authorized' });

    Object.assign(trip, req.body);
    trip.updatedAt = Date.now();
    await trip.save();

    res.json(trip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Member Role
router.put('/:tripId/members/:memberId', authMiddleware, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    const isAdmin = trip.members.find(m => 
      m.userId.toString() === req.user.userId && m.role === 'admin'
    );
    if (!isAdmin) return res.status(403).json({ error: 'Not authorized' });

    const member = trip.members.find(m => m._id.toString() === req.params.memberId);
    if (!member) return res.status(404).json({ error: 'Member not found' });

    member.role = req.body.role;
    await trip.save();

    res.json(trip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Remove Member
router.delete('/:tripId/members/:memberId', authMiddleware, async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) return res.status(404).json({ error: 'Trip not found' });

    const isAdmin = trip.members.find(m => 
      m.userId.toString() === req.user.userId && m.role === 'admin'
    );
    if (!isAdmin) return res.status(403).json({ error: 'Not authorized' });

    trip.members = trip.members.filter(m => m._id.toString() !== req.params.memberId);
    await trip.save();

    res.json(trip);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
