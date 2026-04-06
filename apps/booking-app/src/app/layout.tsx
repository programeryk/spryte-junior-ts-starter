import type { Metadata } from "next";

import "./globals.css";

export const metadata: Metadata = {
  title: "Mini Cinema Booking",
  description: "Prosty MVP rezerwacji miejsc w kinie.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}
