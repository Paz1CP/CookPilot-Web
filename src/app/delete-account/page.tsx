import type { Metadata } from "next";
import DeleteAccountPage from "@/features/account-deletion/DeleteAccountPage";
import { createUtilityMetadata } from "@/shared/config/metadata";

export const metadata: Metadata = createUtilityMetadata("deleteAccount");

export default function Page() {
  return (
    <main>
      <DeleteAccountPage />
    </main>
  );
}

