import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AntdProvider from "@/components/AntdProvider";
import TokenMonitoringInitializer from "@/components/TokenMonitoringInitializer";
import "@/lib/fetchClient"; // Initialize ngrok bypass

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Plant Decor - Plant Shop & Care Service",
  description: "Buy and care for beautiful plants with our plant shop and care service platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AntdProvider>
          <TokenMonitoringInitializer />
          {children}
        </AntdProvider>
      </body>
    </html>
  );
}
