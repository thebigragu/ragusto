import { legalLinkClass as linkClass } from "@/components/legal/legalStyles";
import { SITE } from "@/lib/seo";
import Link from "next/link";

export function ReferralProgramTermsContent() {
  return (
    <div className="space-y-8">
      <header className="legal-page-header space-y-4 border-b border-border pb-8 overflow-visible">
        <h1 className="legal-page-title">Ragusto Referral Program Terms</h1>
        <p className="text-lg text-fg-muted leading-relaxed">
          Eligibility, attribution, and credits for customer referrals
        </p>
        <p className="text-sm text-fg-muted">Effective date: September 12, 2026</p>
        <p className="text-sm text-fg-muted">Version: 1.0</p>
        <p className="text-sm text-fg-muted">Operator: Ragusto</p>
        <p className="text-sm font-medium tracking-wide text-fg-muted">
          FOR ELIGIBLE RAGUSTO BUSINESS AND COMMERCIAL CUSTOMERS
        </p>
        <p className="text-xs tracking-[0.3em] text-fg-muted uppercase">RAGUSTO</p>
      </header>

      <div className="rounded-lg border border-border bg-bg-muted/40 p-5 text-sm text-fg-muted leading-relaxed">
        These Referral Program Terms govern only referral eligibility, attribution, and credits. They
        supplement the Website and Application Services Agreement and do not otherwise change
        ownership, subscription length, cancellation, application scope, domain rights, data
        responsibilities, or other unrelated terms.
      </div>

      <section className="space-y-4">
        <h2 className="legal-section-title">1. Program Purpose and Relationship to the Client Service Terms</h2>
        <p className="text-fg-muted leading-relaxed">
          The Referral Program allows eligible Ragusto customers to receive a Referral Credit after
          making a Successful Referral. Participation is voluntary.
        </p>
        <p className="text-fg-muted leading-relaxed">
          These Referral Program Terms supplement the Website and Application Services Agreement,
          also described as the{" "}
          <Link href="/client-service-terms" className={linkClass}>
            Client Service Terms
          </Link>
          . The Client Service Terms continue to govern the Customer&apos;s Website Subscription,
          Application, and other Services. These Referral Program Terms govern only referral
          eligibility, attribution, and credits.
        </p>
        <p className="text-fg-muted leading-relaxed">
          If there is a direct conflict concerning a Referral Credit, these Referral Program Terms
          control only to the extent necessary to administer that Referral Credit. The Referral
          Program does not otherwise amend ownership, subscription length, cancellation, application
          scope, domain rights, data responsibilities, or other unrelated terms.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="legal-section-title">2. Acceptance</h2>
        <p className="text-fg-muted leading-relaxed">
          A Customer accepts these Referral Program Terms by submitting or communicating a referral
          after receiving or accessing the Referral Program Terms link; asking Ragusto to record or
          evaluate a referral under the program; accepting or using a Referral Credit; or using
          another referral-submission process Ragusto may provide.
        </p>
        <p className="text-fg-muted leading-relaxed">
          Ragusto may retain records of the applicable Referral Program Terms version, the referring
          Customer, the referred prospect, the referral date, relevant communications, qualification
          and activation dates, the credit amount, and the invoice to which the credit was applied.
        </p>
        <p className="text-fg-muted leading-relaxed">
          Participation in the Referral Program does not require the Customer to reaccept the entire
          Client Service Terms.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="legal-section-title">3. Eligible Referring Customers</h2>
        <p className="text-fg-muted leading-relaxed">
          An &quot;Eligible Referrer&quot; is a Customer that has an active recurring Website
          Subscription or recurring Application service; has an upcoming eligible base monthly
          recurring charge against which a Referral Credit can be applied; and is current on
          undisputed amounts and not suspended for overdue payment or material breach when the
          credit is applied.
        </p>
        <p className="text-fg-muted leading-relaxed">
          A person with only a completed one-time purchase and no active recurring Service does not
          have an eligible monthly invoice to credit. Ragusto may separately offer a different
          written reward to such a customer, but no cash or alternative reward is automatically owed.
        </p>
        <p className="text-fg-muted leading-relaxed">
          Employees, contractors, or agents of Ragusto are not eligible unless Ragusto expressly
          approves otherwise in writing.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="legal-section-title">4. Qualifying Referrals</h2>
        <p className="text-fg-muted leading-relaxed">
          A &quot;Qualifying Referral&quot; is a referral of a bona fide new Website or Application
          prospect that is identified to Ragusto before the prospect completes the applicable
          purchase or activation; is not already a Ragusto customer; is not already recorded in
          Ragusto&apos;s CRM or sales pipeline as an active prospect; is not already in an active
          sales discussion with Ragusto; was not previously referred by another person; is not the
          referring Customer itself, an attempt at self-referral, or merely another account used to
          circumvent the program; and has a genuine potential need for a Ragusto Website or
          Application service.
        </p>
        <p className="text-fg-muted leading-relaxed">
          Ragusto may require enough information to identify and contact the prospect and verify the
          referral. Referrals should be made through a direct introduction or with the
          prospect&apos;s permission.
        </p>
        <p className="text-fg-muted leading-relaxed">
          The referrer must not submit fabricated or misleading prospect information; represent that
          it is employed by, partnered with, or authorized to bind Ragusto; make promises about
          Ragusto&apos;s pricing, scope, timing, or results unless Ragusto has authorized those
          statements; use unlawful, deceptive, or abusive marketing practices; send spam or make
          unauthorized communications on Ragusto&apos;s behalf; or share personal contact
          information without appropriate permission or lawful authority.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="legal-section-title">5. Duplicate and Pre-Existing Referrals</h2>
        <p className="text-fg-muted leading-relaxed">
          A prospect can produce only one referral reward. The first eligible referral that Ragusto
          can reasonably verify and document receives attribution. Later duplicate referrals do not
          receive additional credits.
        </p>
        <p className="text-fg-muted leading-relaxed">
          Ragusto&apos;s existing CRM, communication, and sales records may be used to determine
          whether the prospect was already known or previously referred.
        </p>
        <p className="text-fg-muted leading-relaxed">
          A referred customer purchasing both a Website and one or more Applications counts as one
          referred customer and earns one Referral Credit, unless Ragusto expressly offers otherwise
          in writing. A later purchase by the same referred customer does not create another
          Referral Credit unless Ragusto expressly establishes a different offer.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="legal-section-title">6. Successful Referral</h2>
        <p className="text-fg-muted leading-relaxed">
          A &quot;Successful Referral&quot; is a Qualifying Referral where the referred prospect
          becomes a genuine new Ragusto customer; the referred customer accepts the applicable
          Client Service Terms and Product Description; the referred customer provides all required
          payment authorization; a qualifying Website Subscription or Application service activates,
          or an eligible paid one-time Application engagement begins; any Project Reservation
          Payment, initial subscription payment, build fee, or other amount required at that stage
          has successfully cleared; the payment has not been duplicated, unauthorized, refunded,
          reversed, or charged back; and the transaction is not fraudulent, artificial, or
          structured primarily to generate a referral reward.
        </p>
        <p className="text-fg-muted leading-relaxed">
          A Project Reservation Payment by itself does not complete a Successful Referral if the
          referred customer withdraws before the qualifying Website Subscription or Application
          activates.
        </p>
        <p className="text-fg-muted leading-relaxed">
          Once Ragusto can verify that all Successful Referral conditions have been met, the
          Referral Credit becomes earned and is assigned immediately to the next eligible invoice.
          There is no additional waiting period after that verification.
        </p>
        <p className="text-fg-muted leading-relaxed">
          If the qualifying transaction is later refunded, reversed, declared unauthorized, or
          charged back, Ragusto may cancel the credit if it has not yet been applied. If the credit
          has already been applied, Ragusto may add an equivalent adjustment to a future invoice
          after providing a written explanation. Ragusto will not recover more than the actual
          credit that became unsupported.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="legal-section-title">7. Referral Reward</h2>
        <p className="text-fg-muted leading-relaxed">
          For each Successful Referral, Ragusto provides one Referral Credit equal to one base
          monthly recurring charge for one eligible recurring Service of the referring Customer. The
          advertised reward is one free base subscription month, not necessarily the Customer&apos;s
          entire invoice.
        </p>
        <p className="text-fg-muted leading-relaxed">
          The credit applies to the base recurring Website Subscription fee or base recurring
          Application fee selected for the program. It does not automatically cover one-time fees,
          Build and Launch Fees, Project Reservation Payments, domain fees, add-ons, usage charges,
          third-party charges, data overages, migration work, overdue amounts, collection costs,
          interest, or separately purchased Services. It covers applicable taxes only to the extent
          the billing platform and applicable tax law reduce taxes as a result of the credited base
          fee.
        </p>
        <p className="text-fg-muted leading-relaxed">
          A Referral Credit cannot cause an invoice to have a negative balance. It has no cash
          value, is not refundable, is not transferable, cannot be assigned to another customer,
          cannot be exchanged for another service, and cannot be applied retroactively to an invoice
          that has already been paid or entered active payment processing.
        </p>
        <p className="text-fg-muted leading-relaxed">
          If the referring Customer has more than one eligible recurring Service, Ragusto may
          reasonably designate which base recurring Service receives the credit and should record or
          communicate that designation.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="legal-section-title">8. Immediate Automatic Application</h2>
        <p className="text-fg-muted leading-relaxed">
          Once a referral becomes a Successful Referral and Ragusto verifies it, the Referral Credit
          is immediately committed to the referring Customer&apos;s next eligible monthly invoice
          that has not already been paid or entered active payment processing. The Customer cannot
          choose to save, defer, postpone, redirect, or bank the credit for a preferred later date.
        </p>
        <p className="text-fg-muted leading-relaxed">
          If the immediately upcoming invoice has already been finalized in a manner that cannot
          reasonably be adjusted, is already processing, or has already been paid, the credit
          applies to the next eligible unprocessed monthly invoice. An invoice already receiving a
          complete 100% base-fee discount, including the first-month Project Reservation Payment
          discount, is not an eligible invoice. The credit applies to the next invoice carrying a
          positive eligible base recurring charge.
        </p>
        <p className="text-fg-muted leading-relaxed">
          The credit must be applied automatically at the earliest technically and contractually
          eligible opportunity. The credit cannot be held as a general cash-equivalent customer
          balance and cannot be used against past-due amounts.
        </p>
        <p className="text-fg-muted leading-relaxed">
          If the Customer cancels or the applicable recurring Service ends before the credit can be
          applied, the unapplied credit expires and no cash payment, refund, or substitute benefit
          is owed.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="legal-section-title">9. Multiple Successful Referrals</h2>
        <p className="text-fg-muted leading-relaxed">
          Each Successful Referral earns one free base subscription month. No more than one Referral
          Credit may be applied to a single monthly service period or invoice.
        </p>
        <p className="text-fg-muted leading-relaxed">
          If more than one referral becomes successful before the next eligible invoice, each earned
          credit is automatically assigned in chronological order to the earliest successive eligible
          monthly invoices. A valid additional referral is not forfeited merely because another
          credit is already assigned to the next invoice.
        </p>
        <p className="text-fg-muted leading-relaxed">
          The Customer cannot choose different application dates, combine multiple credits into
          cash, a refund, a negative invoice, or an oversized single-invoice credit, or voluntarily
          save, redirect, or defer credits. The administrative sequencing of multiple automatically
          earned credits does not create a cash balance or a Customer-controlled right to bank or
          defer credits.
        </p>
        <p className="text-fg-muted leading-relaxed">
          Each automatically assigned credit remains conditional on the referring Customer
          maintaining the eligible recurring Service through the invoice to which that credit is
          assigned. If the recurring Service ends before a scheduled credit can be applied, the
          unapplied credit expires.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="legal-section-title">10. Effect on the Initial Term and Minimum Committed Fees</h2>
        <p className="text-fg-muted leading-relaxed">
          A valid Referral Credit satisfies the credited portion of the applicable monthly base
          recurring charge. The Customer is not in payment default for the amount validly covered by
          the credit. The credited monthly service period remains an active service period and
          counts toward the Website Subscription&apos;s 12-month Initial Term.
        </p>
        <p className="text-fg-muted leading-relaxed">
          The credit does not pause, restart, or extend the Initial Term and does not create an
          additional free service period after the Initial Term. The credit is an authorized
          promotional adjustment granted by Ragusto.
        </p>
        <p className="text-fg-muted leading-relaxed">
          The Initial Term and Minimum Committed Fees remain calculated before referral credits, but
          the Customer is not personally required to pay the portion Ragusto validly satisfies
          through a Referral Credit. All uncredited fees and charges remain payable.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="legal-section-title">11. Administration and Verification</h2>
        <p className="text-fg-muted leading-relaxed">
          Ragusto may verify whether a prospect was genuinely referred; review CRM, payment,
          communication, and activation records; request reasonable supporting information; resolve
          duplicate attribution based on reasonably available records; refuse referrals involving
          fraud, abuse, misrepresentation, self-referral, artificial transactions, or attempts to
          circumvent the rules; correct administrative or billing errors; and suspend evaluation
          while relevant payments or chargebacks are unresolved.
        </p>
        <p className="text-fg-muted leading-relaxed">
          Ragusto will administer valid referrals reasonably and in good faith. Ragusto will not
          deny an otherwise valid referral without a reasonable program-related basis.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="legal-section-title">12. Program Changes and Termination</h2>
        <p className="text-fg-muted leading-relaxed">
          Ragusto may modify, suspend, or discontinue the Referral Program prospectively; change the
          reward offered for future referrals; introduce reasonable eligibility or administration
          changes; and publish a new version of the Referral Program Terms with a new effective
          date. The Referral Program is not guaranteed to remain available indefinitely.
        </p>
        <p className="text-fg-muted leading-relaxed">
          A change does not retroactively remove a Referral Credit already earned through a
          Successful Referral. A referral already properly submitted will be assessed under the
          Referral Program Terms in effect when that referral was submitted, unless the change is
          reasonably necessary to address fraud, abuse, security, legal requirements, or an obvious
          administrative error.
        </p>
        <p className="text-fg-muted leading-relaxed">
          Continuing to submit new referrals after updated terms become effective constitutes
          acceptance of the updated terms for those new referrals.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="legal-section-title">13. Privacy and Communications</h2>
        <p className="text-fg-muted leading-relaxed">
          Referral information may be used to verify the referral, contact the prospect, provide
          information about Ragusto&apos;s Services, administer the program, prevent abuse, and
          maintain business records.
        </p>
        <p className="text-fg-muted leading-relaxed">
          Ragusto&apos;s{" "}
          <Link href="/privacy-policy" className={linkClass}>
            Privacy Policy
          </Link>{" "}
          continues to apply. The referrer must not provide sensitive personal information and
          should obtain permission before sharing non-public personal contact details.
        </p>
        <p className="text-fg-muted leading-relaxed">
          A referral does not guarantee that Ragusto may send unlimited commercial emails or text
          messages to the prospect. Ragusto and the referrer remain responsible for their respective
          compliance with applicable privacy, marketing, and anti-spam requirements.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="legal-section-title">14. No Agency, Employment, or Cash Commission</h2>
        <p className="text-fg-muted leading-relaxed">
          Participation does not make the Customer an employee, contractor, agent, broker,
          franchisee, partner, or legal representative of Ragusto. It does not authorize the
          Customer to negotiate, quote binding prices, enter contracts, or make guarantees on
          Ragusto&apos;s behalf.
        </p>
        <p className="text-fg-muted leading-relaxed">
          The program provides only the stated service credit. It does not create a cash commission,
          wage, ownership interest, or continuing revenue share.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="legal-section-title">15. Suspension, Cancellation, and Expiration</h2>
        <p className="text-fg-muted leading-relaxed">
          A credit cannot be applied while the receiving Service is terminated or lacks an upcoming
          eligible invoice. A validly pending credit may be temporarily withheld while an account is
          suspended for overdue payment, fraud, abuse, or material breach. A credit does not erase
          unrelated overdue amounts or cure a separate breach.
        </p>
        <p className="text-fg-muted leading-relaxed">
          If the eligible recurring Service is cancelled or terminated before the credit&apos;s
          assigned invoice, the credit expires without cash value. An already applied valid credit
          is not clawed back solely because the Customer later cancels, unless the underlying
          referral payment was refunded, reversed, unauthorized, fraudulent, or charged back.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="legal-section-title">16. Disclaimer and Limitation of Liability</h2>
        <p className="text-fg-muted leading-relaxed">
          The disclaimers and liability limitations in the Client Service Terms apply to
          administration of the Referral Program to the maximum extent permitted by law.
        </p>
        <p className="text-fg-muted leading-relaxed">
          Ragusto does not guarantee that a referred prospect will become a customer. Ragusto is not
          required to accept every prospect or engagement and retains reasonable discretion over
          whether a proposed engagement fits its Services.
        </p>
        <p className="text-fg-muted leading-relaxed">
          No credit is earned merely because Ragusto contacts, meets with, prepares a preview for,
          or sends a proposal to a prospect. The referral must satisfy the complete Successful
          Referral definition.
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="legal-section-title">17. Governing Law, Notices, and General Terms</h2>
        <p className="text-fg-muted leading-relaxed">
          These Referral Program Terms are governed by the laws of Ontario and the federal laws of
          Canada applicable in Ontario, without regard to conflict-of-law rules.
        </p>
        <p className="text-fg-muted leading-relaxed">
          The parties will first attempt in good faith to resolve a dispute through direct
          discussion. If not resolved, the parties submit to the exclusive jurisdiction of the
          courts of Ontario sitting in the judicial region in which Ragusto principally carries on
          business, unless the parties agree in writing to mediation or another process.
        </p>
        <p className="text-fg-muted leading-relaxed">
          Notices to Ragusto may be sent to{" "}
          <a className={linkClass} href={`mailto:${SITE.email}`}>
            jacob@ragusto.com
          </a>
          . Email notice is considered received on the next business day after sending unless the
          sender receives a delivery-failure notice.
        </p>
        <p className="text-fg-muted leading-relaxed">
          If a provision is unenforceable, it will be modified to the minimum extent necessary or
          severed, and the remaining provisions continue. Failure to enforce a provision is not a
          waiver. Headings are for convenience only. Electronic acceptance is effective. Provisions
          concerning fraud, payment adjustments, privacy, liability, and disputes survive
          termination of program participation.
        </p>
      </section>

      {"\n"}
      <nav aria-label="Page navigation">
        <Link href="/" className="inline-block text-sm text-fg-muted hover:text-fg">
          ← Back home
        </Link>
      </nav>
    </div>
  );
}
