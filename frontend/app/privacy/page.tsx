"use client";

import BackButton from "@/components/BackButton";

export default function PrivacyPage() {
  return (
    <div className="p-6 max-w-2xl mx-auto">
      <BackButton />

      <h2 className="text-2xl font-bold mb-4">Privacy Policy</h2>

      <p className="leading-relaxed text-sm text-slate-700 dark:text-slate-300">
        1. Information We Collect 1.1 Google Login Data When you sign in with
        Google, we collect: Your name Your email address Your Google profile
        photo Your Google account ID We do not access: Your contacts Your Gmail
        Your Google Drive Your private Calendar events Only basic profile data
        is used for authentication. 1.2 User Activity We store: The list of
        events you save as favorites Timestamps related to your account Basic
        logs for debugging (non-sensitive) 1.3 Automatically Collected Data We
        may collect basic technical information such as: Browser type Device
        type General usage statistics We do not use cookies for advertising or
        tracking across other sites. 2. How We Use Your Information We use your
        information to: Authenticate your login Display your saved favorite
        events Maintain your account Improve website functionality We do not
        sell or share your data with advertisers. 3. Where Your Data Is Stored
        User profile and favorites are stored in: Google Apps Script + Google
        Sheets (your user table + favorites table) These are used only for this
        project and are not shared with third parties. 4. Cookies We use: •
        httpOnly session cookies Used for secure authentication between browser
        and server. • Non-HTTP-only public cookie (cyc_user) Used so the
        front-end can show your profile and favorites. No tracking, advertising,
        or analytics cookies are used. 5. Third-Party Services CYC Zine
        interacts with: Google OAuth (for login) Ministry of Culture Open Data
        API (event data) We are not responsible for policies or accuracy of
        external content. 6. Data Retention We keep your data as long as your
        account exists. You may request data deletion anytime by contacting us
        at: 📧 cy4309@gmail.com 7. Your Rights You may: Request to delete all
        your account data Request correction of incorrect profile information
        Stop using the Service anytime 8. Children’s Privacy CYC Zine does not
        target children under 13 and does not knowingly collect data from
        minors. 9. Changes to This Policy We may update this Privacy Policy. We
        will revise the “Last updated” date accordingly. 10. Contact For
        inquiries, please contact: 📧 cy4309@gmail.com
      </p>
    </div>
  );
}
