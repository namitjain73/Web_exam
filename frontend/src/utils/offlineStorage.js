// Offline storage utilities for syncing when back online

const STORAGE_KEYS = {
  TRIPS: "offline_trips",
  EXPENSES: "offline_expenses",
  ACTIVITIES: "offline_activities",
  PENDING_ACTIONS: "pending_actions"
};

export const offlineStorage = {
  // Save data locally
  save: (key, data) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (err) {
      console.error("Error saving to localStorage:", err);
    }
  },

  // Get data from local storage
  get: (key) => {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      console.error("Error reading from localStorage:", err);
      return null;
    }
  },

  // Add pending action for sync
  addPendingAction: (action) => {
    const pending = offlineStorage.get(STORAGE_KEYS.PENDING_ACTIONS) || [];
    pending.push({
      ...action,
      timestamp: Date.now()
    });
    offlineStorage.save(STORAGE_KEYS.PENDING_ACTIONS, pending);
  },

  // Get pending actions
  getPendingActions: () => {
    return offlineStorage.get(STORAGE_KEYS.PENDING_ACTIONS) || [];
  },

  // Clear pending actions
  clearPendingActions: () => {
    localStorage.removeItem(STORAGE_KEYS.PENDING_ACTIONS);
  },

  // Check if online
  isOnline: () => {
    return navigator.onLine;
  },

  // Listen for online/offline events
  onOnline: (callback) => {
    window.addEventListener("online", callback);
  },

  onOffline: (callback) => {
    window.addEventListener("offline", callback);
  }
};

export default offlineStorage;

