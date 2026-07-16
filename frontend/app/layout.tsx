import type { Metadata } from "next";
import { IBM_Plex_Mono, Newsreader, Public_Sans } from "next/font/google";
import { Provider } from "@/components/ui/provider";
import "./globals.css";

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-ibm-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Graduation Planner",
  description: "View major requirements, plan courses, and stay on track for graduation",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${publicSans.variable} ${newsreader.variable} ${ibmPlexMono.variable}`}
    >
      <body className="min-h-full flex flex-col">
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
