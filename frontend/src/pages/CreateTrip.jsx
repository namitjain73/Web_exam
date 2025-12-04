import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../utils/api";
import "./CreateTrip.css";

const CreateTrip = () => {
  const [formData, setFormData] = useState({
    name: "",
    destination: "",
    startDate: "",
    endDate: "",
    coverImage: "",
    currency: "USD"
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/trips", formData);
      navigate(`/trip/${response.data.trip._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Error creating trip");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-trip">
      <div className="create-trip-card">
        <h1>Create New Trip</h1>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Trip Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Summer Vacation 2024"
              required
            />
          </div>
          <div className="form-group">
            <label>Destination</label>
            <input
              type="text"
              name="destination"
              value={formData.destination}
              onChange={handleChange}
              placeholder="e.g., Paris, France"
              required
            />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Start Date</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
              />
            </div>
            <div className="form-group">
              <label>End Date</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label>Cover Image URL (Optional)</label>
            <input
              type="url"
              name="coverImage"
              value={formData.coverImage}
              onChange={handleChange}
              placeholder="https://example.com/image.jpg"
            />
          </div>
          <div className="form-group">
            <label>Currency</label>
            <select name="currency" value={formData.currency} onChange={handleChange}>
              <option value="USD">USD - US Dollar</option>
              <option value="EUR">EUR - Euro</option>
              <option value="GBP">GBP - British Pound</option>
              <option value="INR">INR - Indian Rupee</option>
              <option value="JPY">JPY - Japanese Yen</option>
            </select>
          </div>
          {error && <div className="error">{error}</div>}
          <div className="form-actions">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Creating..." : "Create Trip"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTrip;

