import type { Metadata } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";

import "./globals.css";

const monaSans = localFont({
  src: [
    {
      path: "../fonts/MonaSans-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../fonts/MonaSans-Medium.ttf",
      weight: "500",
      style: "normal",
    },
    {
      path: "../fonts/MonaSans-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-mona-sans",
  display: "swap",
});

const monaCondensed = localFont({
  src: [
    {
      path: "../fonts/MonaSans_Condensed-SemiBold.ttf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../fonts/MonaSans_Condensed-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-mona-condensed",
  display: "swap",
});

export const metadata: Metadata = {
  title: "UpRank — Operations",
  description:
    "Who needs attention, retention, trade performance, and ads impact.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${monaSans.variable} ${monaCondensed.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground">
        {children}
      </body>
    </html>
  );
}
