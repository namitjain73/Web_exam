// Home.jsx
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <section className="hero">
      <div className="hero-content">
        <h1>Plan your next adventure effortlessly ✈️</h1>
        <p>Organize trips, split expenses, and manage itineraries — together.</p>

        <button
          className="primary-btn"
          onClick={() => navigate("/poll")}
        >
          Get Started
        </button>
      </div>
    </section>
  );
}
