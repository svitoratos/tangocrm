import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { ClerkProvider } from "@clerk/nextjs";
import { TimezoneProvider } from "@/contexts/TimezoneContext";
import { NicheProvider } from "@/contexts/NicheContext";
import { RevenueTypeProvider } from "@/contexts/RevenueTypeContext";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Tango Orchids - Creator CRM Platform",
  description: "A comprehensive CRM platform designed for creators, coaches, podcasters, and freelancers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      appearance={{
        elements: {
          formButtonPrimary: "bg-emerald-500 hover:bg-emerald-600 text-white",
          card: "bg-background border border-border",
          headerTitle: "text-foreground",
          headerSubtitle: "text-muted-foreground",
          socialButtonsBlockButton: "bg-background border border-border text-foreground hover:bg-muted",
          formFieldLabel: "text-foreground",
          formFieldInput: "bg-background border border-border text-foreground",
          footerActionLink: "text-emerald-500 hover:text-emerald-600",
        },
        layout: {
          unsafe_disableDevelopmentModeWarnings: true,
        },
      }}
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      afterSignUpUrl="/onboarding"
      afterSignInUrl="/dashboard"
    >
      <html lang="en" suppressHydrationWarning className={inter.variable}>
        <body className="antialiased bg-white">
          <ThemeProvider
            defaultTheme="light"
            storageKey="tango-theme"
          >
            <TimezoneProvider>
              <NicheProvider>
                <RevenueTypeProvider>
                  {children}
                </RevenueTypeProvider>
              </NicheProvider>
            </TimezoneProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
