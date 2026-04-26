import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Elnatan Lazar | Math & CS Tutoring",
  description:
    "Professional tutoring in Mathematics and Computer Science. Clear explanations, real results. Book a session today.",
  keywords: ["math tutor", "CS tutor", "computer science tutoring", "math tutoring", "online tutoring"],
  openGraph: {
    title: "Elnatan Lazar | Math & CS Tutoring",
    description: "Professional tutoring in Mathematics and Computer Science.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen bg-[#0a0a0f] antialiased">{children}</body>
    </html>
  );
}
