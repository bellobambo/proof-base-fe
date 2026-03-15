"use client";

import { useGetUser } from "@/utils/useContractHooks";
import { useAccount } from "wagmi";
import { WalletComponents } from "./ConnectWallet";

export default function Navbar() {
  const { address } = useAccount();
  const { data: user } = useGetUser(address);

<<<<<<< HEAD
=======
  console.log("User data:", user);
  console.log('address:', address);
>>>>>>> c5a9bd8ad1230949df403987f8a86832470ebee5

  const roleLabel =
    user?.role === 0 ? "Tutor" : user?.role === 1 ? "Student" : "";

  const roleDotColor =
    user?.role === 0 ? "bg-green-500" : "bg-blue-500";

  return (
    <>
      <nav className="w-full flex items-center justify-between px-8 py-3 shadow-sm bg-[#E36A6A]">
        <h1 className="text-xl font-bold text-[#FFFBF1] tracking-wide">
          Proof
        </h1>

        <div className="flex items-center">
          <WalletComponents />
        </div>
      </nav>

      {user?.isRegistered && (
        <div className="flex items-center gap-3 px-8 py-2 text-md bg-[#FFFBF1] text-gray-700">
          
          {/* Name */}
          <span className="font-semibold text-[#E36A6A]">
            {user.name}
          </span>

          {/* Role indicator */}
          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${roleDotColor}`} />
            <span className="text-[#E36A6A]">{roleLabel}</span>
          </div>

        </div>
      )}
    </>
  );
}