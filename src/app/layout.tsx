import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/provider/providers";
import BackgroundAnimation from "@/components/ui/BackgroundAnimation";
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata:Metadata = {
  title: "ফসল বাড়ি | নিরাপদ কৃষি বিনিয়োগ প্ল্যাটফর্ম",
  description:
    "ফসল বাড়ি একটি নিরাপদ কৃষি বিনিয়োগ প্ল্যাটফর্ম, যেখানে আপনি যাচাইকৃত কৃষি প্রকল্পে বিনিয়োগ করে নির্দিষ্ট সময় শেষে লাভ অর্জন করতে পারেন। আপনার ইনভেস্টমেন্ট সম্পূর্ণ নিরাপদ এবং স্বচ্ছভাবে পরিচালিত হয়।",
  keywords: [
    "ফসল বাড়ি",
    "কৃষি বিনিয়োগ",
    "বাংলাদেশে ইনভেস্টমেন্ট",
    "অ্যাগ্রো ইনভেস্টমেন্ট",
    "ফার্ম ইনভেস্টমেন্ট",
    "নিরাপদ বিনিয়োগ",
    "ফসল প্রকল্প",
    "বিনিয়োগ প্ল্যাটফর্ম",
    "কৃষি উদ্যোক্তা",
  ],
  openGraph: {
    title: "ফসল বাড়ি | নিরাপদ কৃষি বিনিয়োগ প্ল্যাটফর্ম",
    description:
      "আপনার ইনভেস্টমেন্টকে করুন লাভজনক ও নিরাপদ — ফসল বাড়ির মাধ্যমে বিনিয়োগ করুন যাচাইকৃত কৃষি প্রকল্পে এবং নিশ্চিত করুন আপনার ভবিষ্যৎ।",
    url: "https://fosholbari.com",
    siteName: "ফসল বাড়ি",
    locale: "bn_BD",
    type: "website",
  },

};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
      suppressHydrationWarning
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
<Providers>
  <BackgroundAnimation></BackgroundAnimation>
  {children}
</Providers>
      
      </body>
    </html>
  );
}
