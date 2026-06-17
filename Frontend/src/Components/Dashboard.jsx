import React, { useEffect, useState } from "react";
import { checkisloggedIn, logoutUser } from "../Service/Auth.service.js";
import { useNavigate, NavLink } from "react-router-dom";
import { FaShieldAlt } from "react-icons/fa";
import { FiMenu } from "react-icons/fi"; 
import { RiCloseFill } from "react-icons/ri"; 
import { useDispatch } from "react-redux";
import { clearVaultState } from "../Features/todoslice.js";

function Dashboard() {
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [isMenuOpen, setIsMenuOpen] = useState(false); 
    const navigate = useNavigate();
    const dispatch = useDispatch();

    useEffect(() => {
      const verifyLoginStatus = async () => {
          const loggedIn = await checkisloggedIn(); 
          setIsLoggedIn(loggedIn);
      };
      verifyLoginStatus();
  }, []);

    const navItems = [
        ...(isLoggedIn ? [
            { name: "Home", path: "/" },
            { name: "Passwords", path: "/passwords" },
            { name: "Keys", path: "/keys" },
            { name: "Profile", path: "/profile" },
        ] : []),
    ];

    const handleLogout = async () => {
        setIsLoggedIn(false);
        await logoutUser();
        sessionStorage.removeItem("keymate_pending_recovery_key");
        dispatch(clearVaultState());
        navigate("/");
    };

    return (
        <nav className="w-full flex justify-between items-center px-5 py-3 bg-[#1B1F3B]/80 backdrop-blur-md border-b border-[#4D869C] shadow-md relative z-50">
            {/* Left side: Shield icon */}
            <div className="flex items-center space-x-2">
                <FaShieldAlt className="text-[#81c3d7] text-3xl cursor-pointer hover:scale-110 transition-transform" />
                <h1 className="text-2xl font-extrabold tracking-wide text-white">
                    Key<span className="text-[#81c3d7]">Mate</span>
                </h1>
            </div>

            
            <div className="hidden md:flex space-x-16 text-xl font-medium">
                {navItems.map((item, index) => (
                    <NavLink
                        key={index}
                        to={item.path}
                        className={({ isActive }) =>
                            `transition-all duration-300 transform hover:scale-105 hover:text-[#81c3d7] ${
                                isActive
                                    ? "text-[#81c3d7] font-semibold border-b-4 border-[#81c3d7] pb-1"
                                    : "text-white font-normal"
                            }`
                        }
                    >
                        {item.name}
                    </NavLink>
                ))}
            </div>

            
            <div className="hidden md:block">
                {isLoggedIn ? (
                    <button
                        onClick={handleLogout}
                        className="px-6 py-3 bg-[#3A7CA5] text-white rounded-full shadow-lg shadow-[#3A7CA5]/50 hover:bg-[#81c3d7] transition-all transform hover:scale-105"
                    >
                        Logout
                    </button>
                ) : (
                    <button
                        onClick={() => navigate("/login")}
                        className="px-6 py-3 bg-[#3A7CA5] text-white rounded-full shadow-lg shadow-[#3A7CA5]/50 hover:bg-[#81c3d7] transition-all transform hover:scale-105"
                    >
                        Login
                    </button>
                )}
            </div>

            
            <div className="md:hidden flex items-center">
                <button onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    {isMenuOpen ? (
                        <RiCloseFill className="text-white text-3xl" />
                    ) : (
                        <FiMenu className="text-white text-3xl" />
                    )}
                </button>
            </div>

            
            {isMenuOpen && (
                <div className="absolute top-12 right-0 w-auto bg-[#1B1F3B] p-4 rounded-lg shadow-lg md:hidden z-50">
                    <div className="flex flex-col space-y-4 text-left text-lg">
                        {navItems.map((item, index) => (
                            <NavLink
                                key={index}
                                to={item.path}
                                onClick={() => setIsMenuOpen(false)} 
                                className={({ isActive }) =>
                                    `transition-all duration-300 transform hover:scale-105 hover:text-[#81c3d7] ${
                                        isActive
                                            ? "text-[#81c3d7] font-semibold pb-1"
                                            : "text-white font-normal"
                                    }`
                                }
                            >
                                {item.name}
                            </NavLink>
                        ))}
                        <div className="mt-4">
                            {isLoggedIn ? (
                                <button
                                    onClick={handleLogout}
                                    className="px-6 py-3 bg-[#3A7CA5] text-white rounded-full shadow-lg shadow-[#3A7CA5]/50 hover:bg-[#81c3d7] transition-all transform hover:scale-105"
                                >
                                    Logout
                                </button>
                            ) : (
                                <button
                                    onClick={() => navigate("/login")}
                                    className="px-6 py-3 bg-[#3A7CA5] text-white rounded-full shadow-lg shadow-[#3A7CA5]/50 hover:bg-[#81c3d7] transition-all transform hover:scale-105"
                                >
                                    Login
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
}

export default Dashboard;
