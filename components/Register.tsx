"use client";

import React, { useState } from "react";
import { useAccount } from "wagmi";
import {
  UserRole,
  useGetUser,
  useRegisterUser,
} from "@/utils/useContractHooks";

const Register = () => {
  const { address } = useAccount();
  const { data: user } = useGetUser(address);
  const { registerUser, isPending, isConfirming, isConfirmed, error } =
    useRegisterUser();

  const [name, setName] = useState("");
  const [role, setRole] = useState<UserRole>(UserRole.STUDENT);

  const isRegistered = user?.isRegistered;
  const isLoading = isPending || isConfirming;

  const buttonText = isPending
    ? "Confirm in Wallet..."
    : isConfirming
    ? "Registering..."
    : isConfirmed
    ? "Registered"
    : "Register";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const trimmedName = name.trim();
    if (!address || !trimmedName) return;

    registerUser(trimmedName, role);
  };

  if (isRegistered) {
    return (
      <section className="min-h-screen bg-[#FFFBF1] flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-lg rounded-3xl bg-[#E36A6A] text-white shadow-xl p-8 sm:p-10">

          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-white text-[#E36A6A] text-2xl font-bold">
            ✓
          </div>

          <h1 className="text-center text-3xl font-semibold">
            Already Registered
          </h1>

          <p className="mt-2 text-center text-sm text-white/80">
            This wallet has already been registered on ProofBase.
          </p>

          <div className="mt-6 space-y-4 rounded-2xl bg-white/10 p-5 text-left">

            <div>
              <p className="text-xs uppercase tracking-wide text-white/70">
                Name
              </p>
              <p className="mt-1 text-sm font-medium">{user?.name}</p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-white/70">
                Role
              </p>
              <p className="mt-1 text-sm font-medium">
                {user?.role === UserRole.TUTOR ? "Tutor" : "Student"}
              </p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wide text-white/70">
                Wallet
              </p>
              <p className="mt-1 break-all text-sm">{address}</p>
            </div>

          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-[#FFFBF1] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-xl rounded-3xl bg-[#E36A6A] text-white shadow-xl p-8 sm:p-10">

        <div className="mb-6">
          <h2 className="text-3xl font-semibold">Create Account</h2>
          <p className="mt-2 text-sm text-white/80">
            Complete your registration to continue.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">

          <div>
            <label htmlFor="name" className="mb-2 block text-sm font-medium">
              Full Name
            </label>

            <input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-2xl border border-white/25 bg-white/10 px-4 py-3.5 text-base text-white placeholder:text-white/50 outline-none transition focus:border-white/50 focus:ring-2 focus:ring-white/20"
            />
          </div>

          <div>
            <label htmlFor="role" className="mb-2 block text-sm font-medium">
              Role
            </label>

            <select
              id="role"
              value={role}
              onChange={(e) => setRole(Number(e.target.value) as UserRole)}
              className="w-full rounded-2xl border border-white/25 bg-white/10 px-4 py-3.5 text-base text-white outline-none transition focus:border-white/50 focus:ring-2 focus:ring-white/20"
            >
              <option value={UserRole.STUDENT} className="text-[#E36A6A]">
                Student
              </option>

              <option value={UserRole.TUTOR} className="text-[#E36A6A]">
                Tutor
              </option>
            </select>
          </div>

          {error && (
            <div className="rounded-2xl border border-red-300/30 bg-red-400/10 px-4 py-3 text-sm text-red-100">
              {error.message}
            </div>
          )}

          <button
            type="submit"
            disabled={!name.trim() || isLoading}
            className="w-full cursor-pointer rounded-2xl bg-white px-4 py-3.5 text-base font-semibold text-[#E36A6A] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {buttonText}
          </button>

        </form>

        <p className="mt-5 text-center text-xs text-white/70">
          Your registration is stored onchain and linked to your wallet.
        </p>

      </div>
    </section>
  );
};

export default Register;