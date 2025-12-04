import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { tripAPI, initSocket, joinTripRoom } from '../services/api';
import { useTripStore } from '../store';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const [trips, setTripsLocal] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTrip, setNewTrip] = useState({
    title: '',
    destination: '',
    startDate: '',
    endDate: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const setTrips = useTripStore((state) => state.setTrips);
  const setCurrentTrip = useTripStore((state) => state.setCurrentTrip);

  useEffect(() => {
    initSocket();
    loadTrips();
  }, []);

  const loadTrips = async () => {
    try {
      const response = await tripAPI.getTrips();
      setTripsLocal(response.data);
      setTrips(response.data);
    } catch (err) {
      setError('Failed to load trips');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTrip = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!newTrip.title || !newTrip.destination || !newTrip.startDate || !newTrip.endDate) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const tripData = {
        ...newTrip,
        startDate: new Date(newTrip.startDate).toISOString(),
        endDate: new Date(newTrip.endDate).toISOString()
      };
      
      const response = await tripAPI.createTrip(tripData);
      setTripsLocal([...trips, response.data]);
      setNewTrip({ title: '', destination: '', startDate: '', endDate: '', description: '' });
      setShowCreateForm(false);
    } catch (err) {
      console.error('Create trip error:', err);
      setError(err.response?.data?.error || 'Failed to create trip');
    }
  };

  const handleTripClick = (trip) => {
    setCurrentTrip(trip);
    joinTripRoom(trip._id);
    navigate(`/trip/${trip._id}`);
  };

  if (loading) return <div className="loading">Loading trips...</div>;

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <h1>✈️ My Trips</h1>
        <button className="btn-primary" onClick={() => setShowCreateForm(!showCreateForm)}>
          {showCreateForm ? 'Cancel' : '+ New Trip'}
        </button>
      </header>

      {showCreateForm && (
        <div className="create-trip-form">
          <h2>Create New Trip</h2>
          <form onSubmit={handleCreateTrip}>
            <div className="form-group">
              <label>Trip Title</label>
              <input
                type="text"
                value={newTrip.title}
                onChange={(e) => setNewTrip({ ...newTrip, title: e.target.value })}
                required
                placeholder="e.g., Summer Vacation 2025"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Destination</label>
                <input
                  type="text"
                  value={newTrip.destination}
                  onChange={(e) => setNewTrip({ ...newTrip, destination: e.target.value })}
                  required
                  placeholder="e.g., Paris, France"
                />
              </div>
              
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={newTrip.startDate}
                  onChange={(e) => setNewTrip({ ...newTrip, startDate: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label>End Date</label>
                <input
                  type="date"
                  value={newTrip.endDate}
                  onChange={(e) => setNewTrip({ ...newTrip, endDate: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                value={newTrip.description}
                onChange={(e) => setNewTrip({ ...newTrip, description: e.target.value })}
                placeholder="Add trip details..."
                rows="3"
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="btn-primary">Create Trip</button>
          </form>
        </div>
      )}

      <div className="trips-grid">
        {trips.length === 0 ? (
          <div className="empty-state">
            <p>No trips yet. Create one to get started!</p>
          </div>
        ) : (
          trips.map((trip) => (
            <div key={trip._id} className="trip-card" onClick={() => handleTripClick(trip)}>
              <div className="trip-header">
                <h3>{trip.title}</h3>
                <span className="status-badge">{trip.status}</span>
              </div>
              <p className="destination">📍 {trip.destination}</p>
              <p className="dates">
                {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
              </p>
              <p className="members">👥 {trip.members.length} members</p>
              <p className="description">{trip.description}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Dashboard;
