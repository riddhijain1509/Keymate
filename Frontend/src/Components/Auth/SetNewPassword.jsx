import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { setPasswordService } from "../../Service/Auth.service.js";
import PasswordStrengthPanel from "../Password/PasswordStrengthPanel.jsx";
import PasswordInput from "../Password/PasswordInput.jsx";

function SetNewPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { token } = useParams();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }
    await setPasswordService(password, token);
    setError("");
    setMessage("Your password has been successfully updated.");
    setTimeout(() => navigate("/login"), 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#1B1F3B] to-[#4D869C] text-white relative">
      {/* Home Button */}
      <button
        className="absolute top-6 right-6 bg-[#3A7CA5] px-6 py-3 rounded-lg text-white font-semibold shadow-md transition-all hover:bg-[#81c3d7] hover:scale-105"
        onClick={() => navigate("/")}
      >
        Home
      </button>

      <div className="bg-[#253054] p-10 py-16 rounded-2xl shadow-xl w-96">
        <h2 className="text-3xl font-bold text-center mb-6">Set New Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter new password"
          />
          <PasswordStrengthPanel
            value={password}
            onUseSuggestion={(suggestedPassword) => setPassword(suggestedPassword)}
          />
          <PasswordInput
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
          />

          {error && <p className="text-red-400 text-center text-sm">{error}</p>}
          {message && <p className="text-green-400 text-center text-sm">{message}</p>}

          <button
            type="submit"
            className="w-full py-3 bg-[#3A7CA5] text-white font-bold rounded-lg hover:bg-[#81c3d7] transition-all"
          >
            Set New Password
          </button>
        </form>
      </div>
    </div>
  );
}

export default SetNewPassword;
