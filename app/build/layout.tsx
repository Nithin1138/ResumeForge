import type { Viewport } from "next";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 0.78, // Zoom out slightly more on the build form page for a compact, dashboard-like feel
};

export default function BuildLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
