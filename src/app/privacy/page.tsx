import Link from 'next/link'
import Image from 'next/image'

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <Link href="/" className="inline-flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Image
              src="/logo.png"
              alt="reTeach"
              width={40}
              height={40}
              className="rounded-xl"
            />
            <span className="text-xl font-bold text-gray-900">reTeach</span>
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Privacy Policy</h1>
        <p className="text-gray-600 mb-8">Last updated: October 2025</p>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              We collect information to provide and improve our services:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Account Information:</strong> Name, email address, and Google profile information when you sign in</li>
              <li><strong>Educational Content:</strong> Diagnostic assessments, questions, and course materials you create</li>
              <li><strong>Student Responses:</strong> Student names, email addresses (optional), and assessment responses</li>
              <li><strong>Usage Data:</strong> How you interact with our platform, including pages visited and features used</li>
              <li><strong>Technical Data:</strong> IP address, browser type, device information, and cookies</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              We use the collected information to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Provide and maintain our diagnostic assessment platform</li>
              <li>Process and analyze student responses using AI</li>
              <li>Generate insights and recommendations for educators</li>
              <li>Improve and optimize our service</li>
              <li>Communicate with you about service updates</li>
              <li>Ensure platform security and prevent fraud</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Student Data Protection</h2>
            <p className="text-gray-700 leading-relaxed">
              We are committed to protecting student privacy. Student data is used solely for educational purposes
              within the platform. We do not sell, rent, or share student data with third parties for marketing
              purposes. Student data is accessible only to the teacher who created the assessment and authorized
              school administrators.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Sharing and Disclosure</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              We may share your information with:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li><strong>Service Providers:</strong> Third-party services that help us operate the platform (e.g., cloud hosting, AI processing)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mt-3">
              We ensure all third-party service providers agree to protect your data in accordance with this policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
            <p className="text-gray-700 leading-relaxed">
              We implement industry-standard security measures to protect your data, including encryption in transit
              and at rest, secure authentication, and regular security audits. However, no method of transmission
              over the internet is 100% secure, and we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Retention</h2>
            <p className="text-gray-700 leading-relaxed">
              We retain your data for as long as your account is active or as needed to provide services.
              You may request deletion of your account and associated data at any time. Student assessment
              data is retained according to your school's retention policies or as required by law.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Your Rights</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              You have the right to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Access and review your personal information</li>
              <li>Correct inaccurate or incomplete data</li>
              <li>Request deletion of your data</li>
              <li>Export your data</li>
              <li>Opt-out of non-essential communications</li>
              <li>Withdraw consent where we rely on consent for processing</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Cookies and Tracking</h2>
            <p className="text-gray-700 leading-relaxed">
              We use cookies and similar technologies to maintain your session, remember your preferences,
              and analyze platform usage. You can control cookies through your browser settings, but
              disabling them may affect platform functionality.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Third-Party Services</h2>
            <p className="text-gray-700 leading-relaxed">
              Our platform uses Google OAuth for authentication. When you sign in with Google, you are subject
              to Google's Privacy Policy in addition to ours. We also use AI services to process and analyze
              educational content and student responses.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Children's Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              While students may use our platform, accounts are created and managed by teachers. We collect
              student information only as directed by educators and in compliance with applicable education
              privacy laws, including FERPA and COPPA where applicable.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. International Data Transfers</h2>
            <p className="text-gray-700 leading-relaxed">
              Your information may be transferred to and processed in countries other than your own.
              We ensure appropriate safeguards are in place to protect your data in accordance with this policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Changes to This Policy</h2>
            <p className="text-gray-700 leading-relaxed">
              We may update this Privacy Policy from time to time. We will notify you of significant changes
              by email or through the platform. Your continued use after changes are posted constitutes
              acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have questions about this Privacy Policy or how we handle your data, please contact us
              through our website or email us directly.
            </p>
          </section>
        </div>

        <div className="mt-8 flex gap-4">
          <Link href="/terms" className="text-blue-600 hover:underline">
            Terms of Service
          </Link>
          <Link href="/" className="text-gray-600 hover:underline">
            Back to Home
          </Link>
        </div>
      </main>
    </div>
  )
}
