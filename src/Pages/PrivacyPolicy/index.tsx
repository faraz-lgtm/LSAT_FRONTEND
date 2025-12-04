const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen customer-page-bg">
      <div className="customer-container">
        <div className="customer-content py-8 sm:py-12">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <h1 
              className="customer-page-heading mb-8"
              style={{ fontSize: 'var(--customer-heading-font-size)' }}
            >
              Privacy Policy
            </h1>
            
            <div className="prose prose-lg dark:prose-invert max-w-none space-y-6">
              <div className="mb-6">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Effective Date: August 12, 2025
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Last Updated: August 12, 2025
                </p>
              </div>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold mt-8 mb-4">1. Information We Collect</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  We collect:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                  <li><strong>Information you provide:</strong> Name, email, phone number, payment details, LSAT-related preferences</li>
                  <li><strong>Automatically collected data:</strong> IP address, browser type, device information, usage analytics (via cookies and similar technologies)</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold mt-8 mb-4">2. How We Use Your Information</h2>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                  <li>To deliver, schedule, and manage coaching sessions</li>
                  <li>To send reminders, updates, and service-related communication</li>
                  <li>To analyze site usage and improve services</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold mt-8 mb-4">3. Sharing & Disclosure</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  We do not sell personal information. We may share your data only with:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                  <li>Trusted service providers (payment processors, scheduling tools)</li>
                  <li>Authorities when required by law</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold mt-8 mb-4">4. Data Retention & Security</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  We retain your data as long as necessary for service delivery or as required by law. We use encryption, secure servers, and access controls to protect your information.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold mt-8 mb-4">5. Your Rights</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  You may request access, correction, or deletion of your data by emailing{' '}
                  <a href="mailto:support@betterlsat.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                    support@betterlsat.com
                  </a>.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold mt-8 mb-4">6. Children's Privacy</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Our services are not directed to individuals under 16, and we do not knowingly collect their data.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold mt-8 mb-4">7. Changes to This Policy</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Any updates will be posted with a new "Last Updated" date.
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

export default PrivacyPolicy;
