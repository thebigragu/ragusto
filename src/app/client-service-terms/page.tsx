import { ClientServiceTermsContent } from "@/components/legal/ClientServiceTermsContent";
import { LegalPageLayout } from "@/components/legal/LegalPageLayout";
import { SITE } from "@/lib/seo";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Website and Application Services Agreement",
  description: `Managed websites, hosted applications, domains, maintenance, and related digital services for ${SITE.name}.`,
};

export default function ClientServiceTermsPage() {
  return (
    <LegalPageLayout>
      <ClientServiceTermsContent />
    </LegalPageLayout>
  );
}
