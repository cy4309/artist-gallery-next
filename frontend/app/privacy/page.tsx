"use client";

import BackButton from "@/components/BackButton";

export default function PrivacyPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <BackButton />

      <h2 className="text-2xl font-bold mb-6">Privacy Policy</h2>

      <div className="space-y-6 text-sm leading-relaxed text-slate-700 dark:text-slate-300">
        <p>
          <strong>Last updated:</strong> 2025-12-18
        </p>

        {/* 1 */}
        <section>
          <h3 className="font-semibold text-base mb-2">
            1. Information We Collect
          </h3>

          <h4 className="font-medium mt-3 mb-1">1.1 Google Login Data</h4>
          <p>When you sign in with Google, we collect:</p>
          <ul className="list-disc pl-5">
            <li>Your name</li>
            <li>Your email address</li>
            <li>Your Google profile photo</li>
            <li>Your Google account ID</li>
          </ul>
          <p className="mt-2">We do not access:</p>
          <ul className="list-disc pl-5">
            <li>Your contacts</li>
            <li>Your Gmail</li>
            <li>Your Google Drive</li>
            <li>Your private Google Calendar events</li>
          </ul>
          <p className="mt-2">
            Only basic profile data is used for authentication and account
            identification.
          </p>

          <h4 className="font-medium mt-4 mb-1">1.2 LINE Login / LIFF Data</h4>
          <p>When you use CYC Zine via LINE Login or LIFF, we may collect:</p>
          <ul className="list-disc pl-5">
            <li>Your LINE user ID</li>
            <li>Your display name</li>
            <li>Your profile picture (if provided by LINE)</li>
          </ul>
          <p className="mt-2">
            We do not access your chat history, contacts, or private messages on
            LINE.
          </p>

          <h4 className="font-medium mt-4 mb-1">1.3 User Activity</h4>
          <ul className="list-disc pl-5">
            <li>The list of events you save as favorites</li>
            <li>Event-related metadata (title, date, location, link)</li>
            <li>Timestamps related to your account</li>
            <li>Basic logs for debugging (non-sensitive)</li>
          </ul>

          <h4 className="font-medium mt-4 mb-1">
            1.4 Automatically Collected Data
          </h4>
          <ul className="list-disc pl-5">
            <li>Browser type</li>
            <li>Device type</li>
            <li>General usage statistics</li>
          </ul>
          <p className="mt-2">
            We do not use cookies for advertising or cross-site tracking.
          </p>
        </section>

        {/* 2 */}
        <section>
          <h3 className="font-semibold text-base mb-2">
            2. How We Use Your Information
          </h3>
          <ul className="list-disc pl-5">
            <li>Authenticate your login (Google or LINE)</li>
            <li>Display your saved favorite events</li>
            <li>
              Enable optional LINE-based interactions (e.g. notifications)
            </li>
            <li>Maintain your account</li>
            <li>Improve website functionality</li>
          </ul>
          <p className="mt-2">
            We do not sell or share your personal data with advertisers.
          </p>
        </section>

        {/* 3 */}
        <section>
          <h3 className="font-semibold text-base mb-2">
            3. Where Your Data Is Stored
          </h3>
          <p>Your data is stored in:</p>
          <ul className="list-disc pl-5">
            <li>Google Apps Script (GAS)</li>
            <li>Google Sheets (user and favorites tables)</li>
          </ul>
          <p className="mt-2">
            These systems are used only for this project and are not shared with
            unrelated third parties.
          </p>
        </section>

        {/* 4 */}
        <section>
          <h3 className="font-semibold text-base mb-2">4. Cookies</h3>
          <ul className="list-disc pl-5">
            <li>
              <strong>HTTP-only session cookies</strong> — for secure
              authentication
            </li>
            <li>
              <strong>Public cookie (cyc_user)</strong> — used to display
              profile and favorite status
            </li>
          </ul>
          <p className="mt-2">
            No tracking, advertising, or analytics cookies are used.
          </p>
        </section>

        {/* 5 */}
        <section>
          <h3 className="font-semibold text-base mb-2">
            5. Third-Party Services
          </h3>
          <ul className="list-disc pl-5">
            <li>Google OAuth</li>
            <li>LINE Login / LIFF</li>
            <li>LINE Messaging API (optional notifications)</li>
            <li>Ministry of Culture Open Data API</li>
          </ul>
          <p className="mt-2">
            We are not responsible for the privacy policies or accuracy of
            external services.
          </p>
        </section>

        {/* 6 */}
        <section>
          <h3 className="font-semibold text-base mb-2">6. Data Retention</h3>
          <p>We keep your data as long as your account exists.</p>
          <p className="mt-1">
            You may request data deletion at any time by contacting:
            <br />
            📧 <strong>cy4309@gmail.com</strong>
          </p>
        </section>

        {/* 7 */}
        <section>
          <h3 className="font-semibold text-base mb-2">7. Your Rights</h3>
          <ul className="list-disc pl-5">
            <li>Request deletion of your account data</li>
            <li>Request correction of incorrect information</li>
            <li>Stop using the service at any time</li>
          </ul>
        </section>

        {/* 8 */}
        <section>
          <h3 className="font-semibold text-base mb-2">
            8. Children’s Privacy
          </h3>
          <p>
            CYC Zine does not target children under the age of 13 and does not
            knowingly collect data from minors.
          </p>
        </section>

        {/* 9 */}
        <section>
          <h3 className="font-semibold text-base mb-2">
            9. Changes to This Policy
          </h3>
          <p>
            We may update this Privacy Policy from time to time. The “Last
            updated” date will be revised accordingly.
          </p>
        </section>

        {/* 10 */}
        <section>
          <h3 className="font-semibold text-base mb-2">10. Contact</h3>
          <p>
            For any questions regarding this Privacy Policy, please contact:
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

