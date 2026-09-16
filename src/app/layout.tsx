import { TooltipProvider } from "@/components/ui/tooltip";
import ReactQueryProvider from "@/lib/react-query/react-query-provider";
import clsx from "clsx";
import type { Metadata } from "next";
import { Geist_Mono, Poppins } from "next/font/google";

import "./globals.css";

const fontSans = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400"],
});

const fontMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pulldog",
  description: "A GitHub pull request dashboard",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // dark only — there is no toggle, so the class is enough and colorScheme
    // carries it to native scrollbars and popups
    <html lang="en" className="dark" style={{ colorScheme: "dark" }}>
      <body
        className={clsx(
          fontSans.variable,
          fontMono.variable,
          "font-sans antialiased",
        )}
      >
        <ReactQueryProvider>
          <TooltipProvider>{children}</TooltipProvider>
        </ReactQueryProvider>
      </body>
    </html>
  );
}
