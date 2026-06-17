import { useState } from "react";
import { useSelector } from "react-redux";
import { addPassword_Service } from "../../Service/Password.service";
import Dashboard from "../Dashboard";
import Footer from "../Footer.jsx";
import PasswordStrengthPanel from "./PasswordStrengthPanel.jsx";
import PasswordInput from "./PasswordInput.jsx";

const AddPassword = () => {
    const vaultKeyJwk = useSelector((state) => state.vaultKeyJwk);
    const vaultReady = useSelector((state) => state.vaultReady);
    const [formData, setFormData] = useState({
        username: "",
        websiteName: "",
        websiteURL: "",
        email: "",
        password: "",
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!vaultReady || !vaultKeyJwk) return;

        const success = await addPassword_Service(formData, vaultKeyJwk);
        if (success) {
            setFormData({ username: "", websiteName: "", websiteURL: "", email: "", password: "" });
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#1B1F3B] to-[#4D869C] text-[#F5F7FA] flex flex-col">
            <Dashboard />
            <div className="flex justify-center items-center min-h-screen ">
                <div className="w-full max-w-2xl bg-gray-800 p-12 rounded-xl shadow-2xl border border-[#4D869C]">
                    <h2 className="text-2xl font-bold  text-gray-300 text-center mb-8">
                        Add New Password
                    </h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <input
                            type="text"
                            name="username"
                            placeholder="Username"
                            value={formData.username}
                            onChange={handleChange}
                            className="w-full p-4 text-lg border border-gray-400 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-400 placeholder-gray-400 placeholder-opacity-50"
                            required
                        />
                        <input
                            type="text"
                            name="websiteName"
                            placeholder="Website Name"
                            value={formData.websiteName}
                            onChange={handleChange}
                            className="w-full p-4 text-lg border border-gray-400 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-400 placeholder-gray-400 placeholder-opacity-50"
                            required
                        />
                        <input
                            type="url"
                            name="websiteURL"
                            placeholder="Website URL"
                            value={formData.websiteURL}
                            onChange={handleChange}
                            className="w-full p-4 text-lg border border-gray-400 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-4 focus:ring-blue-400 placeholder-gray-400 placeholder-opacity-50"
                            required
                        />
                        <input
                            type="email"
                            name="email"
                            placeholder="Email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full p-4 text-lg border border-gray-400 bg-gray-700 text-white rounded-xl focus:outline-none focus:ring-4 focus:ring-blue-400 placeholder-gray-400 placeholder-opacity-50"
                            required
                        />
                        <PasswordInput
                            name="password"
                            placeholder="Password"
                            value={formData.password}
                            onChange={handleChange}
                        />
                        <PasswordStrengthPanel
                            value={formData.password}
                            onUseSuggestion={(suggestedPassword) =>
                                setFormData((prev) => ({ ...prev, password: suggestedPassword }))
                            }
                        />
                        <button
                            type="submit"
                            className="w-full px-6 py-3 bg-[#3A7CA5] text-white rounded-lg shadow-lg shadow-[#3A7CA5]/50 hover:bg-[#81c3d7] transition-all transform hover:scale-105 placeholder-gray-400 placeholder-opacity-50"
                        >
                            Add Password
                        </button>
                    </form>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default AddPassword;
