"use client";

import { WalletComponents } from "./ConnectWallet";

export default function Navbar() {
  return (
    <nav className="w-full flex items-center justify-between px-8 py-4 shadow-sm border-[#8A7650] bg-[#3B4953]">

      {/* Logo / Brand */}
      <h1 className="text-xl font-bold text-[#EBF4DD] tracking-wide">
        Proof
      </h1>

      {/* Wallet */}
      <div className="flex items-center">
        <WalletComponents />
      </div>

    </nav>
  );
}