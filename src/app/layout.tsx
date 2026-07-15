import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/Providers";

export const metadata: Metadata = {
  title: "Market Pulse — Indian Portfolio Simulator",
  description:
    "Build and analyze your hypothetical Indian stock & mutual fund portfolio. Compare against NIFTY 50 with live data from Yahoo Finance and MFAPI.",
  keywords: ["portfolio", "NIFTY 50", "Indian stocks", "mutual funds", "market simulator"],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
