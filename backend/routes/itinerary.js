const express = require('express');
const Itinerary = require('../models/Itinerary');
const authMiddleware = require('../middleware/auth');
const { v4: uuidv4 } = require('uuid') || { v4: () => Math.random().toString(36).substr(2, 9) };

const router = express.Router();

// Get Itinerary for Trip
router.get('/trip/:tripId', authMiddleware, async (req, res) => {
  try {
    const itineraries = await Itinerary.find({ trip: req.params.tripId })
      .populate('activities.addedBy', 'name email')
      .populate('activities.participants', 'name email')
      .sort({ date: 1 });

    res.json(itineraries);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add Activity to Itinerary
router.post('/activity', authMiddleware, async (req, res) => {
  try {
    const { tripId, date, title, description, location, startTime, endTime, priority, participants } = req.body;

    let itinerary = await Itinerary.findOne({ 
      trip: tripId,
      date: new Date(date).toDateString()
    });

    const activity = {
      id: uuidv4? uuidv4() : Math.random().toString(36).substr(2, 9),
      title,
      description,
      location,
      startTime,
      endTime,
      addedBy: req.user.userId,
      priority: priority || 'medium',
      status: 'planned',
      participants: participants || [req.user.userId],
      createdAt: Date.now()
    };

    if (!itinerary) {
      itinerary = new Itinerary({
        trip: tripId,
        date: new Date(date),
        activities: [activity]
      });
    } else {
      itinerary.activities.push(activity);
    }

    await itinerary.save();
    await itinerary.populate('activities.addedBy', 'name email');
    await itinerary.populate('activities.participants', 'name email');

    res.json(itinerary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update Activity
router.put('/activity/:tripId/:activityId', authMiddleware, async (req, res) => {
  try {
    const itinerary = await Itinerary.findOne({ 
      trip: req.params.tripId,
      'activities.id': req.params.activityId
    });

    if (!itinerary) return res.status(404).json({ error: 'Activity not found' });

    const activity = itinerary.activities.find(a => a.id === req.params.activityId);
    Object.assign(activity, req.body);
    activity.updatedAt = Date.now();

    await itinerary.save();
    await itinerary.populate('activities.addedBy', 'name email');
    await itinerary.populate('activities.participants', 'name email');

    res.json(itinerary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete Activity
router.delete('/activity/:tripId/:activityId', authMiddleware, async (req, res) => {
  try {
    const itinerary = await Itinerary.findOne({ 
      trip: req.params.tripId,
      'activities.id': req.params.activityId
    });

    if (!itinerary) return res.status(404).json({ error: 'Activity not found' });

    itinerary.activities = itinerary.activities.filter(a => a.id !== req.params.activityId);
    await itinerary.save();

    res.json(itinerary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reorder Activities
router.post('/reorder', authMiddleware, async (req, res) => {
  try {
    const { tripId, activities } = req.body;

    let itinerary = await Itinerary.findOne({ trip: tripId });
    if (!itinerary) return res.status(404).json({ error: 'Itinerary not found' });

    itinerary.activities = activities;
    await itinerary.save();
    await itinerary.populate('activities.addedBy', 'name email');
    await itinerary.populate('activities.participants', 'name email');

    res.json(itinerary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
