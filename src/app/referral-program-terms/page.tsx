import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { ReferralProgramTermsContent } from "@/components/legal/ReferralProgramTermsContent";
import { SITE } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ragusto Referral Program Terms",
  description: `Referral eligibility, attribution, and credits for eligible ${SITE.name} business and commercial customers.`,
};

export default function ReferralProgramTermsPage() {
  return (
    <LegalPageLayout>
      <ReferralProgramTermsContent />
    </LegalPageLayout>
  );
}
