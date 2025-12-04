import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { tripAPI, expenseAPI, itineraryAPI, settlementAPI, getSocket } from '../services/api';
import Itinerary from './Itinerary';
import ExpenseTracker from './ExpenseTracker';
import Settlement from './Settlement';
import Poll from './Poll';
import '../styles/TripDetail.css';

const TripDetail = () => {
  const { tripId } = useParams();
  const [trip, setTrip] = useState(null);
  const [activeTab, setActiveTab] = useState('itinerary');
  const [loading, setLoading] = useState(true);
  const [inviteCode, setInviteCode] = useState('');
  const [showInvite, setShowInvite] = useState(false);

  useEffect(() => {
    loadTripDetails();
    const socket = getSocket();
    if (socket) {
      socket.on('expense-updated', (data) => {
        loadTripDetails();
      });
      socket.on('activity-updated', (data) => {
        loadTripDetails();
      });
    }
    return () => {
      if (socket) {
        socket.off('expense-updated');
        socket.off('activity-updated');
      }
    };
  }, [tripId]);

  const loadTripDetails = async () => {
    try {
      const response = await tripAPI.getTrip(tripId);
      setTrip(response.data);
      setInviteCode(response.data.inviteCode);
    } catch (err) {
      console.error('Failed to load trip details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading trip...</div>;
  if (!trip) return <div className="error">Trip not found</div>;

  return (
    <div className="trip-detail">
      <header className="trip-header">
        <div className="trip-info">
          <h1>{trip.title}</h1>
          <p className="destination">📍 {trip.destination}</p>
          <p className="dates">
            {new Date(trip.startDate).toLocaleDateString()} - {new Date(trip.endDate).toLocaleDateString()}
          </p>
        </div>
        
        <div className="trip-actions">
          <button className="btn-secondary" onClick={() => setShowInvite(!showInvite)}>
            👥 Invite Friends
          </button>
          {showInvite && (
            <div className="invite-box">
              <p>Invite Code: <strong>{inviteCode}</strong></p>
              <p>Share this code with friends to invite them to the trip!</p>
            </div>
          )}
        </div>
      </header>

      <nav className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'itinerary' ? 'active' : ''}`}
          onClick={() => setActiveTab('itinerary')}
        >
          📅 Itinerary
        </button>
        <button 
          className={`tab-btn ${activeTab === 'expenses' ? 'active' : ''}`}
          onClick={() => setActiveTab('expenses')}
        >
          💰 Expenses
        </button>
        <button 
          className={`tab-btn ${activeTab === 'polls' ? 'active' : ''}`}
          onClick={() => setActiveTab('polls')}
        >
          📊 Polls
        </button>
        <button 
          className={`tab-btn ${activeTab === 'settlement' ? 'active' : ''}`}
          onClick={() => setActiveTab('settlement')}
        >
          💳 Settlement
        </button>
      </nav>

      <div className="tab-content">
        {activeTab === 'itinerary' && <Itinerary tripId={tripId} trip={trip} />}
        {activeTab === 'expenses' && <ExpenseTracker tripId={tripId} trip={trip} />}
        {activeTab === 'polls' && <Poll tripId={tripId} />}
        {activeTab === 'settlement' && <Settlement tripId={tripId} trip={trip} />}
      </div>
    </div>
  );
};

export default TripDetail;
