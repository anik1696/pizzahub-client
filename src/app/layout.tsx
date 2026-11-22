import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeProvider";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "PizzaHub - Hot & Fresh Pizza Delivered to Your Door",
  description: "Discover local pizza shops, browse menus, and order your favorite pizzas for delivery.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#FFF8F0',
                  color: '#1a1a1a',
                  border: '1px solid #fed7aa',
                },
              }}
            />
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
