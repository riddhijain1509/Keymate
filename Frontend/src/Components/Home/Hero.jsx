import React from 'react';

function Hero() {
    return (
        <>
            <div className="flex flex-col items-center justify-center flex-grow px-6 text-center pt-10 mt-36">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold leading-tight text-white animate-fadeIn">
                    Secure & Manage Your <span className="text-[#81c3d7]">Passwords</span>
                </h1>
                <p className="text-base sm:text-lg mt-4 max-w-xl text-gray-200 animate-fadeIn">
                    Keep your credentials protected with <span className="font-bold">KeyMate</span>'s
                    client-side encrypted vault.
                </p>
                
              <img 
                src="/mainele.gif" 
                alt="Security Illustration"
                className="mt-10 sm:mt-12 md:mt-16 w-[70%] sm:w-[50%] md:w-[500px] h-auto rounded-lg"
                />



                
                <div className="my-16 sm:my-20 mb-32 sm:mb-40 text-gray-300 max-w-4xl sm:max-w-5xl text-lg sm:text-2xl text-center">
                    <h2 className="text-3xl sm:text-4xl font-bold text-[#81c3d7] pb-4">Why is Keymate Secure?</h2>
                    <p className="mt-2">
                        KeyMate now encrypts sensitive vault data directly in your browser before it is sent
                        to the backend. The server stores only <span className="font-bold">ciphertext</span>,
                        not plaintext passwords.
                    </p>
                    <p className="mt-2">
                        This Phase 1 architecture is designed to evolve into a full
                        <span className="font-bold"> zero-knowledge vault</span> by keeping entry encryption
                        on the client and separating it from future master-password-based key protection.
                    </p>
                </div>
            </div>
        </>
    )
}

export default Hero;
