import "./globals.css";
import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import { WalletProvider } from "../hooks/wallet-context";

export const metadata: Metadata = {
  title: "NFT Terminal",
  description: "Your no-code NFT launchpad",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <WalletProvider>
        {children}
        </WalletProvider>
        <Toaster />
      </body>
    </html>
  );
}
