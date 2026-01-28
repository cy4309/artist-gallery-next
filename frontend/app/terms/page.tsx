"use client";
import BackButton from "@/components/BackButton";

export default function TermsPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <BackButton className="mb-6" />

      <h1 className="text-2xl font-bold mb-6">Terms of Use</h1>

      <div className="space-y-6 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
        <p>
          <strong>Last updated:</strong> 2025-12-18
        </p>

        {/* 1 */}
        <section>
          <h2 className="font-semibold text-base mb-2">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or using CYC Zine (the “Service”), including browsing
            events, saving favorites, viewing editorial content, or signing in
            via Google or LINE, you agree to be bound by these Terms of Use.
          </p>
          <p className="mt-2">
            If you do not agree with these terms, please discontinue use of the
            Service.
          </p>
        </section>

        {/* 2 */}
        <section>
          <h2 className="font-semibold text-base mb-2">
            2. Description of the Service
          </h2>
          <p>CYC Zine provides the following features:</p>
          <ul className="list-disc pl-5">
            <li>
              Browsing cultural events in Taiwan sourced from public government
              open data
            </li>
            <li>User authentication via Google Login or LINE Login</li>
            <li>Saving and managing a personal list of favorite events</li>
            <li>Viewing editorial or interview-based content (“Columns”)</li>
            <li>Displaying event details and external links when available</li>
          </ul>
          <p className="mt-2">
            The Service is provided for personal and non-commercial use only.
          </p>
        </section>

        {/* 3 */}
        <section>
          <h2 className="font-semibold text-base mb-2">3. User Accounts</h2>
          <p>
            Certain features require you to sign in using Google OAuth or LINE
            Login. By using an account, you agree that:
          </p>
          <ul className="list-disc pl-5">
            <li>You will not impersonate another person or entity</li>
            <li>
              You will provide accurate information (basic profile data only)
            </li>
            <li>You are responsible for activities under your account</li>
          </ul>
          <p className="mt-2">
            You may request deletion of your account data at any time.
          </p>
        </section>

        {/* 4 */}
        <section>
          <h2 className="font-semibold text-base mb-2">4. Allowed Usage</h2>
          <p>You may use CYC Zine for:</p>
          <ul className="list-disc pl-5">
            <li>Viewing cultural and artistic events</li>
            <li>Saving and managing favorite events</li>
            <li>Browsing editorial and interview content</li>
          </ul>
        </section>

        {/* 5 */}
        <section>
          <h2 className="font-semibold text-base mb-2">
            5. Prohibited Actions
          </h2>
          <p>You agree not to:</p>
          <ul className="list-disc pl-5">
            <li>Attempt to hack, disrupt, or reverse engineer the Service</li>
            <li>
              Perform excessive scraping, crawling, or automated data access
            </li>
            <li>Upload or distribute harmful content, spam, or malware</li>
            <li>
              Misuse government open data for illegal or unauthorized purposes
            </li>
          </ul>
          <p className="mt-2">
            CYC Zine reserves the right to suspend or terminate access for users
            who violate these rules.
          </p>
        </section>

        {/* 6 */}
        <section>
          <h2 className="font-semibold text-base mb-2">
            6. External Content & Links
          </h2>
          <p>Some content and links provided by CYC Zine originate from:</p>
          <ul className="list-disc pl-5">
            <li>Taiwan Ministry of Culture open data</li>
            <li>Third-party event organizers or websites</li>
          </ul>
          <p className="mt-2">
            CYC Zine does not guarantee the accuracy, availability, or safety of
            third-party content or external links.
          </p>
        </section>

        {/* 7 */}
        <section>
          <h2 className="font-semibold text-base mb-2">
            7. Intellectual Property
          </h2>
          <p>
            All original UI design, layout, branding, and custom content created
            by CYC Zine are protected by applicable copyright laws.
          </p>
          <p className="mt-2">
            Event data, images, and descriptions sourced from the Ministry of
            Culture remain subject to their respective open data licenses.
          </p>
        </section>

        {/* 8 */}
        <section>
          <h2 className="font-semibold text-base mb-2">
            8. Service Availability
          </h2>
          <p>
            CYC Zine is provided on a best-effort basis. We do not guarantee:
          </p>
          <ul className="list-disc pl-5">
            <li>Continuous or uninterrupted availability</li>
            <li>Complete accuracy of all event data</li>
            <li>That errors or bugs will not occur</li>
          </ul>
          <p className="mt-2">
            We may modify, suspend, or discontinue features at any time without
            prior notice.
          </p>
        </section>

        {/* 9 */}
        <section>
          <h2 className="font-semibold text-base mb-2">
            9. Limitation of Liability
          </h2>
          <p>The Service is provided “as is” without warranties of any kind.</p>
          <p className="mt-2">CYC Zine is not liable for:</p>
          <ul className="list-disc pl-5">
            <li>Inaccurate or incomplete data from external sources</li>
            <li>Loss of saved favorites</li>
            <li>Service interruptions or technical issues</li>
            <li>Issues arising from third-party websites</li>
          </ul>
          <p className="mt-2">Your use of the Service is at your own risk.</p>
        </section>

        {/* 10 */}
        <section>
          <h2 className="font-semibold text-base mb-2">
            10. Changes to These Terms
          </h2>
          <p>
            We may update these Terms of Use from time to time. Continued use of
            the Service after changes are posted constitutes acceptance of the
            updated Terms.
          </p>
        </section>

        {/* 11 */}
        <section>
          <h2 className="font-semibold text-base mb-2">11. Contact</h2>
          <p>
            For questions, feedback, or data removal requests, please contact:
            <br />
            📧 <strong>cy4309@gmail.com</strong>
          </p>
        </section>
      </div>
    </div>
  );
}

