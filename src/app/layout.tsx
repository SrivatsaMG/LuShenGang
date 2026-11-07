import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "LU SHEN GANG | Los Santos Roleplay",
    template: "%s | LU SHEN GANG",
  },
  description:
    "A close-knit FiveM roleplay community bringing Los Santos to life. Your story starts here.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
