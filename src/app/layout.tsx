import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });



export const metadata: Metadata = {
  title: "EnyaMedia - Restored Classics",
  description: "Experience the golden age of cinema in stunning restored color.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body className={cn(inter.variable, "min-h-screen bg-black text-white font-sans antialiased")}>
        {children}
      </body>
    </html>
  );
}
