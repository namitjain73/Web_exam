import Trip from "../models/Trip.js";
import User from "../models/User.js";

export const createTrip = async (req, res) => {
  try {
    const { name, destination, startDate, endDate, coverImage, currency } = req.body;
    const organizerId = req.user;

    if (!name || !destination || !startDate || !endDate) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const trip = await Trip.create({
      name,
      destination,
      startDate,
      endDate,
      coverImage: coverImage || "",
      organizer: organizerId,
      currency: currency || "USD",
      members: [
        {
          user: organizerId,
          role: "admin"
        }
      ]
    });

    const populatedTrip = await Trip.findById(trip._id)
      .populate("organizer", "name email")
      .populate("members.user", "name email");

    return res.status(201).json({
      message: "Trip created successfully",
      trip: populatedTrip
    });
  } catch (err) {
    return res.status(500).json({ message: "Error creating trip", error: err.message });
  }
};

export const getTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const trip = await Trip.findById(tripId)
      .populate("organizer", "name email")
      .populate("members.user", "name email");

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    // Check if user is a member
    const isMember = trip.members.some(
      (m) => m.user._id.toString() === req.user.toString()
    );

    if (!isMember) {
      return res.status(403).json({ message: "Not a member of this trip" });
    }

    return res.json({ trip });
  } catch (err) {
    return res.status(500).json({ message: "Error fetching trip", error: err.message });
  }
};

export const getUserTrips = async (req, res) => {
  try {
    const userId = req.user;
    const trips = await Trip.find({
      $or: [
        { organizer: userId },
        { "members.user": userId }
      ]
    })
      .populate("organizer", "name email")
      .populate("members.user", "name email")
      .sort({ createdAt: -1 });

    return res.json({ trips });
  } catch (err) {
    return res.status(500).json({ message: "Error fetching trips", error: err.message });
  }
};

export const joinTrip = async (req, res) => {
  try {
    const { joinCode } = req.body;
    const userId = req.user;

    const trip = await Trip.findOne({ joinCode: joinCode.toUpperCase() });

    if (!trip) {
      return res.status(404).json({ message: "Invalid join code" });
    }

    // Check if already a member
    const isMember = trip.members.some(
      (m) => m.user.toString() === userId.toString()
    );

    if (isMember) {
      return res.status(400).json({ message: "Already a member of this trip" });
    }

    trip.members.push({
      user: userId,
      role: "viewer"
    });

    await trip.save();

    const populatedTrip = await Trip.findById(trip._id)
      .populate("organizer", "name email")
      .populate("members.user", "name email");

    return res.json({
      message: "Joined trip successfully",
      trip: populatedTrip
    });
  } catch (err) {
    return res.status(500).json({ message: "Error joining trip", error: err.message });
  }
};

export const updateMemberRole = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { userId, role } = req.body;
    const currentUserId = req.user;

    const trip = await Trip.findById(tripId);

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    // Check if current user is admin
    const currentUserMember = trip.members.find(
      (m) => m.user.toString() === currentUserId.toString()
    );

    if (!currentUserMember || currentUserMember.role !== "admin") {
      return res.status(403).json({ message: "Only admins can update roles" });
    }

    const member = trip.members.find(
      (m) => m.user.toString() === userId.toString()
    );

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    member.role = role;
    await trip.save();

    return res.json({ message: "Role updated successfully", trip });
  } catch (err) {
    return res.status(500).json({ message: "Error updating role", error: err.message });
  }
};

export const finalizeTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const userId = req.user;

    const trip = await Trip.findById(tripId);

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    // Check if user is admin
    const isAdmin = trip.organizer.toString() === userId.toString() ||
      trip.members.some(
        (m) => m.user.toString() === userId.toString() && m.role === "admin"
      );

    if (!isAdmin) {
      return res.status(403).json({ message: "Only admins can finalize trips" });
    }

    trip.isFinalized = true;
    await trip.save();

    return res.json({ message: "Trip finalized successfully", trip });
  } catch (err) {
    return res.status(500).json({ message: "Error finalizing trip", error: err.message });
  }
};

