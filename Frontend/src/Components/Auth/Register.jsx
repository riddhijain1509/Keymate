import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../../Service/Auth.service.js";
import PasswordStrengthPanel from "../Password/PasswordStrengthPanel.jsx";
import PasswordInput from "../Password/PasswordInput.jsx";

function Register() {
  const [fullname, setFullname] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = { fullname, username, email, password };
    const res = await registerUser(formData);
    if (res === true) navigate("/login");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1B1F3B] to-[#4D869C] text-white relative">
      <button
        className="absolute top-6 right-6 bg-[#3A7CA5] px-6 py-3 rounded-full text-white font-semibold shadow-md transition-all hover:bg-[#81c3d7] hover:scale-105"
        onClick={() => navigate("/")}
      >
        Home
      </button>

      <div className="bg-[#253054] p-10 py-20 rounded-2xl shadow-xl w-96 border border-[#4D869C]">
        <h2 className="text-3xl font-bold text-center mb-6">Register</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={fullname}
            onChange={(e) => setFullname(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-[#4D869C]/30 text-white focus:outline-none focus:ring-2 focus:ring-[#81c3d7]"
            required
          />
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-[#4D869C]/30 text-white focus:outline-none focus:ring-2 focus:ring-[#81c3d7]"
            required
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 rounded-lg bg-[#4D869C]/30 text-white focus:outline-none focus:ring-2 focus:ring-[#81c3d7]"
            required
          />
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
          <PasswordStrengthPanel
            value={password}
            onUseSuggestion={(suggestedPassword) => setPassword(suggestedPassword)}
          />
          <button
            type="submit"
            className="w-full py-3 bg-[#3A7CA5] text-white font-bold rounded-lg hover:bg-[#81c3d7] transition-all shadow-lg shadow-[#3A7CA5]/50"
          >
            Register
          </button>
        </form>

        <p className="text-center mt-4 text-sm">
          Already have an account?{" "}
          <span
            className="text-[#81c3d7] cursor-pointer hover:underline"
            onClick={() => navigate("/login")}
          >
            Login
          </span>
        </p>
      </div>
    </div>
  );
}

export default Register;
