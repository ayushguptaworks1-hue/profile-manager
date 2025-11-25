import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Team Profile Manager",
  description: "Manage and view team member profiles with skills, experience, and availability",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
