import Link from 'next/link'
import Image from 'next/image'

export default function TermsOfService() {
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
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Terms of Service</h1>
        <p className="text-gray-600 mb-8">Last updated: January 2025</p>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 space-y-8">
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Acceptance of Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              By accessing and using reTeach, you accept and agree to be bound by the terms and provision of this agreement.
              If you do not agree to these Terms of Service, please do not use our platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Description of Service</h2>
            <p className="text-gray-700 leading-relaxed">
              reTeach provides an AI-powered diagnostic assessment platform designed for educators to create, distribute,
              and analyze student assessments. Our service includes form creation, student response collection, and
              automated analysis of learning gaps.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. User Accounts</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              You are responsible for maintaining the confidentiality of your account credentials. You agree to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Provide accurate and complete information when creating your account</li>
              <li>Keep your password secure and confidential</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
              <li>Be responsible for all activities that occur under your account</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Acceptable Use</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              You agree not to:
            </p>
            <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
              <li>Use the service for any illegal purpose</li>
              <li>Violate any laws or regulations</li>
              <li>Infringe upon the rights of others</li>
              <li>Upload malicious code or content</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Student Data and Privacy</h2>
            <p className="text-gray-700 leading-relaxed">
              We take student privacy seriously. All student data is handled in accordance with our Privacy Policy
              and applicable education privacy laws. Teachers are responsible for obtaining necessary consents
              before collecting student information through our platform.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Intellectual Property</h2>
            <p className="text-gray-700 leading-relaxed">
              You retain ownership of the content you create on reTeach. By using our service, you grant us a
              license to host, store, and display your content for the purpose of providing the service.
              The reTeach platform, including its design, features, and underlying technology, remains our property.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed">
              reTeach is provided "as is" without warranties of any kind. We are not liable for any damages
              arising from your use of the service, including but not limited to direct, indirect, incidental,
              or consequential damages.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Termination</h2>
            <p className="text-gray-700 leading-relaxed">
              We reserve the right to suspend or terminate your account at any time for violations of these
              Terms of Service. You may terminate your account at any time by contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Changes to Terms</h2>
            <p className="text-gray-700 leading-relaxed">
              We may modify these Terms of Service at any time. We will notify users of significant changes.
              Your continued use of the service after changes are posted constitutes acceptance of the modified terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Contact</h2>
            <p className="text-gray-700 leading-relaxed">
              If you have questions about these Terms of Service, please contact us through our website.
            </p>
          </section>
        </div>

        <div className="mt-8 flex gap-4">
          <Link href="/privacy" className="text-blue-600 hover:underline">
            Privacy Policy
          </Link>
          <Link href="/" className="text-gray-600 hover:underline">
            Back to Home
          </Link>
        </div>
      </main>
    </div>
  )
}
