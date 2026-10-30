import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Multi AI Assistant",
  description: "One AI assistant for OpenAI, Gemini, and Claude",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
