// import localFont from "next/font/local";
import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { AuthProvider } from "@/context/AuthContext";

// const geistSans = localFont({
//   src: [
//     {
//       path: "/kerocure_frontend/public/fonts/Geist/static/Geist-Regular.ttf",
//       weight: "400",
//       style: "normal",
//     },
//     {
//       path: "/kerocure_frontend/public/fonts/Geist/static/Geist-Bold.ttf",
//       weight: "700",
//       style: "normal",
//     },
//   ],
//   variable: "--font-geist-sans", // Custom CSS variable
// });

// // Load Geist Mono locally
// const geistMono = localFont({
//   src: [
//     {
//       path: "/kerocure_frontend/public/fonts/Geist_Mono/static/GeistMono-Regular.ttf",
//       weight: "400",
//       style: "normal",
//     },
//     {
//       path: "/kerocure_frontend/public/fonts/Geist_Mono/static/GeistMono-Bold.ttf",
//       weight: "700",
//       style: "normal",
//     },
//   ],
//   variable: "--font-geist-mono", // Custom CSS variable
// });

export const metadata: Metadata = {
  title: "Create Next App",
  description: "Generated by create next app",
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
          defaultTheme="system"
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
