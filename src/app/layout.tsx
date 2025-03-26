// import localFont from "next/font/local";
import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/context/AuthContext";

export const metadata: Metadata = {
  title: "Kerocure Application",
  description: "kerocure medical centre",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={"antialiased"}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            <div className="flex min-h-screen">{children}</div>
          </AuthProvider>
          {/* ✅ Footer with Copyright */}
          <footer className="text-center py-4 border-t bg-gray-900 text-white">
            © {new Date().getFullYear()} Chrispers Youngkim. All rights
            reserved.
          </footer>
        </ThemeProvider>
      </body>
    </html>
  );
}
