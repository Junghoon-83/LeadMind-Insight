import type { Metadata, Viewport } from "next";
import Providers from "@/components/Providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "리드 마인드 케어 | LeadMind Care",
  description: "리더십 역량 진단 및 맞춤형 성장 팁 제공 서비스",
  keywords: ["리더십", "진단", "리더", "팔로워십", "팀 관리", "코칭"],
  authors: [{ name: "LeadMind Care" }],
  openGraph: {
    title: "리드 마인드 케어",
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
      <head>
        {/* 온보딩 이미지 프리로드 - 초기 로딩 속도 개선 */}
        <link rel="preload" href="/images/Slide1_1.png" as="image" />
        <link rel="preload" href="/images/onboarding-2.png" as="image" />
        <link rel="preload" href="/images/onboarding-3.png" as="image" />
      </head>
      <body className="antialiased">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
