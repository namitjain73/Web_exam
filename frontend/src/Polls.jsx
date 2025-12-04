import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, addDoc, onSnapshot, collection, updateDoc } from 'firebase/firestore';

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

// =========================================================================
// FIREBASE & AUTHENTICATION SETUP AND SERVICE LOGIC (Merged into a single file)
// =========================================================================

// Initialize Firebase App and Services once
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Authentication Logic
const authenticateUser = async (setUserId, setIsAuthReady) => {
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

// Real-time Poll Data Subscription
const subscribeToPolls = (setPolls, isAuthReady) => {
  if (!isAuthReady) return () => {};
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

// Poll Creation
const createPoll = async (question, optionsText, userId) => {
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
      voters: [], 
    })),
    createdAt: new Date().toISOString(),
  };

  const pollsRef = collection(db, `artifacts/${appId}/public/data/trips/${TRIP_ID}/polls`);
  await withRetry(() => addDoc(pollsRef, newPoll));
};

// Vote Handling
const voteOnPoll = async (pollId, poll, optionIndex, userId) => {
  if (poll.status !== 'open' || !userId) return;

  const pollDocRef = doc(db, `artifacts/${appId}/public/data/trips/${TRIP_ID}/polls`, pollId);

  // Check if the user is trying to vote for the same option again
  const userAlreadyVotedForThis = poll.options[optionIndex].voters.includes(userId);
  if (userAlreadyVotedForThis) {
      console.log("Vote already recorded for this option. Skipping redundant update.");
      return;
  }

  const updatedOptions = poll.options.map((opt, index) => {
    // 1. Update the chosen option (increment vote and add user)
    if (index === optionIndex) {
      return {
        ...opt,
        votes: opt.votes + 1,
        voters: [...opt.voters, userId]
      };
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

  await withRetry(() => updateDoc(pollDocRef, { options: updatedOptions }));
};

// Poll Finalization
const finalizePoll = async (pollId, poll) => {
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


// =========================================================================
// MAIN REACT COMPONENT
// =========================================================================

const Polls = () => {
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [polls, setPolls] = useState([]);

  const [newPollQuestion, setNewPollQuestion] = useState('');
  const [newOptionsText, setNewOptionsText] = useState('');

  // 1. Authentication and Initialization
  useEffect(() => {
    const unsubscribe = authenticateUser(setUserId, setIsAuthReady);
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // 2. Real-time Poll Data Subscription
  useEffect(() => {
    const unsubscribe = subscribeToPolls(setPolls, isAuthReady);
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isAuthReady]);

  // --- Handlers (Calling Service Logic) ---

  const handleCreatePoll = async (e) => {
    e.preventDefault();
    if (!newPollQuestion || !newOptionsText || !userId) return;

    try {
      await createPoll(newPollQuestion, newOptionsText, userId);
      setNewPollQuestion('');
      setNewOptionsText('');
    } catch (error) {
      console.error("Error creating poll:", error.message);
    }
  };

  const handleVote = async (pollId, optionIndex) => {
    const poll = polls.find(p => p.id === pollId);
    if (!poll) return;
    await voteOnPoll(pollId, poll, optionIndex, userId);
  };

  const handleFinalizePoll = async (pollId) => {
    const poll = polls.find(p => p.id === pollId);
    if (!poll) return;
    await finalizePoll(pollId, poll);
  };

  // --- UI Component for a Single Poll ---

  const PollCard = ({ poll }) => {
    const totalVotes = poll.options.reduce((sum, opt) => sum + opt.votes, 0);
    const isClosed = poll.status === 'closed';

    return (
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-6 transition duration-300 hover:shadow-xl">
        <h3 className="text-xl font-bold text-indigo-700 mb-4">{poll.question}</h3>
        <p className="text-sm text-gray-500 mb-4">
          Status: <span className={`font-semibold ${isClosed ? 'text-red-500' : 'text-green-500'}`}>
            {isClosed ? 'Finalized' : 'Open'}
          </span>
        </p>

        {poll.options.map((option, index) => {
          const votePercentage = totalVotes > 0 ? ((option.votes / totalVotes) * 100).toFixed(1) : 0;
          const userVotedForThis = option.voters.includes(userId);
          const userHasVoted = poll.options.some(opt => opt.voters.includes(userId));
          const isSelectedWinner = isClosed && poll.selectedPlace === option.name;

          return (
            <div key={option.id} className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className={`font-medium ${isSelectedWinner ? 'text-xl text-green-700 font-extrabold' : 'text-gray-800'}`}>
                  {option.name} {isSelectedWinner && ' (SELECTED!)'}
                </span>
                <span className="text-lg font-bold text-indigo-600">{option.votes} Votes</span>
              </div>
              <div className="relative pt-1">
                <div className="flex mb-2 items-center justify-between">
                  <div className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full bg-indigo-200 text-indigo-600">
                    {votePercentage}%
                  </div>
                  {!isClosed && (
                    <button
                      onClick={() => handleVote(poll.id, index)}
                      // Allow voting only if not closed and user hasn't voted yet, OR if user is switching vote
                      disabled={!userId || isClosed} 
                      className={`
                        py-1 px-3 rounded-full text-sm font-semibold transition duration-200
                        ${userVotedForThis ? 'bg-indigo-600 text-white shadow-md' : 'bg-indigo-100 text-indigo-600 hover:bg-indigo-600 hover:text-white'}
                      `}
                    >
                      {userVotedForThis ? 'Current Vote' : (userHasVoted ? 'Change Vote' : 'Vote')}
                    </button>
                  )}
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
                  <div
                    style={{ width: `${votePercentage}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
                  ></div>
                </div>
              </div>
            </div>
          );
        })}

        {!isClosed && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => handleFinalizePoll(poll.id)}
              className="w-full bg-red-500 text-white font-semibold py-2 rounded-lg shadow-md hover:bg-red-600 transition duration-200 disabled:opacity-50"
              disabled={!userId}
            >
              Finalize & Select Winner
            </button>
          </div>
        )}

        {isClosed && (
            <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg">
                <p className="font-bold text-green-800">✅ FINAL DECISION: {poll.selectedPlace}</p>
                <p className="text-xs text-green-700 mt-1">
                  Selected by highest votes, or randomly in case of a tie.
                </p>
            </div>
        )}
      </div>
    );
  };


  if (!isAuthReady) {
    return <div className="flex justify-center items-center h-screen bg-gray-50"><div className="text-xl font-medium text-gray-600">Loading collaboration tools...</div></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans p-4 sm:p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Group Decisions: Voting System</h1>
        <p className="text-gray-600 mb-6">Trip ID: <span className="font-mono text-sm bg-gray-200 p-1 rounded">{TRIP_ID}</span> | User ID: <span className="font-mono text-sm bg-gray-200 p-1 rounded">{userId}</span></p>

        {/* Create New Poll Section */}
        <div className="bg-white p-6 rounded-xl shadow-2xl mb-8 border-t-4 border-indigo-500">
          <h2 className="text-2xl font-bold text-indigo-800 mb-4">Create New Poll</h2>
          <form onSubmit={handleCreatePoll}>
            <div className="mb-4">
              <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-1">Poll Question (e.g., "Where should we visit next?")</label>
              <input
                type="text"
                id="question"
                value={newPollQuestion}
                onChange={(e) => setNewPollQuestion(e.target.value)}
                placeholder="Enter your question here..."
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="options" className="block text-sm font-medium text-gray-700 mb-1">Options (One option per line)</label>
              <textarea
                id="options"
                rows="4"
                value={newOptionsText}
                onChange={(e) => setNewOptionsText(e.target.value)}
                placeholder="Location A: Sunset Cliff
Location B: Secret Waterfall
Location C: Downtown Market"
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition"
                required
              ></textarea>
            </div>
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg shadow-lg hover:bg-indigo-700 transition duration-200 disabled:opacity-50"
              disabled={!userId || !newPollQuestion || !newOptionsText}
            >
              Start New Vote
            </button>
          </form>
        </div>

        {/* Active Polls Section */}
        <h2 className="text-3xl font-extrabold text-gray-900 mb-5 border-b-2 pb-2 border-gray-200">Active and Finalized Polls ({polls.length})</h2>
        
        {polls.length === 0 ? (
          <div className="text-center p-10 bg-white rounded-xl shadow-lg text-gray-500">
            No polls created yet. Be the first to start a vote!
          </div>
        ) : (
          <div>
            {polls.map(poll => (
              <PollCard key={poll.id} poll={poll} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Polls;