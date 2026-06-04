import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import DeleteAccountPage from "./DeleteAccountPage";

export const metadata: Metadata = {
  title: "Delete CookPilot account | CookPilot",
  description:
    "Self-serve instructions and verification flow to permanently delete a CookPilot account.",
  alternates: {
    canonical: "https://cookpilot.pro/delete-account",
  },
};

export default function Page() {
  return (
    <>
      <Header />
      <main>
        <DeleteAccountPage />
      </main>
      <Footer />
    </>
  );
}
