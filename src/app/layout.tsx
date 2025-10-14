import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import { AuthProvider } from "@/hooks/use-auth";
import { Toaster } from "@/components/ui/toaster";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "OrderMenu - Sistem Pemesanan Menu F&B Multi-Tenant",
  description: "Sistem pemesanan menu F&B modern untuk restoran dan cafe dengan fitur multi-tenant, real-time tracking, dan manajemen yang mudah",
  keywords: ["pemesanan menu", "F&B", "restoran", "cafe", "multi-tenant", "QR code", "real-time"],
  authors: [{ name: "OrderMenu Team" }],
  openGraph: {
    title: "OrderMenu - Sistem Pemesanan Menu F&B",
    description: "Sistem pemesanan menu F&B modern untuk restoran dan cafe",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${inter.variable} ${poppins.variable} antialiased font-sans`}
      >
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
