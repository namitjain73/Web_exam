const express = require('express');
const Voting = require('../models/Voting');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Create Voting Poll
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { tripId, title, description, options, deadline } = req.body;

    const votingOptions = options.map(option => ({
      optionId: Math.random().toString(36).substr(2, 9),
      optionText: option,
      votes: [],
      voteCount: 0
    }));

    const voting = new Voting({
      trip: tripId,
      title,
      description,
      options: votingOptions,
      createdBy: req.user.userId,
      deadline: deadline || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      status: 'active'
    });

    await voting.save();
    await voting.populate('createdBy', 'name email');

    res.json(voting);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get Trip Polls
router.get('/trip/:tripId', authMiddleware, async (req, res) => {
  try {
    const polls = await Voting.find({ trip: req.params.tripId })
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });

    res.json(polls);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Vote on Poll
router.post('/:pollId/vote', authMiddleware, async (req, res) => {
  try {
    const { optionId } = req.body;
    const voting = await Voting.findById(req.params.pollId);

    if (!voting) return res.status(404).json({ error: 'Poll not found' });
    if (voting.status !== 'active') return res.status(400).json({ error: 'Poll is closed' });

    const option = voting.options.find(o => o.optionId === optionId);
    if (!option) return res.status(404).json({ error: 'Option not found' });

    // Remove previous vote from this user
    voting.options.forEach(opt => {
      opt.votes = opt.votes.filter(v => v.toString() !== req.user.userId);
      opt.voteCount = opt.votes.length;
    });

    // Add new vote
    option.votes.push(req.user.userId);
    option.voteCount = option.votes.length;

    await voting.save();
    await voting.populate('createdBy', 'name email');

    res.json(voting);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Close Poll
router.put('/:pollId/close', authMiddleware, async (req, res) => {
  try {
    const voting = await Voting.findById(req.params.pollId);
    if (!voting) return res.status(404).json({ error: 'Poll not found' });

    if (voting.createdBy.toString() !== req.user.userId) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    voting.status = 'closed';
    await voting.save();
    await voting.populate('createdBy', 'name email');

    res.json(voting);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
