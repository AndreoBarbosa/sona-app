import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import { SwipeBack } from "@/components/swipe-back";
import { MetasProvider } from "@/lib/metas-context";
import { ToastProvider } from "@/lib/toast-context";
import { AuthProvider } from "@/lib/auth-context";
import { DemoProvider } from "@/lib/demo-context";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Sona",
  description: "Clareza financeira antes de metas — case conceitual de produto.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={outfit.variable}>
      <body className="h-screen overflow-hidden bg-surface-app font-sans text-body text-ink-primary antialiased">
        <AuthProvider>
          <DemoProvider>
            <MetasProvider>
              <ToastProvider>
                <SwipeBack />
                {children}
              </ToastProvider>
            </MetasProvider>
          </DemoProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
