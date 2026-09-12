import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { legalLinkClass } from "@/components/legal/legalStyles";
import { ReferralProgramTermsV1_0 } from "@/components/legal/referral-program-terms/ReferralProgramTermsV1_0";
import { SITE } from "@/lib/seo";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Ragusto Referral Program Terms (Version 1.0)",
  description: `Archived Version 1.0 of the ${SITE.name} Referral Program Terms, effective September 12, 2026.`,
  robots: {
    index: false,
    follow: true,
  },
};

export default function ReferralProgramTermsV10ArchivePage() {
  return (
    <LegalPageLayout>
      <p className="mb-8 text-sm text-fg-muted leading-relaxed">
        This page archives Version 1.0 of the Ragusto Referral Program Terms, effective September
        12, 2026. It is preserved for reference and does not replace the{" "}
        <Link href="/referral-program-terms" className={legalLinkClass}>
          current Referral Program Terms
        </Link>
        .
      </p>
      <ReferralProgramTermsV1_0 />
    </LegalPageLayout>
  );
}
