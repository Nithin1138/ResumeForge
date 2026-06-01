import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 0.85,
};

export const metadata: Metadata = {
  title: "ATSLift — ATS Resume Builder for Engineering Students",
  description: "Turn your CGPA, projects, and skills into ATS-optimized resume content in 2 minutes. Built for VIT, BITS, NIT, IIIT students.",
  metadataBase: new URL("https://atslift.vercel.app"),
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "ATSLift — ATS Resume Builder for Engineering Students",
    description: "Turn your CGPA, projects, and skills into ATS-optimized resume content in 2 minutes. Built for VIT, BITS, NIT, IIIT students.",
    images: ["/og-image.png"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "ATSLift — ATS Resume Builder for Engineering Students",
    description: "Turn your CGPA, projects, and skills into ATS-optimized resume content in 2 minutes. Built for VIT, BITS, NIT, IIIT students.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased selection:bg-primary/20" suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-bg-base text-text selection:bg-primary/20">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}

