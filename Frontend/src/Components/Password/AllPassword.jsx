import React, { useEffect, useState } from "react";
import Dashboard from "../Dashboard";
import { useNavigate } from "react-router-dom";
import { getAllPasswords_Service } from "../../Service/Password.service";
import Loading from '../Loading/Loading.jsx';
import { PlusIcon } from "@heroicons/react/24/solid";
import Footer from "../Footer.jsx";

function AllPassword() {
    const [passwords, setPasswords] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            const data = await getAllPasswords_Service();
            setPasswords(data || []);
            setIsLoading(false);
        };
        fetchData();
    }, []);

    return (
        <div className="min-h-[110vh] flex flex-col bg-gradient-to-br from-[#1B1F3B] to-[#4D869C] text-[#F5F7FA]">
            <Dashboard />
    
            <div className="flex-grow">
                {isLoading ? (
                    <Loading />
                ) : passwords.length > 0 ? (
                    <div className="flex flex-col items-center space-y-4 p-6 sm:p-10 w-full">
                        {passwords.map((item, index) => (
                            <div
                                key={index}
                                className="group bg-[#1B1F3B] w-full max-w-4xl sm:w-[90%] md:w-[80%] lg:w-[80%] h-[100px] rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 border border-[#4D869C] 
                                flex flex-col sm:flex-row items-center sm:items-center px-6 cursor-pointer transform hover:scale-105"
                                onClick={() => navigate(`/passwords/${item._id}`)}
                            >
                                <div className="flex flex-col sm:flex-row items-center w-full">
                                    <h3 className="text-xl font-bold text-gray-300 mb-2 sm:mb-0 sm:mr-4 pt-4 sm:pt-0">
                                        {index + 1}. {item.websiteName} :
                                    </h3>
                                    <a
                                        href={item.websiteURL}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[#81c3d7] text-lg hover:underline"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        {item.websiteURL}
                                    </a>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex h-full items-center justify-center px-6 py-20 text-center text-xl text-gray-200">
                        No passwords saved yet. Add your first vault entry to get started.
                    </div>
                )}
            </div>
    
            {/* Floating + Button (responsive) */}
            <button
                onClick={() => navigate("/add_password")}
                className="fixed bottom-8 right-8 bg-[#1B1F3B] hover:bg-[#1b3d53] shadow-lg shadow-[#082d3c]/50 text-white text-3xl font-bold w-16 h-16 rounded-full flex items-center justify-center transition-all transform hover:scale-110"
            >
                <PlusIcon className="w-10 h-10 stroke-2" />  
            </button>

            <Footer />
        </div>
    );
}

export default AllPassword;
