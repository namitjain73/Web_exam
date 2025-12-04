// src/pages/Poll.jsx
import { useState } from "react";

const DESTINATIONS = ["Goa", "Manali", "Jaipur", "Kerala"];

export default function Poll() {
  const [selected, setSelected] = useState(null);          // current user choice
  const [votes, setVotes] = useState(Array(DESTINATIONS.length).fill(0)); // total votes
  const [result, setResult] = useState("");

  const handleVote = () => {
    if (selected === null) {
      alert("Please select a destination before submitting your vote.");
      return;
    }

    setVotes(prev => {
      const updated = [...prev];
      updated[selected] += 1;
      return updated;
    });

    // clear selection for next user (same laptop demo)
    setSelected(null);
    setResult(""); // reset result until we calculate again
  };

  const calculateResult = () => {
    const maxVote = Math.max(...votes);
    if (maxVote === 0) {
      setResult("No votes yet.");
      return;
    }

    // if tie, indexOf gives first destination with max votes
    const winnerIndex = votes.indexOf(maxVote);
    const winnerName = DESTINATIONS[winnerIndex];

    setResult(`Next trip destination: ${winnerName} ✈️`);
  };

  return (
    <div className="poll-container">
      <div className="poll-card">
        <h2>Vote for your next trip destination</h2>
        <p>Select one option and submit your vote.</p>

        <div className="poll-options">
          {DESTINATIONS.map((dest, index) => (
            <label key={dest} className="poll-option">
              <input
                type="radio"
                name="destination"
                value={index}
                checked={selected === index}
                onChange={() => setSelected(index)}
              />
              <span>{dest}</span>
            </label>
          ))}
        </div>

        <div className="poll-buttons">
          <button className="primary-btn" onClick={handleVote}>
            Submit Vote
          </button>
          <button className="secondary-btn" onClick={calculateResult}>
            Show Result
          </button>
        </div>

        <div className="poll-stats">
          {DESTINATIONS.map((dest, i) => (
            <p key={dest}>
              {dest}: {votes[i]} vote(s)
            </p>
          ))}
        </div>

        {result && <div className="result-box">{result}</div>}
      </div>
    </div>
  );
}
