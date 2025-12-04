import axios from 'axios';
import io from 'socket.io-client';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

let socket = null;

export const getToken = () => localStorage.getItem('token');

export const setToken = (token) => {
  localStorage.setItem('token', token);
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
};

export const removeToken = () => {
  localStorage.removeItem('token');
  delete api.defaults.headers.common['Authorization'];
};

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me', { headers: { Authorization: `Bearer ${getToken()}` } }),
  updateProfile: (data) => api.put('/auth/update', data, { headers: { Authorization: `Bearer ${getToken()}` } })
};

// Trips API
export const tripAPI = {
  createTrip: (data) => api.post('/trips', data, { headers: { Authorization: `Bearer ${getToken()}` } }),
  getTrips: () => api.get('/trips', { headers: { Authorization: `Bearer ${getToken()}` } }),
  getTrip: (tripId) => api.get(`/trips/${tripId}`, { headers: { Authorization: `Bearer ${getToken()}` } }),
  joinTrip: (inviteCode) => api.post(`/trips/join/${inviteCode}`, {}, { headers: { Authorization: `Bearer ${getToken()}` } }),
  updateTrip: (tripId, data) => api.put(`/trips/${tripId}`, data, { headers: { Authorization: `Bearer ${getToken()}` } }),
  updateMemberRole: (tripId, memberId, data) => api.put(`/trips/${tripId}/members/${memberId}`, data, { headers: { Authorization: `Bearer ${getToken()}` } }),
  removeMember: (tripId, memberId) => api.delete(`/trips/${tripId}/members/${memberId}`, { headers: { Authorization: `Bearer ${getToken()}` } })
};

// Expenses API
export const expenseAPI = {
  addExpense: (data) => api.post('/expenses', data, { headers: { Authorization: `Bearer ${getToken()}` } }),
  getExpenses: (tripId) => api.get(`/expenses/trip/${tripId}`, { headers: { Authorization: `Bearer ${getToken()}` } }),
  updateExpense: (expenseId, data) => api.put(`/expenses/${expenseId}`, data, { headers: { Authorization: `Bearer ${getToken()}` } }),
  deleteExpense: (expenseId) => api.delete(`/expenses/${expenseId}`, { headers: { Authorization: `Bearer ${getToken()}` } }),
  getSummary: (tripId) => api.get(`/expenses/summary/${tripId}`, { headers: { Authorization: `Bearer ${getToken()}` } })
};

// Itinerary API
export const itineraryAPI = {
  getItinerary: (tripId) => api.get(`/itinerary/trip/${tripId}`, { headers: { Authorization: `Bearer ${getToken()}` } }),
  addActivity: (data) => api.post('/itinerary/activity', data, { headers: { Authorization: `Bearer ${getToken()}` } }),
  updateActivity: (tripId, activityId, data) => api.put(`/itinerary/activity/${tripId}/${activityId}`, data, { headers: { Authorization: `Bearer ${getToken()}` } }),
  deleteActivity: (tripId, activityId) => api.delete(`/itinerary/activity/${tripId}/${activityId}`, { headers: { Authorization: `Bearer ${getToken()}` } }),
  reorderActivities: (data) => api.post('/itinerary/reorder', data, { headers: { Authorization: `Bearer ${getToken()}` } })
};

// Documents API
export const documentAPI = {
  uploadDocument: (data) => api.post('/documents', data, { headers: { Authorization: `Bearer ${getToken()}` } }),
  getDocuments: (tripId) => api.get(`/documents/trip/${tripId}`, { headers: { Authorization: `Bearer ${getToken()}` } }),
  getDocumentsByDate: (tripId, date) => api.get(`/documents/trip/${tripId}/date/${date}`, { headers: { Authorization: `Bearer ${getToken()}` } }),
  deleteDocument: (documentId) => api.delete(`/documents/${documentId}`, { headers: { Authorization: `Bearer ${getToken()}` } })
};

// Voting API
export const votingAPI = {
  createPoll: (data) => api.post('/voting', data, { headers: { Authorization: `Bearer ${getToken()}` } }),
  getPolls: (tripId) => api.get(`/voting/trip/${tripId}`, { headers: { Authorization: `Bearer ${getToken()}` } }),
  vote: (pollId, data) => api.post(`/voting/${pollId}/vote`, data, { headers: { Authorization: `Bearer ${getToken()}` } }),
  closePoll: (pollId) => api.put(`/voting/${pollId}/close`, {}, { headers: { Authorization: `Bearer ${getToken()}` } })
};

// Poll API (alias for voting)
export const pollAPI = {
  createPoll: (data) => api.post('/voting', data, { headers: { Authorization: `Bearer ${getToken()}` } }),
  getPollsByTrip: (tripId) => api.get(`/voting/trip/${tripId}`, { headers: { Authorization: `Bearer ${getToken()}` } }),
  votePoll: (pollId, optionId) => api.post(`/voting/${pollId}/vote`, { optionId }, { headers: { Authorization: `Bearer ${getToken()}` } }),
  closePoll: (pollId) => api.put(`/voting/${pollId}/close`, {}, { headers: { Authorization: `Bearer ${getToken()}` } })
};

// Settlement API
export const settlementAPI = {
  getSettlement: (tripId) => api.get(`/settlements/trip/${tripId}`, { headers: { Authorization: `Bearer ${getToken()}` } }),
  markTransactionComplete: (settlementId, transactionIndex) => 
    api.put(`/settlements/${settlementId}/transaction/${transactionIndex}`, {}, { headers: { Authorization: `Bearer ${getToken()}` } }),
  recalculateSettlement: (settlementId) => 
    api.post(`/settlements/${settlementId}/recalculate`, {}, { headers: { Authorization: `Bearer ${getToken()}` } })
};

// Socket.io
export const initSocket = () => {
  socket = io('http://localhost:5000');
  return socket;
};

export const getSocket = () => socket;

export const joinTripRoom = (tripId) => {
  if (socket) socket.emit('join-trip', tripId);
};

export default api;
