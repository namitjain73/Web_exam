import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import api from "../utils/api";
import { FiPlus, FiMapPin, FiClock, FiTrash2, FiEdit2 } from "react-icons/fi";
import { format } from "date-fns";
import "./ItineraryTab.css";

const ItineraryTab = ({ trip, onUpdate }) => {
  const [activities, setActivities] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    date: "",
    startTime: "",
    endTime: "",
    location: { name: "", address: "" }
  });

  useEffect(() => {
    fetchActivities();
  }, [trip._id]);

  const fetchActivities = async () => {
    try {
      const response = await api.get(`/activities/trip/${trip._id}`);
      setActivities(response.data.activities);
    } catch (err) {
      console.error("Error fetching activities:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingActivity) {
        await api.patch(`/activities/${editingActivity._id}`, {
          ...formData,
          tripId: trip._id
        });
      } else {
        await api.post("/activities", {
          ...formData,
          tripId: trip._id
        });
      }
      setShowForm(false);
      setEditingActivity(null);
      setFormData({
        title: "",
        description: "",
        date: "",
        startTime: "",
        endTime: "",
        location: { name: "", address: "" }
      });
      fetchActivities();
      onUpdate();
    } catch (err) {
      console.error("Error saving activity:", err);
    }
  };

  const handleDelete = async (activityId) => {
    if (!window.confirm("Delete this activity?")) return;
    try {
      await api.delete(`/activities/${activityId}`);
      fetchActivities();
      onUpdate();
    } catch (err) {
      console.error("Error deleting activity:", err);
    }
  };

  const handleEdit = (activity) => {
    setEditingActivity(activity);
    setFormData({
      title: activity.title,
      description: activity.description,
      date: format(new Date(activity.date), "yyyy-MM-dd"),
      startTime: activity.startTime,
      endTime: activity.endTime,
      location: activity.location || { name: "", address: "" }
    });
    setShowForm(true);
  };

  const onDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(activities);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setActivities(items);

    // Update order in backend
    try {
      await api.patch(`/activities/${reorderedItem._id}`, {
        order: result.destination.index
      });
    } catch (err) {
      console.error("Error updating order:", err);
      fetchActivities(); // Revert on error
    }
  };

  const groupedActivities = activities.reduce((acc, activity) => {
    const date = format(new Date(activity.date), "yyyy-MM-dd");
    if (!acc[date]) acc[date] = [];
    acc[date].push(activity);
    return acc;
  }, {});

  return (
    <div className="itinerary-tab">
      <div className="itinerary-header">
        <h2>Itinerary</h2>
        {!trip.isFinalized && (
          <button onClick={() => setShowForm(true)} className="btn-primary">
            <FiPlus /> Add Activity
          </button>
        )}
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => {
          setShowForm(false);
          setEditingActivity(null);
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>{editingActivity ? "Edit Activity" : "Add Activity"}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Date</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Start Time</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>End Time</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Location Name</label>
                <input
                  type="text"
                  value={formData.location.name}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      location: { ...formData.location, name: e.target.value }
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label>Address</label>
                <input
                  type="text"
                  value={formData.location.address}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      location: { ...formData.location, address: e.target.value }
                    })
                  }
                />
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingActivity(null);
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingActivity ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <DragDropContext onDragEnd={onDragEnd}>
        {Object.keys(groupedActivities).length === 0 ? (
          <div className="empty-state">
            <p>No activities yet. Add your first activity!</p>
          </div>
        ) : (
          Object.entries(groupedActivities)
            .sort()
            .map(([date, dayActivities]) => (
              <div key={date} className="day-section">
                <h3 className="day-header">
                  {format(new Date(date), "EEEE, MMMM d, yyyy")}
                </h3>
                <Droppable droppableId={date}>
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef}>
                      {dayActivities.map((activity, index) => (
                        <Draggable
                          key={activity._id}
                          draggableId={activity._id}
                          index={index}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`activity-card ${snapshot.isDragging ? "dragging" : ""}`}
                            >
                              <div {...provided.dragHandleProps} className="drag-handle">
                                ⋮⋮
                              </div>
                              <div className="activity-content">
                                <div className="activity-header">
                                  <h4>{activity.title}</h4>
                                  {!trip.isFinalized && (
                                    <div className="activity-actions">
                                      <button
                                        onClick={() => handleEdit(activity)}
                                        className="icon-btn"
                                      >
                                        <FiEdit2 />
                                      </button>
                                      <button
                                        onClick={() => handleDelete(activity._id)}
                                        className="icon-btn"
                                      >
                                        <FiTrash2 />
                                      </button>
                                    </div>
                                  )}
                                </div>
                                {activity.description && (
                                  <p className="activity-description">{activity.description}</p>
                                )}
                                <div className="activity-meta">
                                  {(activity.startTime || activity.endTime) && (
                                    <span className="activity-time">
                                      <FiClock /> {activity.startTime}
                                      {activity.endTime && ` - ${activity.endTime}`}
                                    </span>
                                  )}
                                  {activity.location?.name && (
                                    <span className="activity-location">
                                      <FiMapPin /> {activity.location.name}
                                    </span>
                                  )}
                                </div>
                                {activity.status === "suggested" && (
                                  <span className="badge-suggested">Suggested</span>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            ))
        )}
      </DragDropContext>
    </div>
  );
};

export default ItineraryTab;

