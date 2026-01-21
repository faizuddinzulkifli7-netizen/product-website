import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import Header from "@/components/Header";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PeptideStore - Premium Peptide Products",
  description: "Browse and purchase high-quality peptide products for research and wellness",
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
        <AuthProvider>
          <CartProvider>
            <Header />
            <main className="min-h-screen bg-gray-50">
              {children}
            </main>
            <footer className="bg-gray-900 text-white py-8 mt-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div>
                    <h3 className="text-lg font-semibold mb-4">PeptideStore</h3>
                    <p className="text-gray-400 text-sm">
                      Your trusted source for premium peptide products.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-4">Quick Links</h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li><a href="/" className="hover:text-white">Products</a></li>
                      <li><a href="/about" className="hover:text-white">About Us</a></li>
                      <li><a href="/faq" className="hover:text-white">FAQ</a></li>
                      <li><a href="/contact" className="hover:text-white">Contact</a></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-4">Account</h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li><a href="/signin" className="hover:text-white">Sign In</a></li>
                      <li><a href="/signup" className="hover:text-white">Sign Up</a></li>
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-4">Legal</h4>
                    <ul className="space-y-2 text-sm text-gray-400">
                      <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                      <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                    </ul>
                  </div>
                </div>
                <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
                  <p>&copy; 2024 PeptideStore. All rights reserved.</p>
                </div>
              </div>
            </footer>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
