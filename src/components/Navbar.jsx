import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <header className="navbar">
      <div className="nav-inner">
        <h2 className="logo">PlanMyTrip</h2>

        <div className="nav-menu">
          <Link className="nav-link" to="/login">Login</Link>
          <Link className="signup-btn" to="/signup">Sign Up</Link>
        </div>
      </div>
    </header>
  );
}
