import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import QueryProvider from "../lib/providers/query-provider";
import MuiThemeProvider from "../lib/providers/mui-provider";
import { AuthProvider } from "../lib/auth-context";
import { CartProvider } from "../lib/cart-context";
import LayoutWrapper from "@/components/layout/LayoutWrapper";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Грузинский Ресторан",
  description: "Грузинский Ресторан",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <MuiThemeProvider>
          <QueryProvider>
            <AuthProvider>
              <CartProvider>
                <LayoutWrapper>
                  {children}
                </LayoutWrapper>
              </CartProvider>
            </AuthProvider>
          </QueryProvider>
        </MuiThemeProvider>
      </body>
    </html>
  );
}
