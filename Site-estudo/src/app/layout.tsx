import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import type { ReactNode } from "react";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const sora = Sora({ subsets: ["latin"], variable: "--font-sora", weight: ["600", "700", "800"] });

export const metadata: Metadata = {
  title: "StudyOrbit · Central de Estudos do Casal",
  description:
    "Painel de estudos com matérias, tarefas, pomodoro, flashcards e plano semanal para vocês dois.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${sora.variable}`}>
      <body className="min-h-screen bg-transparent font-sans text-slate-100 antialiased">
        {children}
      </body>
    </html>
  );
}
