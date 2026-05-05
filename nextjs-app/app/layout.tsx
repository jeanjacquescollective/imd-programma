import { DM_Sans, Syne } from "next/font/google";
import "./globals.css";
import { DataBootstrap } from "@/components/DataBootstrap";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata = {
  title: "IMD Curriculum Manager",
  description: "Manage IMD courses, ECTS and reports",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body className={`${dmSans.variable} ${syne.variable} min-h-screen text-slate-900`}>
        <DataBootstrap />
        {children}
      </body>
    </html>
  );
}
