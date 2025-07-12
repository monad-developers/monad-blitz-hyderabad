import "./globals.css";
import type { Metadata } from "next";

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
      <body>{children}</body>
    </html>
  );
}
