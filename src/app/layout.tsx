import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { PomodoroProvider } from "@/contexts/PomodoroContext";
import QueryProvider from "@/shared/providers/QueryProvider";
import FaviconSwitcher from "@/components/FaviconSwitcher";
import NotificationCenter from "@/components/NotificationCenter";
import FloatingMiniTimer from "@/components/pomodoro/FloatingMiniTimer";
import AppShell from "@/components/layout/AppShell";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PIM — Personal Intelligent Manager",
  description: "Manage events, tasks, reminders and notes — all in one premium workspace.",
  icons: {
    icon: '/logo_new.png',
    apple: '/logo_new.png',
    shortcut: '/logo_new.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'PIM',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable} data-theme="light">
      <head>
        <meta name="theme-color" content="#f4f6fb" />
      </head>
      <body>
        <ThemeProvider>
          <QueryProvider>
            <PomodoroProvider>
              <FaviconSwitcher />
              <AppShell>{children}</AppShell>
              <FloatingMiniTimer />
              <NotificationCenter />
            </PomodoroProvider>
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
