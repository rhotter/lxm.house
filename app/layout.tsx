import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { Analytics } from "@vercel/analytics/react";
import "katex/dist/katex.min.css";

import "./globals.css";
import { NavBar } from "./NavBar";

export const metadata: Metadata = {
  title: "Light and Matter",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={GeistSans.className}>
        <div className="container mx-auto px-6 sm:pt-16 pt-6 text-gray-900 max-w-2xl pb-16">
          {/* <NavBar /> */}
          <div className="prose">{children}</div>
        </div>
        <Analytics />
      </body>
    </html>
  );
}
