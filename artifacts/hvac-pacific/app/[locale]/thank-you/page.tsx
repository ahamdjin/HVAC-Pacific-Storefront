import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/config/site";
import { hrefFor } from "@/components/paths";

export const metadata: Metadata = {
  title: "Thank You",
  description: "Thank you for contacting HVAC Pacific.",
  robots: { index: false, follow: false },
};

export default async function ThankYouPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const zh = locale === "zh";
  return (
    <main id="main">
      <div className="wrap page-shell narrow thank-you-shell">
        <section className="info-callout thank-you-card">
          <div className="thank-you-check" aria-hidden="true">✓</div>
          <h1>{zh ? "感谢您的联系" : "Thank you for reaching out"}</h1>
          <p className="thank-you-description">
            {zh ? "您的表单已提交。我们的团队会尽快与您联系。如需紧急帮助，请直接致电。" : "Your form has been submitted. Our team will follow up as soon as possible. For immediate assistance, please call us."}
          </p>
          <p><a href={`tel:${SITE.phoneE164}`}>{SITE.phone}</a></p>
          <Link className="btn primary" href={hrefFor(locale, "/")}>
            {zh ? "返回首页" : "Return to homepage"}
          </Link>
        </section>
      </div>
    </main>
  );
}
