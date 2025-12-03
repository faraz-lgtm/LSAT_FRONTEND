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
                <h2 className="text-2xl font-semibold mt-8 mb-4">Introduction</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Welcome to our platform. These Terms of Service ("Terms") govern your access to and 
                  use of our services. By accessing or using our services, you agree to be bound by 
                  these Terms. If you disagree with any part of these Terms, you may not access or 
                  use our services.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold mt-8 mb-4">Acceptance of Terms</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  By creating an account, accessing, or using our services, you acknowledge that you 
                  have read, understood, and agree to be bound by these Terms and our Privacy Policy. 
                  These Terms apply to all users of the service, including without limitation users 
                  who are browsers, vendors, customers, merchants, and contributors of content.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold mt-8 mb-4">Use of Service</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  You agree to use our services only for lawful purposes and in accordance with these 
                  Terms. You agree not to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                  <li>Violate any applicable local, state, national, or international law or regulation</li>
                  <li>Transmit any malicious code, viruses, or harmful data</li>
                  <li>Attempt to gain unauthorized access to any portion of the service</li>
                  <li>Interfere with or disrupt the service or servers connected to the service</li>
                  <li>Use the service to harass, abuse, or harm other users</li>
                  <li>Impersonate any person or entity or misrepresent your affiliation with any person or entity</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold mt-8 mb-4">User Accounts</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  To access certain features of our service, you may be required to create an account. 
                  You are responsible for maintaining the confidentiality of your account credentials 
                  and for all activities that occur under your account. You agree to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                  <li>Provide accurate, current, and complete information when creating your account</li>
                  <li>Maintain and promptly update your account information</li>
                  <li>Maintain the security of your password and identification</li>
                  <li>Notify us immediately of any unauthorized use of your account</li>
                  <li>Accept responsibility for all activities that occur under your account</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold mt-8 mb-4">Payment Terms</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  If you purchase any paid services, you agree to pay all fees associated with such 
                  services. All fees are non-refundable unless otherwise stated or required by law. 
                  You are responsible for providing accurate payment information and authorizing us 
                  to charge your payment method for the services you purchase.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold mt-8 mb-4">Intellectual Property</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  The service and its original content, features, and functionality are owned by us 
                  and are protected by international copyright, trademark, patent, trade secret, and 
                  other intellectual property laws. You may not modify, reproduce, distribute, create 
                  derivative works, publicly display, or in any way exploit any of the content, 
                  features, or functionality of the service without our prior written permission.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold mt-8 mb-4">Termination</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  We may terminate or suspend your account and access to the service immediately, 
                  without prior notice or liability, for any reason whatsoever, including without 
                  limitation if you breach these Terms. Upon termination, your right to use the 
                  service will immediately cease.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold mt-8 mb-4">Disclaimer of Warranties</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  The service is provided on an "as is" and "as available" basis. We make no 
                  warranties, expressed or implied, and hereby disclaim all warranties including, 
                  without limitation, implied warranties of merchantability, fitness for a particular 
                  purpose, or non-infringement of intellectual property or other violation of rights.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold mt-8 mb-4">Limitation of Liability</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  In no event shall we, our directors, employees, partners, agents, suppliers, or 
                  affiliates be liable for any indirect, incidental, special, consequential, or 
                  punitive damages, including without limitation, loss of profits, data, use, goodwill, 
                  or other intangible losses, resulting from your use of the service.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold mt-8 mb-4">Changes to Terms</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  We reserve the right, at our sole discretion, to modify or replace these Terms at 
                  any time. If a revision is material, we will try to provide at least 30 days notice 
                  prior to any new terms taking effect. What constitutes a material change will be 
                  determined at our sole discretion.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Information</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  If you have any questions about these Terms of Service, please contact us through 
                  our support channels.
                </p>
              </section>

              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Last updated: {new Date().toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
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

