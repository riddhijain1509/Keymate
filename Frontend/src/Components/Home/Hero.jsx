import React from "react";
import { Link } from "react-router-dom";

function Hero() {
  return (
    <section className="relative flex flex-1 items-center overflow-hidden px-6 py-16 sm:py-20 lg:px-10">
      <div className="absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-72 w-72 -translate-x-1/2 rounded-full bg-[#81c3d7]/20 blur-3xl" />
        <div className="absolute right-0 top-32 h-80 w-80 rounded-full bg-[#3A7CA5]/20 blur-3xl" />
        <div className="absolute bottom-0 left-0 h-64 w-64 rounded-full bg-[#082d3c]/30 blur-3xl" />
      </div>

      <div className="mx-auto grid w-full max-w-7xl items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-8 text-center lg:text-left">
          <div className="inline-flex items-center rounded-full border border-[#81c3d7]/40 bg-white/5 px-4 py-2 text-sm font-medium text-[#d5f4ff] shadow-lg shadow-black/10 backdrop-blur">
            Client-side encryption, built for zero-knowledge from the start
          </div>

          <div className="space-y-4">
            <h1 className="text-4xl font-extrabold leading-tight text-white sm:text-5xl lg:text-6xl">
              Protect your passwords with a vault that keeps{" "}
              <span className="text-[#81c3d7]">ciphertext on the server</span>
            </h1>
            <p className="mx-auto max-w-2xl text-base leading-7 text-slate-200 sm:text-lg lg:mx-0">
              KeyMate encrypts sensitive vault data in your browser before it ever reaches the
              backend. Your master password protects the vault key, while recovery support keeps
              access resilient without exposing plaintext.
            </p>
          </div>

          <div className="flex flex-col items-center gap-4 sm:flex-row lg:justify-start">
            <Link
              to="/register"
              className="rounded-full bg-[#81c3d7] px-7 py-3 text-base font-semibold text-[#082d3c] shadow-xl shadow-[#81c3d7]/30 transition-transform hover:-translate-y-0.5 hover:bg-[#a7d8e6]"
            >
              Get Started
            </Link>
            <Link
              to="/login"
              className="rounded-full border border-white/20 bg-white/5 px-7 py-3 text-base font-semibold text-white backdrop-blur transition-transform hover:-translate-y-0.5 hover:bg-white/10"
            >
              Sign In
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left backdrop-blur">
              <div className="text-sm text-slate-300">Browser-side</div>
              <div className="mt-1 text-lg font-semibold text-white">AES-GCM encryption</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left backdrop-blur">
              <div className="text-sm text-slate-300">Vault key</div>
              <div className="mt-1 text-lg font-semibold text-white">Protected by KDF + recovery</div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-left backdrop-blur">
              <div className="text-sm text-slate-300">Server data</div>
              <div className="mt-1 text-lg font-semibold text-white">Ciphertext only</div>
            </div>
          </div>

          <p className="max-w-2xl text-sm leading-6 text-slate-300 lg:mx-0">
            This layout keeps the product story simple: encrypt locally, store safely, and make
            future zero-knowledge upgrades possible without changing how password entries are
            encrypted.
          </p>
        </div>

        <div className="relative mx-auto w-full max-w-xl">
          <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-[#81c3d7]/20 via-transparent to-[#3A7CA5]/20 blur-2xl" />
          <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#101737]/70 p-4 shadow-2xl shadow-black/30 backdrop-blur">
            <img
              src="/mainele.gif"
              alt="Security illustration"
              className="h-auto w-full rounded-[1.5rem] object-cover"
            />
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-[#81c3d7]">Phase 1</div>
                <div className="mt-2 text-sm text-slate-200">
                  Encrypt entries in the browser before sending anything to the backend.
                </div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-[#81c3d7]">Phase 2+</div>
                <div className="mt-2 text-sm text-slate-200">
                  Keep entry encryption stable while key protection evolves.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
