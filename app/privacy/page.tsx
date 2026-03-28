export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-semibold mb-4">Privacy Policy</h1>
      <p className="mb-4 leading-relaxed">
        Slotify is a scheduling platform that helps users manage availability, accept bookings, and connect Google
        Calendar for meeting coordination. This Privacy Policy explains what information we collect, how we use it,
        and how we protect it.
      </p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Data We Collect</h2>
        <p className="mb-4 leading-relaxed">
          We may collect your name, email address, booking information, and account details when you use Slotify. If
          you choose to connect Google Calendar, we also access limited Google Calendar data required to create and
          manage calendar events for your scheduled meetings.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">How We Use Data</h2>
        <p className="mb-4 leading-relaxed">
          We use collected information to schedule meetings, create calendar events, and send booking confirmations.
          We also use it to provide account access, display upcoming bookings, and support the core scheduling
          functionality of the application.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Google Data Usage</h2>
        <p className="mb-4 leading-relaxed">
          When you connect your Google Calendar, Slotify uses Google Calendar data strictly to create calendar events
          on your behalf when bookings are made.
        </p>
        <p className="mb-4 leading-relaxed">
          We do NOT:
        </p>
        <p className="mb-4 leading-relaxed">
          Read, access, or store your existing calendar events
          <br />
          Modify or delete any existing events
          <br />
          Use your Google data for advertising, analytics, or profiling
          <br />
          Share your Google data with third parties
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Data Sharing</h2>
        <p className="mb-4 leading-relaxed">
          Slotify does not sell personal information. We only use personal data to provide the core scheduling and
          calendar features of the service. Data may be processed by infrastructure providers that support hosting,
          storage, and secure application operations.
        </p>
        <p className="mb-4 leading-relaxed">
          We do NOT sell, rent, or trade your personal data to any third parties.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Third-Party Services</h2>
        <p className="mb-4 leading-relaxed">
          We use the following third-party services:
          <br />
          Google Calendar API (for event creation)
          <br />
          Vercel (for hosting and infrastructure)
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Data Security</h2>
        <p className="mb-4 leading-relaxed">
          We use secure storage, encrypted connections, authenticated access controls, and other industry-standard
          security practices designed to protect user information. While no system can guarantee absolute security, we
          take reasonable measures to safeguard the data we process.
        </p>
        <p className="mb-4 leading-relaxed">
          Google OAuth tokens are securely stored on our servers and are never exposed to the client. These tokens are
          used only to authenticate requests to Google Calendar for event creation.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Data Retention</h2>
        <p className="mb-4 leading-relaxed">
          We retain personal and booking data only as long as necessary to operate the service, comply with legal
          obligations, resolve disputes, and enforce our agreements. Users may request deletion of their data, and we
          will process such requests in accordance with applicable law and operational requirements.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Your Rights</h2>
        <p className="mb-4 leading-relaxed">
          You may request access to the personal data we hold about you, ask us to update inaccurate information, or
          request deletion of your data where applicable. To make a request, contact us using the information below.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
        <p className="mb-4 leading-relaxed">
          If you have questions about this Privacy Policy or want to request access, correction, or deletion of your
          data, please contact us at <a className="text-brand hover:text-teal-700" href="mailto:darshuks09@gmail.com">darshuks09@gmail.com</a>.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Compliance Statement</h2>
        <p className="mb-4 leading-relaxed">
          Slotify complies with the Google API Services User Data Policy, including the Limited Use requirements. We
          only use Google user data to provide and improve user-facing features directly related to scheduling and
          calendar event creation.
        </p>
      </section>
    </div>
  );
}