// export default function PrivacyPage() {
//   return (
//     <div className="p-6 max-w-2xl mx-auto">
//       <BackButton />

//       <h2 className="text-2xl font-bold mb-4">Privacy Policy</h2>

//       <p className="leading-relaxed text-sm text-slate-700 dark:text-slate-300">
//         1. Information We Collect 1.1 Google Login Data When you sign in with
//         Google, we collect: Your name Your email address Your Google profile
//         photo Your Google account ID We do not access: Your contacts Your Gmail
//         Your Google Drive Your private Calendar events Only basic profile data
//         is used for authentication. 1.2 User Activity We store: The list of
//         events you save as favorites Timestamps related to your account Basic
//         logs for debugging (non-sensitive) 1.3 Automatically Collected Data We
//         may collect basic technical information such as: Browser type Device
//         type General usage statistics We do not use cookies for advertising or
//         tracking across other sites. 2. How We Use Your Information We use your
//         information to: Authenticate your login Display your saved favorite
//         events Maintain your account Improve website functionality We do not
//         sell or share your data with advertisers. 3. Where Your Data Is Stored
//         User profile and favorites are stored in: Google Apps Script + Google
//         Sheets (your user table + favorites table) These are used only for this
//         project and are not shared with third parties. 4. Cookies We use: •
//         httpOnly session cookies Used for secure authentication between browser
//         and server. • Non-HTTP-only public cookie (cyc_user) Used so the
//         front-end can show your profile and favorites. No tracking, advertising,
//         or analytics cookies are used. 5. Third-Party Services CYC Zine
//         interacts with: Google OAuth (for login) Ministry of Culture Open Data
//         API (event data) We are not responsible for policies or accuracy of
//         external content. 6. Data Retention We keep your data as long as your
//         account exists. You may request data deletion anytime by contacting us
//         at: 📧 cy4309@gmail.com 7. Your Rights You may: Request to delete all
//         your account data Request correction of incorrect profile information
//         Stop using the Service anytime 8. Children’s Privacy CYC Zine does not
//         target children under 13 and does not knowingly collect data from
//         minors. 9. Changes to This Policy We may update this Privacy Policy. We
//         will revise the “Last updated” date accordingly. 10. Contact For
//         inquiries, please contact: 📧 cy4309@gmail.com
//       </p>
//     </div>
//   );
// }
