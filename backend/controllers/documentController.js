import Document from "../models/Document.js";
import Trip from "../models/Trip.js";

export const uploadDocument = async (req, res) => {
  try {
    const { tripId, activityId, name, type, fileUrl, fileType } = req.body;
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

    const document = await Document.create({
      trip: tripId,
      activity: activityId || null,
      name,
      type: type || "other",
      fileUrl,
      fileType: fileType || "application/pdf",
      uploadedBy: userId
    });

    const populatedDocument = await Document.findById(document._id)
      .populate("uploadedBy", "name email")
      .populate("activity", "title");

    return res.status(201).json({
      message: "Document uploaded successfully",
      document: populatedDocument
    });
  } catch (err) {
    return res.status(500).json({ message: "Error uploading document", error: err.message });
  }
};

export const getTripDocuments = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { activityId } = req.query;

    const query = { trip: tripId };
    if (activityId) {
      query.activity = activityId;
    }

    const documents = await Document.find(query)
      .populate("uploadedBy", "name email")
      .populate("activity", "title")
      .sort({ createdAt: -1 });

    return res.json({ documents });
  } catch (err) {
    return res.status(500).json({ message: "Error fetching documents", error: err.message });
  }
};

export const deleteDocument = async (req, res) => {
  try {
    const { documentId } = req.params;
    const userId = req.user;

    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ message: "Document not found" });
    }

    // Check if user uploaded it or is admin
    const trip = await Trip.findById(document.trip);
    const isAdmin = trip.organizer.toString() === userId.toString() ||
      trip.members.some(
        (m) => m.user.toString() === userId.toString() && m.role === "admin"
      );

    const canDelete = document.uploadedBy.toString() === userId.toString() || isAdmin;

    if (!canDelete) {
      return res.status(403).json({ message: "Not authorized to delete this document" });
    }

    await Document.findByIdAndDelete(documentId);

    return res.json({ message: "Document deleted successfully" });
  } catch (err) {
    return res.status(500).json({ message: "Error deleting document", error: err.message });
  }
};

