import type { Metadata } from "next";
import { Inter, Source_Serif_4 } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { PomodoroProvider } from "@/contexts/PomodoroContext";
import QueryProvider from "@/shared/providers/QueryProvider";
import FaviconSwitcher from "@/components/FaviconSwitcher";
import NotificationCenter from "@/components/NotificationCenter";
import AppShell from "@/components/layout/AppShell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-source-serif",
  display: "swap",
  weight: ["400", "700", "800"],
});

export const metadata: Metadata = {
  title: "LAIF — Your intelligent life manager",
  description: "Tasks, calendar, habits, journal — all in one premium workspace with AI.",
  icons: {
    icon: '/logo_new.png',
    apple: '/logo_new.png',
    shortcut: '/logo_new.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'LAIF',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} ${sourceSerif.variable}`} data-theme="dark">
      <head>
        <meta name="theme-color" content="#0E0E12" />
      </head>
      <body>
        <ThemeProvider>
          <QueryProvider>
            <PomodoroProvider>
              <FaviconSwitcher />
              <AppShell>{children}</AppShell>
              <NotificationCenter />
            </PomodoroProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
