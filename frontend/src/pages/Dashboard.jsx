import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../utils/api";
import { FiPlus, FiSearch } from "react-icons/fi";
import "./Dashboard.css";

const Dashboard = () => {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      const response = await api.get("/trips");
      setTrips(response.data.trips);
    } catch (err) {
      console.error("Error fetching trips:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredTrips = trips.filter(
    (trip) =>
      trip.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      trip.destination.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="dashboard-loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>My Trips</h1>
          <p>Welcome back, {user?.name}!</p>
        </div>
        <div className="header-actions">
          <button onClick={() => navigate("/create-trip")} className="btn-primary">
            <FiPlus /> Create Trip
          </button>
          <button onClick={logout} className="btn-secondary">
            Logout
          </button>
        </div>
      </header>

      <div className="dashboard-content">
        <div className="search-bar">
          <FiSearch />
          <input
            type="text"
            placeholder="Search trips..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {filteredTrips.length === 0 ? (
          <div className="empty-state">
            <h2>No trips found</h2>
            <p>
              {searchTerm
                ? "Try a different search term"
                : "Create your first trip to get started!"}
            </p>
            {!searchTerm && (
              <button onClick={() => navigate("/create-trip")} className="btn-primary">
                Create Trip
              </button>
            )}
          </div>
        ) : (
          <div className="trips-grid">
            {filteredTrips.map((trip) => (
              <div
                key={trip._id}
                className="trip-card"
                onClick={() => navigate(`/trip/${trip._id}`)}
              >
                {trip.coverImage && (
                  <div
                    className="trip-cover"
                    style={{ backgroundImage: `url(${trip.coverImage})` }}
                  />
                )}
                <div className="trip-info">
                  <h3>{trip.name}</h3>
                  <p className="trip-destination">{trip.destination}</p>
                  <p className="trip-dates">
                    {new Date(trip.startDate).toLocaleDateString()} -{" "}
                    {new Date(trip.endDate).toLocaleDateString()}
                  </p>
                  <div className="trip-meta">
                    <span>{trip.members.length} members</span>
                    {trip.isFinalized && <span className="badge">Finalized</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;

