import React, { useState, useEffect } from 'react';
import { pollAPI } from '../services/api';
import '../styles/Poll.css';

const Poll = ({ tripId }) => {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    options: ['', ''],
    deadline: ''
  });
  const [error, setError] = useState('');

  useEffect(() => {
    loadPolls();
  }, [tripId]);

  const loadPolls = async () => {
    try {
      const response = await pollAPI.getPollsByTrip(tripId);
      setPolls(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load polls');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddOption = () => {
    setFormData({
      ...formData,
      options: [...formData.options, '']
    });
  };

  const handleRemoveOption = (index) => {
    const newOptions = formData.options.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      options: newOptions
    });
  };

  const handleOptionChange = (index, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData({
      ...formData,
      options: newOptions
    });
  };

  const handleCreatePoll = async (e) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      setError('Poll title is required');
      return;
    }

    if (formData.options.filter(o => o.trim()).length < 2) {
      setError('At least 2 options are required');
      return;
    }

    try {
      const response = await pollAPI.createPoll({
        tripId,
        title: formData.title,
        description: formData.description,
        options: formData.options.filter(o => o.trim()),
        deadline: formData.deadline ? new Date(formData.deadline) : null
      });

      setPolls([response.data, ...polls]);
      setFormData({
        title: '',
        description: '',
        options: ['', ''],
        deadline: ''
      });
      setShowCreateForm(false);
      setError('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create poll');
    }
  };

  const handleVote = async (pollId, optionId) => {
    try {
      const response = await pollAPI.votePoll(pollId, optionId);
      const updatedPolls = polls.map(p => p._id === pollId ? response.data : p);
      setPolls(updatedPolls);
      setError('');
    } catch (err) {
      setError('Failed to vote');
    }
  };

  const handleClosePoll = async (pollId) => {
    try {
      const response = await pollAPI.closePoll(pollId);
      const updatedPolls = polls.map(p => p._id === pollId ? response.data : p);
      setPolls(updatedPolls);
      setError('');
    } catch (err) {
      setError('Failed to close poll');
    }
  };

  if (loading) return <div className="loading">Loading polls...</div>;

  return (
    <div className="poll-container">
      <div className="poll-header">
        <h3>📊 Trip Planning Polls</h3>
        <button
          className="btn-primary btn-create-poll"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? '✕ Cancel' : '+ Create Poll'}
        </button>
      </div>

      {error && <div className="error-message">⚠️ {error}</div>}

      {showCreateForm && (
        <form className="poll-form" onSubmit={handleCreatePoll}>
          <div className="form-group">
            <label>Poll Question *</label>
            <input
              type="text"
              placeholder="e.g., Where should we have dinner?"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input-field"
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              placeholder="Add more details about this poll..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input-field"
              rows="2"
            />
          </div>

          <div className="form-group">
            <label>Options * (minimum 2)</label>
            {formData.options.map((option, index) => (
              <div key={index} className="option-input-group">
                <input
                  type="text"
                  placeholder={`Option ${index + 1}`}
                  value={option}
                  onChange={(e) => handleOptionChange(index, e.target.value)}
                  className="input-field"
                />
                {formData.options.length > 2 && (
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => handleRemoveOption(index)}
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              className="btn-secondary btn-add-option"
              onClick={handleAddOption}
            >
              + Add Option
            </button>
          </div>

          <div className="form-group">
            <label>Deadline (optional)</label>
            <input
              type="datetime-local"
              value={formData.deadline}
              onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
              className="input-field"
            />
          </div>

          <button type="submit" className="btn-primary btn-submit">
            Create Poll
          </button>
        </form>
      )}

      {polls.length === 0 ? (
        <div className="no-polls">
          <p>📭 No polls yet. Create one to help decide trip plans!</p>
        </div>
      ) : (
        <div className="polls-list">
          {polls.map((poll) => (
            <div key={poll._id} className={`poll-card ${poll.status}`}>
              <div className="poll-title">
                <h4>{poll.title}</h4>
                <span className={`poll-status ${poll.status}`}>
                  {poll.status === 'active' ? '🔵 Active' : '🔴 Closed'}
                </span>
              </div>

              {poll.description && (
                <p className="poll-description">{poll.description}</p>
              )}

              <div className="poll-options">
                {poll.options.map((option) => {
                  const totalVotes = poll.options.reduce((sum, o) => sum + o.voteCount, 0);
                  const percentage = totalVotes > 0 ? (option.voteCount / totalVotes) * 100 : 0;

                  return (
                    <div key={option.optionId} className="poll-option">
                      <div className="option-header">
                        <span className="option-text">{option.optionText}</span>
                        <span className="option-votes">{option.voteCount} votes</span>
                      </div>
                      <div className="progress-bar-container">
                        <div
                          className="progress-bar"
                          style={{ width: `${percentage}%` }}
                        >
                          {percentage > 15 && (
                            <span className="progress-percentage">
                              {percentage.toFixed(0)}%
                            </span>
                          )}
                        </div>
                      </div>
                      {poll.status === 'active' && (
                        <button
                          className="btn-vote"
                          onClick={() => handleVote(poll._id, option.optionId)}
                        >
                          Vote
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="poll-footer">
                <span className="poll-meta">
                  Created by: {poll.createdBy?.name} •{' '}
                  {new Date(poll.createdAt).toLocaleDateString()}
                </span>
                {poll.deadline && (
                  <span className="poll-deadline">
                    Closes: {new Date(poll.deadline).toLocaleDateString()}
                  </span>
                )}
                {poll.status === 'active' && (
                  <button
                    className="btn-close-poll"
                    onClick={() => handleClosePoll(poll._id)}
                  >
                    Close Poll
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Poll;
