import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/Sidebar";
import { UserProvider } from "@/context/UserContext";
import { DataProvider } from "@/context/DataContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Stock Resi",
  description: "Gestión de inventario residencial",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-background text-foreground`}
      >
        <UserProvider>
          <DataProvider>
            <Sidebar />
            <main className="pl-64">
              <div className="container mx-auto p-8 max-w-7xl animate-in fade-in duration-500">
                {children}
              </div>
            </main>
          </DataProvider>
        </UserProvider>
      </body>
    </html>
  );
}
