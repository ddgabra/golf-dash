import type { Metadata, Viewport } from "next";
import { AppDataProvider } from "@/lib/hooks/useAppData";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import "./globals.css";

export const metadata: Metadata = {
  title: "FairwayServe",
  description:
    "Database-free golf course hospitality prototype — order food and drinks on the course",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#1f5d2a",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans antialiased">
        <ErrorBoundary>
          <AppDataProvider>{children}</AppDataProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
