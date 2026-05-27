import type { Metadata } from "next";
import "./globals.css";
import BottomNav from "./components/BottomNav";

export const metadata: Metadata = {
  title: "ATSLift — ATS Resume Builder for Engineering Students",
  description: "Turn your CGPA, projects, and skills into ATS-optimized resume content in 2 minutes. Built for VIT, BITS, NIT, IIIT students.",
  metadataBase: new URL("https://atslift.in"),
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
    <html lang="en" className="h-full antialiased selection:bg-primary/20">
      <body className="min-h-full bg-[#0a0d0e] text-text selection:bg-primary/20 flex justify-center">
        <div className="max-w-[480px] w-full min-h-screen bg-bg-base border-x border-border/30 relative flex flex-col shadow-[0_0_50px_rgba(0,0,0,0.35)] overflow-x-hidden pb-20">
          {children}
          <BottomNav />
        </div>
      </body>
    </html>
  );
}
