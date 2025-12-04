import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import FileUpload from "./FileUpload";

export default function App() {
  return (
    <Router>
      <Routes>

        
        <Route
          path="/"
          element={
            <div style={{ padding: "20px" }}>
              <h1>Home Page</h1>
              <Link to="/upload">Go to FileUpload Page</Link>
            </div>
          }
        />

        <Route path="/upload" element={<FileUpload />} />

      </Routes>
    </Router>
  );
}
