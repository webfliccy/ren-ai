import Providers from "@/components/Providers";
import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  Courier_Prime,
  Figtree,
  Newsreader,
} from "next/font/google";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--next-cormorant",
  display: "swap",
});

const newsreader = Newsreader({
  weight: "variable",
  style: ["normal", "italic"],
  subsets: ["latin"],
  axes: ["opsz"],
  variable: "--next-newsreader",
  display: "swap",
});

const figtree = Figtree({
  weight: "variable",
  subsets: ["latin"],
  variable: "--next-figtree",
  display: "swap",
});

const courierPrime = Courier_Prime({
  weight: ["400", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--next-courier",
  display: "swap",
});

export const metadata: Metadata = {
  title: "The RenAIssance Fan",
  description: "Fallibly human, artificially divine.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cormorant.variable} ${newsreader.variable} ${figtree.variable} ${courierPrime.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
