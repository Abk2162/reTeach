'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { Home, ArrowLeft, Search, MessageCircle } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="max-w-2xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-9xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 mb-4">
            404
          </h1>
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Page Not Found
          </h2>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Oops! The page you're looking for doesn't exist.
            Let's get you back to creating diagnostic assessments.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
        >
          <Link
            href="/"
            className="inline-flex items-center px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-full transition-all duration-200 hover:scale-105 hover:shadow-lg"
          >
            <Home className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
          
          <Link
            href="/upload"
            className="inline-flex items-center px-8 py-4 border-2 border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 font-semibold rounded-full transition-all duration-200 hover:scale-105 hover:shadow-lg"
          >
            <Search className="w-5 h-5 mr-2" />
            Upload Syllabus
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12"
        >
          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <Home className="w-6 h-6 text-indigo-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Get Started</h3>
            <p className="text-gray-600 text-sm mb-4">
              Create diagnostic assessments from your syllabus
            </p>
            <Link href="/upload" className="text-indigo-600 hover:text-indigo-700 font-medium text-sm">
              Upload Syllabus →
            </Link>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <Search className="w-6 h-6 text-violet-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Review Topics</h3>
            <p className="text-gray-600 text-sm mb-4">
              Adjust topic weights and generate questions
            </p>
            <Link href="/review" className="text-violet-600 hover:text-violet-700 font-medium text-sm">
              Review Topics →
            </Link>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-12 h-12 bg-fuchsia-100 rounded-xl flex items-center justify-center mb-4 mx-auto">
              <MessageCircle className="w-6 h-6 text-fuchsia-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">View Results</h3>
            <p className="text-gray-600 text-sm mb-4">
              Analyze student performance by topic
            </p>
            <Link href="/results" className="text-fuchsia-600 hover:text-fuchsia-700 font-medium text-sm">
              View Results →
            </Link>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mt-12 text-center"
        >
          <p className="text-gray-500 text-sm">
            Error Code: 404 • Page Not Found
          </p>
        </motion.div>
      </div>
    </div>
  )
}