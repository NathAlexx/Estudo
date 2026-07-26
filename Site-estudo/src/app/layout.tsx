import type { Metadata, Viewport } from "next";
import { Inter, Sora } from "next/font/google";
import type { ReactNode } from "react";
import { ToastProvider } from "@/hooks/useToast";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const sora = Sora({ subsets: ["latin"], variable: "--font-sora", weight: ["600", "700", "800"] });

export const metadata: Metadata = {
  title: "StudyOrbit · Central de Estudos do Casal",
  description:
    "Painel de estudos com matérias, tarefas, pomodoro, flashcards e plano semanal para vocês dois.",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "StudyOrbit · Central de Estudos do Casal",
    description: "Organize matérias, tarefas, pomodoro e flashcards em dupla.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#060a16",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${sora.variable}`}>
      <body>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
