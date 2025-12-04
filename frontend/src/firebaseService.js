import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, addDoc, onSnapshot, collection, updateDoc, doc } from 'firebase/firestore';

// --- Global Variable Initialization ---
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-travel-app';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;
const TRIP_ID = 'trip_to_bali_2024'; // Unique ID for this trip

// Helper for exponential backoff (for robust API calls)
const withRetry = async (fn, retries = 3, delay = 1000) => {
  try {
    return await fn();
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retries - 1, delay * 2);
    }
    throw error;
  }
};

// Initialize Firebase App and Services
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// =========================================================================
// AUTHENTICATION AND INITIALIZATION
// =========================================================================

/**
 * Initializes Firebase Authentication.
 * @param {function} setUserId - React state setter for user ID.
 * @param {function} setIsAuthReady - React state setter for auth status.
 * @returns {function} Unsubscribe function for auth listener.
 */
export const authenticateUser = async (setUserId, setIsAuthReady) => {
  try {
    if (initialAuthToken) {
      await withRetry(() => signInWithCustomToken(auth, initialAuthToken));
    } else {
      await withRetry(() => signInAnonymously(auth));
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      }
      setIsAuthReady(true);
    });

    return unsubscribe;
  } catch (error) {
    console.error("Firebase authentication failed:", error);
    setIsAuthReady(true);
    return () => {};
  }
};

// =========================================================================
// POLL DATA SERVICE (CRUD)
// =========================================================================

/**
 * Sets up a real-time listener for all polls associated with the current trip.
 * @param {function} setPolls - React state setter for the poll list.
 * @param {boolean} isAuthReady - Flag indicating authentication is complete.
 * @returns {function} Unsubscribe function for the Firestore listener.
 */
export const subscribeToPolls = (setPolls, isAuthReady) => {
  if (!isAuthReady) return () => {};

  // Path to public collaborative data: /artifacts/{appId}/public/data/trips/{TRIP_ID}/polls
  const pollsRef = collection(db, `artifacts/${appId}/public/data/trips/${TRIP_ID}/polls`);

  const unsubscribe = onSnapshot(pollsRef, (snapshot) => {
    const fetchedPolls = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    setPolls(fetchedPolls);
  }, (error) => {
    console.error("Error listening to polls:", error);
  });

  return unsubscribe;
};

/**
 * Creates a new poll document in Firestore.
 */
export const createPoll = async (question, optionsText, userId) => {
  const optionNames = optionsText.split('\n').map(s => s.trim()).filter(s => s.length > 0);
  if (optionNames.length === 0) throw new Error("No options provided.");

  const newPoll = {
    question,
    createdBy: userId,
    status: 'open',
    selectedPlace: null,
    options: optionNames.map((name) => ({
      id: crypto.randomUUID(),
      name,
      votes: 0,
      voters: [], // Tracks who has voted to prevent double voting
    })),
    createdAt: new Date().toISOString(),
  };

  const pollsRef = collection(db, `artifacts/${appId}/public/data/trips/${TRIP_ID}/polls`);
  await withRetry(() => addDoc(pollsRef, newPoll));
};

/**
 * Updates the votes and voter list for a poll.
 */
export const voteOnPoll = async (pollId, poll, optionIndex, userId) => {
  if (poll.status !== 'open' || !userId) return;

  const pollDocRef = doc(db, `artifacts/${appId}/public/data/trips/${TRIP_ID}/polls`, pollId);

  const updatedOptions = poll.options.map((opt, index) => {
    // 1. Update the chosen option
    if (index === optionIndex) {
      // If user hasn't voted for this option yet, add vote.
      if (!opt.voters.includes(userId)) {
        return {
          ...opt,
          votes: opt.votes + 1,
          voters: [...opt.voters, userId]
        };
      }
      return opt; // Already voted for this option
    }

    // 2. Remove vote from previously chosen option (if any)
    if (opt.voters.includes(userId)) {
      return {
         ...opt,
         votes: opt.votes - 1,
         voters: opt.voters.filter(id => id !== userId)
      };
    }
    return opt;
  });

  // Simple check to prevent redundant writes if the user clicked the same button twice
  const userAlreadyVotedForThis = poll.options[optionIndex].voters.includes(userId);
  if (userAlreadyVotedForThis) {
      console.log("Vote already recorded for this option. Skipping redundant update.");
      return;
  }

  await withRetry(() => updateDoc(pollDocRef, { options: updatedOptions }));
};

/**
 * Finalizes the poll, selecting the winner based on votes or randomly on a tie.
 */
export const finalizePoll = async (pollId, poll) => {
  if (poll.status !== 'open') return;

  const pollDocRef = doc(db, `artifacts/${appId}/public/data/trips/${TRIP_ID}/polls`, pollId);

  const maxVotes = Math.max(...poll.options.map(opt => opt.votes));
  const winners = poll.options.filter(opt => opt.votes === maxVotes);

  let finalSelection = '';

  if (winners.length === 1) {
    finalSelection = winners[0].name;
  } else if (winners.length > 1) {
    // Tie: Select randomly from the tied options
    const randomIndex = Math.floor(Math.random() * winners.length);
    finalSelection = winners[randomIndex].name;
  } else {
    // Fallback if no votes were cast
    finalSelection = 'No votes cast, selecting first option randomly.';
  }

  await withRetry(() => updateDoc(pollDocRef, {
    status: 'closed',
    selectedPlace: finalSelection,
  }));
};