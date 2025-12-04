import { useState, useEffect } from "react";
import api from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { FiPlus, FiCheck } from "react-icons/fi";
import "./VotesTab.css";

const VotesTab = ({ trip, onUpdate }) => {
  const { user } = useAuth();
  const [votes, setVotes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    question: "",
    options: ["", ""],
    expiresAt: ""
  });

  useEffect(() => {
    fetchVotes();
  }, [trip._id]);

  const fetchVotes = async () => {
    try {
      const response = await api.get(`/votes/trip/${trip._id}`);
      setVotes(response.data.votes);
    } catch (err) {
      console.error("Error fetching votes:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/votes", {
        tripId: trip._id,
        question: formData.question,
        options: formData.options.filter((opt) => opt.trim() !== ""),
        expiresAt: formData.expiresAt || undefined
      });

      setShowForm(false);
      setFormData({
        question: "",
        options: ["", ""],
        expiresAt: ""
      });
      fetchVotes();
      onUpdate();
    } catch (err) {
      console.error("Error creating vote:", err);
      alert(err.response?.data?.message || "Error creating vote");
    }
  };

  const handleCastVote = async (voteId, optionIndex) => {
    try {
      await api.post(`/votes/${voteId}/vote`, { optionIndex });
      fetchVotes();
    } catch (err) {
      console.error("Error casting vote:", err);
      alert(err.response?.data?.message || "Error casting vote");
    }
  };

  const addOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, ""]
    });
  };

  const updateOption = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({ ...formData, options: newOptions });
  };

  const getTotalVotes = (vote) => {
    return vote.options.reduce((sum, opt) => sum + opt.votes.length, 0);
  };

  const hasUserVoted = (vote) => {
    if (!user) return false;
    return vote.options.some((opt) =>
      opt.votes.some((v) => v.user._id === user.id)
    );
  };

  return (
    <div className="votes-tab">
      <div className="votes-header">
        <h2>Group Decisions</h2>
        <button onClick={() => setShowForm(true)} className="btn-primary">
          <FiPlus /> Create Vote
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Create Vote</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Question</label>
                <input
                  type="text"
                  value={formData.question}
                  onChange={(e) =>
                    setFormData({ ...formData, question: e.target.value })
                  }
                  placeholder="e.g., Which hotel should we book?"
                  required
                />
              </div>
              <div className="form-group">
                <label>Options</label>
                {formData.options.map((option, index) => (
                  <input
                    key={index}
                    type="text"
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    placeholder={`Option ${index + 1}`}
                    required
                  />
                ))}
                <button
                  type="button"
                  onClick={addOption}
                  className="btn-secondary"
                >
                  Add Option
                </button>
              </div>
              <div className="form-group">
                <label>Expires At (Optional)</label>
                <input
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) =>
                    setFormData({ ...formData, expiresAt: e.target.value })
                  }
                />
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  Create Vote
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="votes-list">
        {votes.length === 0 ? (
          <div className="empty-state">
            <p>No votes yet. Create your first vote!</p>
          </div>
        ) : (
          votes.map((vote) => {
            const totalVotes = getTotalVotes(vote);
            const userVoted = hasUserVoted(vote);

            return (
              <div key={vote._id} className="vote-card">
                <div className="vote-header">
                  <h3>{vote.question}</h3>
                  <span className="vote-count">{totalVotes} votes</span>
                </div>
                <div className="vote-options">
                  {vote.options.map((option, index) => {
                    const voteCount = option.votes.length;
                    const percentage =
                      totalVotes > 0 ? (voteCount / totalVotes) * 100 : 0;
                    // Simplified user vote check - would need auth context in production
                    const isUserVote = false;

                    return (
                      <div
                        key={index}
                        className={`vote-option ${isUserVote ? "user-vote" : ""}`}
                      >
                        <div className="vote-option-header">
                          <span className="option-text">{option.text}</span>
                          {isUserVote && <FiCheck className="check-icon" />}
                        </div>
                        <div className="vote-bar-container">
                          <div
                            className="vote-bar"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <div className="vote-stats">
                          <span>{voteCount} votes</span>
                          <span>{percentage.toFixed(1)}%</span>
                        </div>
                        {!userVoted && (
                          <button
                            onClick={() => handleCastVote(vote._id, index)}
                            className="vote-btn"
                          >
                            Vote
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
                {vote.expiresAt && (
                  <p className="vote-expiry">
                    Expires: {new Date(vote.expiresAt).toLocaleString()}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default VotesTab;

