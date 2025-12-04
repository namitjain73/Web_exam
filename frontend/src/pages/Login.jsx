import { useState } from "react";
import { api } from "../api";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const login = async () => {
    try {
      const res = await api.post("/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      window.location.href = "/dashboard";
    } catch (err) {
      alert(err.response?.data?.message || "Error");
    }
  };

  return (
    <div className="h-screen flex justify-center items-center">
      <div className="p-8 shadow-lg rounded w-96">
        <h2 className="text-2xl font-bold mb-4">Login</h2>
        
        <input 
          type="email" 
          placeholder="Email" 
          className="w-full border p-2 mb-3"
          onChange={(e) => setEmail(e.target.value)}
        />

        <input 
          type="password" 
          placeholder="Password" 
          className="w-full border p-2 mb-3"
          onChange={(e) => setPassword(e.target.value)}
        />

        <button 
          className="w-full bg-blue-600 text-white py-2 rounded"
          onClick={login}
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default Login;
