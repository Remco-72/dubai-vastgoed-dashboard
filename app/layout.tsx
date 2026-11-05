import type { Metadata, Viewport } from "next";
import "./globals.css";
import { basePath } from "../lib/paths";
export const metadata: Metadata = {
  title: "Apex | Property Intelligence",
  description: "Uw vastgoed, helder in beeld. Binghatti Apex · Unit 1107.",
  manifest: `${basePath}/manifest.webmanifest`,
  appleWebApp: {
    capable: true,
    title: "Apex",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: `${basePath}/icon-192.png`,
    apple: `${basePath}/apple-touch-icon.png`,
  },
};
export const viewport: Viewport = {
  themeColor: "#0c111b",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}
