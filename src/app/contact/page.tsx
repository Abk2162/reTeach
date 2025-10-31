import Link from 'next/link'
import Image from 'next/image'
import { Mail, MessageSquare } from 'lucide-react'

export default function ContactUs() {
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
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Contact Us</h1>
        <p className="text-gray-600 mb-8">Get in touch with the reTeach team</p>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Ch Abhinav Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                <Mail className="w-6 h-6 text-blue-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">Ch Abhinav</h2>
            </div>
            <a
              href="mailto:alicenderqandy@gmail.com"
              className="text-blue-600 hover:underline text-lg"
            >
              alicenderqandy@gmail.com
            </a>
          </div>

          {/* Abhijay Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center">
                <Mail className="w-6 h-6 text-indigo-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">Abhijay</h2>
            </div>
            <a
              href="mailto:abhijay@example.com"
              className="text-blue-600 hover:underline text-lg"
            >
              abhijay@example.com
            </a>
          </div>

          {/* Rayhan Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                <Mail className="w-6 h-6 text-purple-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">Rayhan</h2>
            </div>
            <a
              href="mailto:rayhan@example.com"
              className="text-blue-600 hover:underline text-lg"
            >
              rayhan@example.com
            </a>
          </div>

          {/* Chetan T Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                <Mail className="w-6 h-6 text-green-600" />
              </div>
              <h2 className="text-2xl font-semibold text-gray-900">Chetan T</h2>
            </div>
            <a
              href="mailto:chetan@example.com"
              className="text-blue-600 hover:underline text-lg"
            >
              chetan@example.com
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}
