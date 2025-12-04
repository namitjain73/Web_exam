import Activity from "../models/Activity.js";
import Trip from "../models/Trip.js";

export const createActivity = async (req, res) => {
  try {
    const {
      tripId,
      title,
      description,
      date,
      startTime,
      endTime,
      location,
      order
    } = req.body;
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

    const activity = await Activity.create({
      trip: tripId,
      title,
      description: description || "",
      date,
      startTime: startTime || "",
      endTime: endTime || "",
      location: location || {},
      order: order || 0,
      createdBy: userId,
      status: trip.isFinalized ? "suggested" : "suggested"
    });

    const populatedActivity = await Activity.findById(activity._id)
      .populate("createdBy", "name email");

    return res.status(201).json({
      message: "Activity created successfully",
      activity: populatedActivity
    });
  } catch (err) {
    return res.status(500).json({ message: "Error creating activity", error: err.message });
  }
};

export const getTripActivities = async (req, res) => {
  try {
    const { tripId } = req.params;

    const activities = await Activity.find({ trip: tripId })
      .populate("createdBy", "name email")
      .sort({ date: 1, order: 1 });

    return res.json({ activities });
  } catch (err) {
    return res.status(500).json({ message: "Error fetching activities", error: err.message });
  }
};

export const updateActivity = async (req, res) => {
  try {
    const { activityId } = req.params;
    const updates = req.body;
    const userId = req.user;

    const activity = await Activity.findById(activityId);
    if (!activity) {
      return res.status(404).json({ message: "Activity not found" });
    }

    const trip = await Trip.findById(activity.trip);
    const member = trip.members.find(
      (m) => m.user.toString() === userId.toString()
    );

    // Check permissions
    if (!member) {
      return res.status(403).json({ message: "Not a member of this trip" });
    }

    if (trip.isFinalized && member.role !== "admin" && member.role !== "editor") {
      return res.status(403).json({ message: "Trip is finalized. Only editors can modify." });
    }

    Object.keys(updates).forEach((key) => {
      if (key !== "_id" && key !== "trip" && key !== "createdBy") {
        activity[key] = updates[key];
      }
    });

    await activity.save();

    const populatedActivity = await Activity.findById(activity._id)
      .populate("createdBy", "name email");

    return res.json({
      message: "Activity updated successfully",
      activity: populatedActivity
    });
  } catch (err) {
    return res.status(500).json({ message: "Error updating activity", error: err.message });
  }
};

export const updateActivityStatus = async (req, res) => {
  try {
    const { activityId } = req.params;
    const { status } = req.body;
    const userId = req.user;

    const activity = await Activity.findById(activityId);
    if (!activity) {
      return res.status(404).json({ message: "Activity not found" });
    }

    const trip = await Trip.findById(activity.trip);
    const member = trip.members.find(
      (m) => m.user.toString() === userId.toString()
    );

    // Only admins can approve/reject
    if (!member || (member.role !== "admin" && trip.organizer.toString() !== userId.toString())) {
      return res.status(403).json({ message: "Only admins can change activity status" });
    }

    activity.status = status;
    await activity.save();

    return res.json({
      message: "Activity status updated successfully",
      activity
    });
  } catch (err) {
    return res.status(500).json({ message: "Error updating activity status", error: err.message });
  }
};

export const deleteActivity = async (req, res) => {
  try {
    const { activityId } = req.params;
    const userId = req.user;

    const activity = await Activity.findById(activityId);
    if (!activity) {
      return res.status(404).json({ message: "Activity not found" });
    }

    const trip = await Trip.findById(activity.trip);
    const member = trip.members.find(
      (m) => m.user.toString() === userId.toString()
    );

    // Check if user created it or is admin/editor
    const canDelete =
      activity.createdBy.toString() === userId.toString() ||
      (member && (member.role === "admin" || member.role === "editor"));

    if (!canDelete) {
      return res.status(403).json({ message: "Not authorized to delete this activity" });
    }

    await Activity.findByIdAndDelete(activityId);

    return res.json({ message: "Activity deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Error deleting activity", error: err.message });
  }
};

