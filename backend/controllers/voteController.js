import Vote from "../models/Vote.js";
import Trip from "../models/Trip.js";

export const createVote = async (req, res) => {
  try {
    const { tripId, question, options, expiresAt } = req.body;
    const userId = req.user;

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    // Check if user is a member
    const isMember = trip.members.some(
      (m) => m.user.toString() === userId.toString()
    );

    if (!isMember) {
      return res.status(403).json({ message: "Not a member of this trip" });
    }

    if (!options || options.length < 2) {
      return res.status(400).json({ message: "At least 2 options required" });
    }

    const voteOptions = options.map((opt) => ({
      text: opt,
      votes: []
    }));

    const vote = await Vote.create({
      trip: tripId,
      question,
      options: voteOptions,
      createdBy: userId,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      isActive: true
    });

    const populatedVote = await Vote.findById(vote._id)
      .populate("createdBy", "name email")
      .populate("options.votes.user", "name email");

    return res.status(201).json({
      message: "Vote created successfully",
      vote: populatedVote
    });
  } catch (err) {
    return res.status(500).json({ message: "Error creating vote", error: err.message });
  }
};

export const getTripVotes = async (req, res) => {
  try {
    const { tripId } = req.params;

    const votes = await Vote.find({ trip: tripId, isActive: true })
      .populate("createdBy", "name email")
      .populate("options.votes.user", "name email")
      .sort({ createdAt: -1 });

    return res.json({ votes });
  } catch (err) {
    return res.status(500).json({ message: "Error fetching votes", error: err.message });
  }
};

export const castVote = async (req, res) => {
  try {
    const { voteId } = req.params;
    const { optionIndex } = req.body;
    const userId = req.user;

    const vote = await Vote.findById(voteId);
    if (!vote) {
      return res.status(404).json({ message: "Vote not found" });
    }

    if (!vote.isActive) {
      return res.status(400).json({ message: "Vote is no longer active" });
    }

    if (vote.expiresAt && new Date() > vote.expiresAt) {
      vote.isActive = false;
      await vote.save();
      return res.status(400).json({ message: "Vote has expired" });
    }

    if (optionIndex < 0 || optionIndex >= vote.options.length) {
      return res.status(400).json({ message: "Invalid option index" });
    }

    // Remove existing vote from this user
    vote.options.forEach((option) => {
      option.votes = option.votes.filter(
        (v) => v.user.toString() !== userId.toString()
      );
    });

    // Add new vote
    vote.options[optionIndex].votes.push({
      user: userId,
      votedAt: new Date()
    });

    await vote.save();

    const populatedVote = await Vote.findById(vote._id)
      .populate("createdBy", "name email")
      .populate("options.votes.user", "name email");

    return res.json({
      message: "Vote cast successfully",
      vote: populatedVote
    });
  } catch (err) {
    return res.status(500).json({ message: "Error casting vote", error: err.message });
  }
};