// "use client";

// import BackButton from "@/components/BackButton";

// export default function TermsPage() {
//   return (
//     <div className="p-6 max-w-2xl mx-auto">
//       <BackButton />

//       <h1 className="text-2xl font-bold mb-4">Terms of Use</h1>

//       <p className="leading-relaxed text-sm text-slate-700 dark:text-slate-300">
//         1. Acceptance of Terms By accessing the CYC Zine website or using any
//         features (including event browsing, saving favorites, and Google-based
//         login), you agree to comply with these Terms of Use. If you do not
//         agree, please stop using the Service. 2. Description of Service CYC
//         Studio provides: Browsing of Taiwan cultural events retrieved from
//         public government open data. A user account system powered by Google
//         Login. A personal “Favorites” collection feature. Event display,
//         descriptions, and external links when available. This Service is
//         provided for personal, non-commercial use. 3. User Accounts To access
//         personalized features, users may sign in with Google OAuth. By
//         registering or logging in, you agree: You will not impersonate others.
//         You will provide accurate information (Google provides basic profile
//         only). You are responsible for activity under your account. You may
//         request deletion of your data at any time. 4. Allowed Usage You may use
//         CYC Zine for: Viewing cultural events. Saving favorite events. Browsing
//         editorial content (“Special Columns”). 5. Prohibited Actions Users may
//         not: Attempt to hack, disrupt, or reverse engineer the Service. Scrape
//         data excessively or perform automated crawling. Upload harmful content,
//         spam, or malicious scripts. Misuse government open data for illegal
//         purposes. CYC Zine reserves the right to suspend or terminate users who
//         violate these rules. 6. External Content & Links Some content and links
//         come from: Taiwan Ministry of Culture open data Third-party event
//         organizers or websites CYC Zine is not responsible for the accuracy,
//         availability, or safety of external links or third-party content. 7.
//         Intellectual Property All UI, design, layout, brand assets, and custom
//         content created by CYC Zine are protected by applicable copyright laws.
//         Event data and images from the Ministry of Culture remain governed by
//         their respective open data licenses. 8. Service Availability CYC Zine is
//         a best-effort service. We do not guarantee: That the site will be
//         available at all times That data will remain accurate That errors will
//         not occur We may modify or discontinue features without notice. 9.
//         Limitation of Liability CYC Zine is provided “as is” without warranty.
//         We are not liable for: Inaccurate event data from external sources Loss
//         of saved favorites Service outages or bugs Third-party website issues
//         Your use of the Service is at your own risk. 10. Changes to Terms We may
//         update these Terms at any time. Continued use of the Service means you
//         accept the updated Terms. 11. Contact For questions or data removal
//         requests, please contact: 📧 cy4309@gmail.com
//       </p>
//     </div>
//   );
// }
