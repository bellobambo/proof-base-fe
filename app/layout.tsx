import '@coinbase/onchainkit/styles.css';
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "../utils/provider";
import { cookieToInitialState } from "wagmi";
import { getConfig } from "@/utils/wagmi";
import { headers } from "next/headers";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Proof",
  description: "Onchain proof application",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const initialState = cookieToInitialState(
    getConfig(),
    (await headers()).get("cookie")
  );

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>

        <Providers initialState={initialState}>

          <Navbar />

          <main className="px-8 py-6">
            {children}
          </main>

        </Providers>

      </body>
    </html>
  );
}