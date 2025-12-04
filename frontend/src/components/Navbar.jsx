import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="flex justify-between px-8 py-4 bg-white shadow">
      <h1 className="text-2xl font-bold">TripMate</h1>

      <div className="flex gap-6">
        <Link to="/" className="hover:text-blue-600">Home</Link>
        <Link to="/login" className="hover:text-blue-600">Login</Link>
        <Link to="/register" className="hover:text-blue-600">Register</Link>
        <Link to="/dashboard" className="hover:text-blue-600">Dashboard</Link>
      </div>
    </nav>
  );
};

export default Navbar;
