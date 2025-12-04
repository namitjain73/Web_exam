import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user')) || null,
  token: localStorage.getItem('token') || null,
  
  setAuth: (user, token) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
    set({ user, token });
  },
  
  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    set({ user: null, token: null });
  },
  
  updateUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  }
}));

export const useTripStore = create((set) => ({
  trips: [],
  currentTrip: null,
  
  setTrips: (trips) => set({ trips }),
  setCurrentTrip: (trip) => set({ currentTrip: trip }),
  addTrip: (trip) => set((state) => ({ trips: [...state.trips, trip] })),
  updateTrip: (tripId, updatedTrip) => set((state) => ({
    trips: state.trips.map(t => t._id === tripId ? updatedTrip : t),
    currentTrip: state.currentTrip?._id === tripId ? updatedTrip : state.currentTrip
  }))
}));

export const useExpenseStore = create((set) => ({
  expenses: [],
  summary: null,
  
  setExpenses: (expenses) => set({ expenses }),
  setSummary: (summary) => set({ summary }),
  addExpense: (expense) => set((state) => ({ expenses: [...state.expenses, expense] })),
  removeExpense: (expenseId) => set((state) => ({
    expenses: state.expenses.filter(e => e._id !== expenseId)
  })),
  updateExpense: (expenseId, updated) => set((state) => ({
    expenses: state.expenses.map(e => e._id === expenseId ? updated : e)
  }))
}));

export const useItineraryStore = create((set) => ({
  itineraries: [],
  
  setItineraries: (itineraries) => set({ itineraries }),
  addActivity: (tripId, activity) => set((state) => ({
    itineraries: state.itineraries.map(i => 
      i.trip === tripId ? { ...i, activities: [...i.activities, activity] } : i
    )
  })),
  removeActivity: (tripId, activityId) => set((state) => ({
    itineraries: state.itineraries.map(i => 
      i.trip === tripId ? { ...i, activities: i.activities.filter(a => a.id !== activityId) } : i
    )
  })),
  reorderActivities: (tripId, activities) => set((state) => ({
    itineraries: state.itineraries.map(i => 
      i.trip === tripId ? { ...i, activities } : i
    )
  }))
}));

export const useSettlementStore = create((set) => ({
  settlement: null,
  
  setSettlement: (settlement) => set({ settlement }),
  updateTransaction: (index, updated) => set((state) => ({
    settlement: {
      ...state.settlement,
      transactions: state.settlement.transactions.map((t, i) => 
        i === index ? updated : t
      )
    }
  }))
}));
