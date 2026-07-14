import type { Metadata } from "next";
import { Geist, Geist_Mono, Syne } from "next/font/google";
import { AppShell } from "@/components/layout/AppShell";
import { Footer } from "@/components/layout/Footer";
import { Nav } from "@/components/layout/Nav";
import { ScrollProgress } from "@/components/layout/ScrollProgress";
import { Providers } from "@/components/motion/Providers";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { CustomCursor } from "@/components/ui/CustomCursor";
import { defaultMetadata, organizationSchema } from "@/lib/seo";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

export const metadata: Metadata = defaultMetadata;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${syne.variable} h-full antialiased`}
    >
      <body className="noise min-h-full flex flex-col bg-bg text-fg">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema()) }}
        />
        <Providers>
          <SmoothScroll>
            <AppShell>
              <a
                href="#main"
                className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[120] focus:rounded-full focus:bg-fg focus:px-4 focus:py-2 focus:text-bg"
              >
                Skip to content
              </a>
              <ScrollProgress />
              <CustomCursor />
              <Nav />
              <main id="main" className="flex-1">
                {children}
              </main>
              <Footer />
            </AppShell>
          </SmoothScroll>
        </Providers>
      </body>
    </html>
  );
}
