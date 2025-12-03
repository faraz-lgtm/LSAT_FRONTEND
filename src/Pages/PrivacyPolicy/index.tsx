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
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold mt-8 mb-4">Introduction</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  We respect your privacy and are committed to protecting your personal data. 
                  This privacy policy explains how we collect, use, and safeguard your information 
                  when you use our services.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold mt-8 mb-4">Information We Collect</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  We may collect the following types of information:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                  <li>Personal identification information (name, email address, phone number)</li>
                  <li>Payment information (processed securely through third-party payment processors)</li>
                  <li>Usage data and analytics information</li>
                  <li>Communication data when you contact us</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold mt-8 mb-4">How We Use Your Information</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  We use the information we collect to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process your transactions and send related information</li>
                  <li>Send you technical notices and support messages</li>
                  <li>Respond to your comments and questions</li>
                  <li>Monitor and analyze trends and usage</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold mt-8 mb-4">Data Security</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  We implement appropriate technical and organizational security measures to protect 
                  your personal data against unauthorized access, alteration, disclosure, or destruction. 
                  However, no method of transmission over the Internet is 100% secure.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold mt-8 mb-4">Data Sharing</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  We do not sell your personal information. We may share your information only in 
                  the following circumstances:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                  <li>With service providers who assist us in operating our services</li>
                  <li>When required by law or to protect our rights</li>
                  <li>With your explicit consent</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold mt-8 mb-4">Your Rights</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  You have the right to:
                </p>
                <ul className="list-disc pl-6 space-y-2 text-gray-700 dark:text-gray-300">
                  <li>Access your personal data</li>
                  <li>Correct inaccurate or incomplete data</li>
                  <li>Request deletion of your personal data</li>
                  <li>Object to processing of your personal data</li>
                  <li>Request restriction of processing</li>
                  <li>Data portability</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold mt-8 mb-4">Cookies</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  We use cookies and similar tracking technologies to track activity on our service 
                  and hold certain information. You can instruct your browser to refuse all cookies 
                  or to indicate when a cookie is being sent.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold mt-8 mb-4">Changes to This Policy</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  We may update our Privacy Policy from time to time. We will notify you of any 
                  changes by posting the new Privacy Policy on this page and updating the 
                  "Last updated" date.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold mt-8 mb-4">Contact Us</h2>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  If you have any questions about this Privacy Policy, please contact us through 
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

export default PrivacyPolicy;


