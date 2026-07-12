import type { Metadata } from "next";
import DeleteAccountPage from "@/features/account-deletion/DeleteAccountPage";

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
    <main>
      <DeleteAccountPage />
    </main>
  );
}
