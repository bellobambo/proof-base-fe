"use client";

import { useAccount } from "wagmi";
import Register from "@/components/Register";
import Courses from "@/components/Courses";
import { useIsUserRegistered } from "@/utils/useContractHooks";

export default function Page() {
  const { address, isConnected } = useAccount();
  const {
    data: isRegistered,
    isLoading,
    isFetching,
  } = useIsUserRegistered(address);

  if (!isConnected || !address) {
    return <div>Connect wallet...</div>;
  }

  if (isLoading || isFetching) {
    return <div>Loading...</div>;
  }

  return isRegistered ? <Courses /> : <Register />;
}