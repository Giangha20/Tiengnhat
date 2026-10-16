import type { Metadata, Viewport } from "next";
import { Be_Vietnam_Pro, Noto_Sans_JP } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { UISettingsProvider } from "@/components/providers/UISettingsProvider";
import { AuthProvider } from "@/components/providers/AuthProvider";
import { ProgressProvider } from "@/components/providers/ProgressProvider";
import BottomNav from "@/components/layout/BottomNav";
import JapaneseAtmosphereBackdrop from "@/components/layout/JapaneseAtmosphereBackdrop";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

const beVietnamPro = Be_Vietnam_Pro({
  variable: "--font-sans",
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const notoSansJP = Noto_Sans_JP({
  variable: "--font-japanese",
  subsets: ["latin"],
  weight: ["400", "500", "700", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "NihongoMaster - Học Tiếng Nhật Cho Người Việt",
    template: "%s | NihongoMaster",
  },
  description:
    "Nền tảng học tiếng Nhật miễn phí dành cho người Việt Nam. Học từ con số 0 với Hiragana, Katakana, từ vựng, ngữ pháp, Kanji và luyện thi JLPT N5-N1.",
  keywords: [
    "học tiếng Nhật",
    "tiếng Nhật cho người Việt",
    "JLPT",
    "Hiragana",
    "Katakana",
    "Kanji",
    "ngữ pháp tiếng Nhật",
    "từ vựng tiếng Nhật",
  ],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="vi"
      className={`${beVietnamPro.variable} ${notoSansJP.variable} h-full antialiased overflow-x-hidden`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans overflow-x-hidden w-full max-w-full">
        <ThemeProvider>
          <UISettingsProvider>
            <JapaneseAtmosphereBackdrop />
            <AuthProvider>
              <ProgressProvider>
                <Header />
                <main className="flex-1 pb-16 lg:pb-0 w-full max-w-full overflow-x-hidden">{children}</main>
                <Footer />
                <BottomNav />
              </ProgressProvider>
            </AuthProvider>
          </UISettingsProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
