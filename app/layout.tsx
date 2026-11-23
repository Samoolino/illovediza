import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Illovediza Fuerza | Sport, Territory & Impact",
  description:
    "A Spain-wide sports-anchored territorial engagement and evidence platform connecting padel, tennis and football.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
