import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Poll from "./pages/Poll";   // ⬅ add this
import { Route, Routes } from "react-router-dom";

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/poll" element={<Poll />} />   {/* ⬅ new */}
        <Route path="/login" element={<h1>Login Page</h1>} />
        <Route path="/signup" element={<h1>Signup Page</h1>} />
      </Routes>
    </>
  );
}

