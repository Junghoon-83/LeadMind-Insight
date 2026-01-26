import type { Metadata, Viewport } from "next";
import Providers from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "리드마인드인사이트 | LeadMind Insight",
  description: "리더십 역량 진단 및 맞춤형 성장 팁 제공 서비스",
  keywords: ["리더십", "진단", "리더", "팔로워십", "팀 관리", "코칭"],
  authors: [{ name: "LeadMind Insight" }],
  openGraph: {
    title: "리드마인드인사이트",
    description: "리더십 역량 진단 및 맞춤형 성장 팁 제공",
    type: "website",
    locale: "ko_KR",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#6D28D9",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
