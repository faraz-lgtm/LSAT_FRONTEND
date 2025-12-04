const TermsOfService = () => {
  return (
    <div className="min-h-screen customer-page-bg">
      <div className="customer-container">
        <div className="customer-content py-8 sm:py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <h1 
              className="customer-page-heading mb-8"
              style={{ fontSize: 'var(--customer-heading-font-size)' }}
            >
              Terms of Service
            </h1>
            
            <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  By booking or using any BetterLSAT service, you agree to these Terms of Use. These govern your use of our website, coaching sessions, and related services. If you do not agree, you must not use our services.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold mt-8 mb-4">2. Information We Collect</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  We collect and process:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                  <li>Information you provide (name, email, phone number, payment details, LSAT-related preferences).</li>
                  <li>Automatically collected data (IP address, browser type, device info, site usage analytics via cookies).</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold mt-8 mb-4">3. How We Use Your Information</h2>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                  <li>To deliver, schedule, and manage coaching sessions.</li>
                  <li>To send reminders, updates, and service-related communications.</li>
                  <li>To process payments securely.</li>
                  <li>To analyze site usage and improve services.</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold mt-8 mb-4">4. Sharing & Disclosure</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  We do not sell personal information. Data may be shared only with:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                  <li>Trusted third-party providers (payment processors, scheduling tools, analytics providers).</li>
                  <li>Authorities where legally required under Canadian law.</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold mt-8 mb-4">5. Data Retention & Security</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  We retain data only as long as required to provide services or as required by law.
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Security measures include encryption, secure servers, and restricted access.
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  We comply with the Personal Information Protection and Electronic Documents Act (PIPEDA) and other applicable Canadian privacy laws.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold mt-8 mb-4">6. Children's Privacy</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Our services are not directed to individuals under 16, and we do not knowingly collect their data.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold mt-8 mb-4">7. Session Bookings, Punctuality & Time Loss</h2>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                  <li>All sessions are prepaid.</li>
                  <li>Sessions start and end at the scheduled time. If you are late, that time is forfeited and will not be extended or refunded.</li>
                  <li>Missed sessions without notice are counted as used.</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold mt-8 mb-4">8. Cancellation & Rescheduling Policy</h2>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                  <li>Cancel or reschedule with at least 24 hours' notice to retain credit.</li>
                  <li>Notify us at least 1 hour before if you expect to be late.</li>
                  <li>Failure to provide notice results in session forfeiture.</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold mt-8 mb-4">9. Customer Responsibilities</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  You are responsible for:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                  <li>Providing accurate contact and payment information.</li>
                  <li>Having reliable internet, audio, and video setup for online sessions.</li>
                  <li>Ensuring a quiet, suitable environment for learning.</li>
                </ul>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Technical or personal issues on your end do not entitle you to extensions, reschedules, or refunds.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold mt-8 mb-4">10. Intellectual Property</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  All BetterLSAT materials (content, strategies, methods, and resources) are protected intellectual property. You may not copy, share, distribute, or resell them without written consent.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold mt-8 mb-4">11. Disclaimers & Limitation of Liability</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  BetterLSAT does not guarantee a specific LSAT score or admission result. Outcomes depend on individual preparation and effort.
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  We are not liable for losses from missed sessions, technical failures outside our control, or external factors.
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  To the fullest extent permitted by Canadian law, BetterLSAT's liability is limited to the amount you paid for the specific session(s) in question.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold mt-8 mb-4">12. Refund Policy</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Refunds are only available if BetterLSAT cancels a session or in exceptional cases at our discretion.
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  No refunds for lateness, no-shows, or violations of these Terms.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold mt-8 mb-4">13. No Performance Guarantees</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  BetterLSAT provides tutoring and study support to help you prepare for the LSAT, but we do not guarantee any specific LSAT score, score increase, law school admission, scholarship, or academic outcome.
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Your results depend on factors outside our control, including your prior knowledge, study habits, consistency, and test-day performance. Testimonials and success stories reflect individual experiences and are not promises of similar results.
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  By using BetterLSAT, you agree that your performance is your responsibility and that BetterLSAT is not liable for any outcome related to your LSAT score or admissions process.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold mt-8 mb-4">14. Indemnification</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  You agree to indemnify and hold harmless BetterLSAT, its staff, affiliates, and contractors from any claims, damages, or costs (including legal fees) arising from your misuse of services, breach of these Terms, or violation of Canadian law.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold mt-8 mb-4">15. Governing Law</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  These Terms are governed by the laws of the Province of Ontario, Canada, and the federal laws of Canada applicable therein. Any disputes shall be resolved exclusively in the courts located in Ontario, Canada.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold mt-8 mb-4">16. Changes to These Terms</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  We may update these Terms at any time. Updates take effect once posted on this page with an updated "Last Updated" date.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold mt-8 mb-4">17. Contact Us</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  For questions about these Terms or our policies, please contact us at:
                </p>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  <a href="mailto:support@betterlsat.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                    support@betterlsat.com
                  </a>
                </p>
              </section>

              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Last Updated: August 12, 2025
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
