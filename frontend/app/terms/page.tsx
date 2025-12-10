"use client";

import BackButton from "@/components/BackButton";

export default function TermsPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <BackButton />

      <h1 className="text-2xl font-bold mb-4">Terms of Use</h1>

      <p className="leading-relaxed text-sm text-slate-700 dark:text-slate-300">
        1. Acceptance of Terms By accessing the CYC Zine website or using any
        features (including event browsing, saving favorites, and Google-based
        login), you agree to comply with these Terms of Use. If you do not
        agree, please stop using the Service. 2. Description of Service CYC
        Studio provides: Browsing of Taiwan cultural events retrieved from
        public government open data. A user account system powered by Google
        Login. A personal “Favorites” collection feature. Event display,
        descriptions, and external links when available. This Service is
        provided for personal, non-commercial use. 3. User Accounts To access
        personalized features, users may sign in with Google OAuth. By
        registering or logging in, you agree: You will not impersonate others.
        You will provide accurate information (Google provides basic profile
        only). You are responsible for activity under your account. You may
        request deletion of your data at any time. 4. Allowed Usage You may use
        CYC Zine for: Viewing cultural events. Saving favorite events. Browsing
        editorial content (“Special Columns”). 5. Prohibited Actions Users may
        not: Attempt to hack, disrupt, or reverse engineer the Service. Scrape
        data excessively or perform automated crawling. Upload harmful content,
        spam, or malicious scripts. Misuse government open data for illegal
        purposes. CYC Zine reserves the right to suspend or terminate users who
        violate these rules. 6. External Content & Links Some content and links
        come from: Taiwan Ministry of Culture open data Third-party event
        organizers or websites CYC Zine is not responsible for the accuracy,
        availability, or safety of external links or third-party content. 7.
        Intellectual Property All UI, design, layout, brand assets, and custom
        content created by CYC Zine are protected by applicable copyright laws.
        Event data and images from the Ministry of Culture remain governed by
        their respective open data licenses. 8. Service Availability CYC Zine is
        a best-effort service. We do not guarantee: That the site will be
        available at all times That data will remain accurate That errors will
        not occur We may modify or discontinue features without notice. 9.
        Limitation of Liability CYC Zine is provided “as is” without warranty.
        We are not liable for: Inaccurate event data from external sources Loss
        of saved favorites Service outages or bugs Third-party website issues
        Your use of the Service is at your own risk. 10. Changes to Terms We may
        update these Terms at any time. Continued use of the Service means you
        accept the updated Terms. 11. Contact For questions or data removal
        requests, please contact: 📧 cy4309@gmail.com
      </p>
    </div>
  );
}
