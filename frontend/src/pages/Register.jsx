import { useState } from "react";
import { api } from "../api";

const Register = () => {
  const [data, setData] = useState({
    name: "",
    email: "",
    password: "",
    dob: "",
    gender: "",
  });

  const [loading, setLoading] = useState(false);

  const register = async () => {
    try {
      setLoading(true);
      await api.post("/auth/register", data);
      alert("Registration successful!");
      window.location.href = "/login";
    } catch (err) {
      alert(err.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 px-4">
      <div className="bg-white p-8 rounded-xl shadow-xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">
          Create an Account
        </h2>

        <div className="space-y-4">

          {/* NAME */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              placeholder="John Doe"
              className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={(e) => setData({ ...data, name: e.target.value })}
            />
          </div>

          {/* EMAIL */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={(e) => setData({ ...data, email: e.target.value })}
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Password
            </label>
            <input
              type="password"
              placeholder="******"
              className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={(e) => setData({ ...data, password: e.target.value })}
            />
          </div>

          {/* DOB */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Date of Birth
            </label>
            <input
              type="date"
              className="w-full border border-gray-300 p-3 rounded focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={(e) => setData({ ...data, dob: e.target.value })}
            />
          </div>

          {/* GENDER */}
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700">
              Gender
            </label>
            <select
              className="w-full border border-gray-300 p-3 rounded bg-white focus:ring-2 focus:ring-blue-500 outline-none"
              onChange={(e) => setData({ ...data, gender: e.target.value })}
            >
              <option value="">Select gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* BUTTON */}
          <button
            onClick={register}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 mt-4 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
          >
            {loading ? "Creating account..." : "Register"}
          </button>

          <p className="text-center mt-4 text-gray-600">
            Already have an account?
            <a href="/login" className="text-blue-600 font-semibold ml-1">
              Login here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
