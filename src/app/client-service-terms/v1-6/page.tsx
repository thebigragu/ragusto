import { ClientServiceTermsV1_6 } from "@/components/legal/client-service-terms/ClientServiceTermsV1_6";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { legalLinkClass } from "@/components/legal/legalStyles";
import { SITE } from "@/lib/seo";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Website and Application Services Agreement (Version 1.6)",
  description: `Archived Version 1.6 of the ${SITE.name} Website and Application Services Agreement, effective September 12, 2026.`,
  robots: {
    index: false,
    follow: true,
  },
};

export default function ClientServiceTermsV16ArchivePage() {
  return (
    <LegalPageLayout>
      <p className="mb-8 text-sm text-fg-muted leading-relaxed">
        This page archives Version 1.6 of the Website and Application Services Agreement, effective
        September 12, 2026. It is preserved for reference and does not replace the{" "}
        <Link href="/client-service-terms" className={legalLinkClass}>
          current Client Service Terms
        </Link>
        .
      </p>
      <ClientServiceTermsV1_6 />
    </LegalPageLayout>
  );
}
