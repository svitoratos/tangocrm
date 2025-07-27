import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { ClerkProvider } from "@clerk/nextjs";
import { TimezoneProvider } from "@/contexts/TimezoneContext";
import { NicheProvider } from "@/contexts/NicheContext";
import { RevenueTypeProvider } from "@/contexts/RevenueTypeContext";
import { defaultMetadata, structuredData } from "@/lib/metadata";
import GoogleAnalytics from "@/components/analytics/google-analytics";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = defaultMetadata;

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
      signInUrl="/signin"
      signUpUrl="/signup"
      afterSignUpUrl="/onboarding"
      afterSignInUrl="/dashboard"
    >
      <html lang="en" suppressHydrationWarning className={inter.variable}>
        <head>
          <link rel="icon" href="/favicon.ico" />
          <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
          <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
          <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
          <link rel="manifest" href="/site.webmanifest" />
          <meta name="theme-color" content="#10b981" />
          
          {/* Structured Data */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(structuredData.organization)
            }}
          />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(structuredData.softwareApplication)
            }}
          />
                 <script
         type="application/ld+json"
         dangerouslySetInnerHTML={{
           __html: JSON.stringify(structuredData.website)
         }}
       />
       <script
         type="application/ld+json"
         dangerouslySetInnerHTML={{
           __html: JSON.stringify(structuredData.faq)
         }}
       />
        </head>
        <body className="antialiased bg-white">
          <GoogleAnalytics GA_MEASUREMENT_ID={process.env.NEXT_PUBLIC_GA_ID!} />
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
