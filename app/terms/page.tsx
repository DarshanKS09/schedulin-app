export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <h1 className="text-2xl font-semibold mb-4">Terms of Service</h1>
      <p className="mb-4 leading-relaxed">
        These Terms of Service govern your use of Slotify, a scheduling platform that helps users manage availability,
        accept bookings, and connect calendar services. By accessing or using the service, you agree to these terms.
      </p>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Acceptance of Terms</h2>
        <p className="mb-4 leading-relaxed">
          By creating an account, connecting a calendar, or using the public booking features, you agree to be bound
          by these Terms of Service and any applicable laws or regulations.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Description of Service</h2>
        <p className="mb-4 leading-relaxed">
          Slotify provides a scheduling service that allows hosts to define availability, receive bookings, and create
          calendar events. The service may include integrations with third-party providers such as Google Calendar.
        </p>
        <p className="mb-4 leading-relaxed">
          This service may depend on third-party providers such as Google Calendar, and we are not responsible for
          failures caused by these services.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">User Responsibilities</h2>
        <p className="mb-4 leading-relaxed">
          You are responsible for maintaining accurate account information, protecting your login credentials, and
          using the service lawfully. You agree not to misuse the platform, interfere with service operations, or use
          the application to submit false, harmful, or unauthorized booking data.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Limitation of Liability</h2>
        <p className="mb-4 leading-relaxed">
          To the fullest extent permitted by law, Slotify and its operators are not liable for indirect, incidental,
          special, consequential, or punitive damages, including lost data, lost business, or missed meetings arising
          from use of the service.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">Service Availability</h2>
        <p className="mb-4 leading-relaxed">
          We strive to keep Slotify available and reliable, but we do not guarantee uninterrupted or error-free
          service. Features may change, be suspended, or become unavailable due to maintenance, third-party failures,
          security concerns, or circumstances outside our control.
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Changes to These Terms</h2>
        <p className="mb-4 leading-relaxed">
          We may update these Terms of Service from time to time. Continued use of Slotify after updated terms are
          published constitutes acceptance of the revised terms.
        </p>
      </section>
    </div>
  );
}
