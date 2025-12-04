import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import ItineraryTab from "../components/ItineraryTab";
import ExpensesTab from "../components/ExpensesTab";
import VotesTab from "../components/VotesTab";
import DocumentsTab from "../components/DocumentsTab";
import "./TripDetail.css";

const TripDetail = () => {
  const { tripId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [trip, setTrip] = useState(null);
  const [activeTab, setActiveTab] = useState("itinerary");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTrip();
  }, [tripId]);

  const fetchTrip = async () => {
    try {
      const response = await api.get(`/trips/${tripId}`);
      setTrip(response.data.trip);
    } catch (err) {
      console.error("Error fetching trip:", err);
      if (err.response?.status === 403 || err.response?.status === 404) {
        navigate("/");
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="trip-loading">Loading trip...</div>;
  }

  if (!trip) {
    return <div className="trip-error">Trip not found</div>;
  }

  const isAdmin =
    user &&
    (trip.organizer._id === user.id ||
      trip.members.some(
        (m) => m.user._id === user.id && m.role === "admin"
      ));

  return (
    <div className="trip-detail">
      <header className="trip-header">
        <button onClick={() => navigate("/")} className="back-btn">
          ← Back
        </button>
        <div className="trip-header-info">
          {trip.coverImage && (
            <div
              className="trip-cover-large"
              style={{ backgroundImage: `url(${trip.coverImage})` }}
            />
          )}
          <div>
            <h1>{trip.name}</h1>
            <p className="trip-destination">{trip.destination}</p>
            <p className="trip-dates">
              {new Date(trip.startDate).toLocaleDateString()} -{" "}
              {new Date(trip.endDate).toLocaleDateString()}
            </p>
            <div className="trip-meta">
              <span>Join Code: {trip.joinCode}</span>
              {trip.isFinalized && <span className="badge">Finalized</span>}
            </div>
          </div>
        </div>
      </header>

      <div className="trip-tabs">
        <button
          className={activeTab === "itinerary" ? "active" : ""}
          onClick={() => setActiveTab("itinerary")}
        >
          Itinerary
        </button>
        <button
          className={activeTab === "expenses" ? "active" : ""}
          onClick={() => setActiveTab("expenses")}
        >
          Expenses
        </button>
        <button
          className={activeTab === "votes" ? "active" : ""}
          onClick={() => setActiveTab("votes")}
        >
          Votes
        </button>
        <button
          className={activeTab === "documents" ? "active" : ""}
          onClick={() => setActiveTab("documents")}
        >
          Documents
        </button>
      </div>

      <div className="trip-content">
        {activeTab === "itinerary" && (
          <ItineraryTab trip={trip} onUpdate={fetchTrip} />
        )}
        {activeTab === "expenses" && (
          <ExpensesTab trip={trip} onUpdate={fetchTrip} />
        )}
        {activeTab === "votes" && (
          <VotesTab trip={trip} onUpdate={fetchTrip} />
        )}
        {activeTab === "documents" && (
          <DocumentsTab trip={trip} onUpdate={fetchTrip} />
        )}
      </div>
    </div>
  );
};

export default TripDetail;

