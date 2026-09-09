import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./film.css";
const outfit = Outfit({ subsets: ["latin"], display: "swap" });
export const metadata: Metadata = {
  title: "CookPilot — The Film",
  description: "You wanted it. Now it is real.",
  icons: { icon: "/images/img_favicon.png" },
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={outfit.className}>{children}</body>
    </html>
  );
}
