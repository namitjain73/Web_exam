import React, { useState, useEffect } from 'react';
import { itineraryAPI } from '../services/api';
import '../styles/Itinerary.css';

const Itinerary = ({ tripId, trip }) => {
  const [itineraries, setItineraries] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    title: '',
    description: '',
    location: '',
    startTime: '',
    endTime: '',
    priority: 'medium'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadItinerary();
  }, [tripId]);

  const loadItinerary = async () => {
    try {
      const response = await itineraryAPI.getItinerary(tripId);
      setItineraries(response.data);
    } catch (err) {
      console.error('Failed to load itinerary');
    } finally {
      setLoading(false);
    }
  };

  const handleAddActivity = async (e) => {
    e.preventDefault();
    try {
      const newActivity = {
        tripId,
        ...formData
      };
      await itineraryAPI.addActivity(newActivity);
      setFormData({
        date: '',
        title: '',
        description: '',
        location: '',
        startTime: '',
        endTime: '',
        priority: 'medium'
      });
      setShowForm(false);
      loadItinerary();
    } catch (err) {
      console.error('Failed to add activity');
    }
  };

  const groupByDate = (activities) => {
    const grouped = {};
    trip.members.forEach(member => {
      const startDate = new Date(trip.startDate);
      const endDate = new Date(trip.endDate);
      const currentDate = new Date(startDate);
      
      while (currentDate <= endDate) {
        const dateStr = currentDate.toISOString().split('T')[0];
        if (!grouped[dateStr]) grouped[dateStr] = [];
        currentDate.setDate(currentDate.getDate() + 1);
      }
    });

    itineraries.forEach(itin => {
      const dateStr = new Date(itin.date).toISOString().split('T')[0];
      grouped[dateStr] = itin.activities;
    });

    return grouped;
  };

  if (loading) return <div className="loading">Loading itinerary...</div>;

  const groupedActivities = groupByDate([]);

  return (
    <div className="itinerary-container">
      <div className="itinerary-header">
        <h2>Trip Itinerary</h2>
        <button className="btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Add Activity'}
        </button>
      </div>

      {showForm && (
        <form className="activity-form" onSubmit={handleAddActivity}>
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
              <label>Activity Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Visit Eiffel Tower"
                required
              />
            </div>
            <div className="form-group">
              <label>Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Paris, France"
              />
            </div>
          </div>

          <div className="form-row">
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
            <div className="form-group">
              <label>Priority</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Add activity details..."
              rows="3"
            />
          </div>

          <button type="submit" className="btn-primary">Add Activity</button>
        </form>
      )}

      <div className="timeline">
        {Object.entries(groupedActivities).map(([date, activities]) => (
          <div key={date} className="timeline-day">
            <h3 className="date-header">{new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</h3>
            {activities && activities.length > 0 ? (
              <div className="activities-list">
                {activities.map((activity) => (
                  <div key={activity.id} className={`activity-item priority-${activity.priority}`}>
                    <div className="activity-time">
                      {activity.startTime ? new Date(activity.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'All day'}
                    </div>
                    <div className="activity-content">
                      <h4>{activity.title}</h4>
                      {activity.location && <p className="location">📍 {activity.location}</p>}
                      {activity.description && <p className="description">{activity.description}</p>}
                      <span className={`status status-${activity.status}`}>{activity.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="no-activities">No activities planned for this day</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Itinerary;
