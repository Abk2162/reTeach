'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useStore } from '@/lib/store'
import Confetti from 'react-confetti'
import { CheckCircle, ArrowRight, Sparkles, Copy, Check, Share2 } from 'lucide-react'

export default function SuccessStep() {
  const router = useRouter()
  const { data: session } = useSession()
  const { questions, completeOnboarding, formUrl, setPublishInfo } = useStore()
  const [showConfetti, setShowConfetti] = useState(true)
  const [windowDimensions, setWindowDimensions] = useState({ width: 0, height: 0 })
  const [publishing, setPublishing] = useState(false)
  const [publishError, setPublishError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Set window dimensions for confetti
    setWindowDimensions({
      width: window.innerWidth,
      height: window.innerHeight
    })

    // Stop confetti after 5 seconds
    const timer = setTimeout(() => setShowConfetti(false), 5000)

    return () => clearTimeout(timer)
  }, [])

  // Publish form when component mounts if not already published
  useEffect(() => {
    const publishForm = async () => {
      if (formUrl || questions.length === 0 || publishing || !session?.user?.email) return

      setPublishing(true)
      setPublishError(null)

      try {
        const title = `Diagnostic Assessment - ${new Date().toLocaleDateString()}`

        // Call API with teacher email from session
        const payload = {
          title,
          questions: questions.map(q => ({
            id: q.id,
            topic: q.topic,
            stem: q.stem,
            options: q.options,
            answerIndex: q.answerIndex,
            rationale: q.rationale,
            difficulty: q.difficulty,
            bloom: q.bloom
          })),
          teacher_email: session.user.email,
          teacher_name: session.user.name
        }

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/forms/publish`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })

        if (!response.ok) {
          throw new Error(`Failed to publish form: ${response.statusText}`)
        }

        const data = await response.json()
        const shareUrl = `${window.location.origin}/form/${data.slug}`

        setPublishInfo({
          formUrl: shareUrl,
          formSlug: data.slug,
          formId: data.form_id
        })
      } catch (error) {
        console.error('Failed to publish form:', error)
        setPublishError('Failed to create share link. You can still view your dashboard.')
      } finally {
        setPublishing(false)
      }
    }

    publishForm()
  }, [questions, formUrl, publishing, session, setPublishInfo])

  const handleCopyLink = async () => {
    if (!formUrl) return

    try {
      await navigator.clipboard.writeText(formUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error('Failed to copy link:', error)
    }
  }

  const handleComplete = async () => {
    // Mark onboarding as complete
    completeOnboarding()

    // Call API to mark onboarding complete in database
    if (session?.user?.email) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/teachers/${session.user.email}/complete-onboarding`, {
          method: 'POST'
        })
      } catch (error) {
        console.error('Failed to mark onboarding complete:', error)
      }
    }

    // Redirect to dashboard
    router.push('/dashboard')
  }

  return (
    <>
      {showConfetti && (
        <Confetti
          width={windowDimensions.width}
          height={windowDimensions.height}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
        />
      )}

      <div className="min-h-screen flex items-center justify-center px-4 py-12">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="max-w-2xl w-full"
        >
          {/* Success icon */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
            className="flex justify-center mb-8"
          >
            <div className="relative">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-12 h-12 text-green-600" />
              </div>
              {/* Sparkles animation */}
              {[...Array(3)].map((_, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0, rotate: 0 }}
                  animate={{
                    scale: [0, 1, 0],
                    rotate: [0, 180, 360],
                    x: [0, (i - 1) * 40, (i - 1) * 60],
                    y: [0, -40, -60]
                  }}
                  transition={{
                    duration: 1.5,
                    delay: 0.5 + i * 0.2,
                    repeat: 2
                  }}
                  className="absolute top-0 left-12"
                >
                  <Sparkles className="w-6 h-6 text-yellow-400" />
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Main card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="bg-white rounded-3xl shadow-xl border border-gray-200 p-10 md:p-12"
          >
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                You're All Set!
              </h1>
              <p className="text-lg text-gray-600 leading-relaxed">
                Your first diagnostic assessment is ready. Let's see what you've created!
              </p>
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="p-4 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 text-center"
              >
                <div className="text-3xl font-bold text-blue-600 mb-1">{questions.length}</div>
                <div className="text-xs text-blue-700 font-medium">Questions</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="p-4 rounded-xl bg-gradient-to-br from-green-50 to-green-100 text-center"
              >
                <div className="text-3xl font-bold text-green-600 mb-1">
                  {Math.floor(questions.length / 3)}
                </div>
                <div className="text-xs text-green-700 font-medium">Topics</div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="p-4 rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 text-center"
              >
                <div className="text-3xl font-bold text-purple-600 mb-1">~3</div>
                <div className="text-xs text-purple-700 font-medium">Minutes</div>
              </motion.div>
            </div>

            {/* Share Link Section */}
            {publishing && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-6 p-6 rounded-xl bg-blue-50 border border-blue-200"
              >
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                  <span className="text-sm font-medium text-blue-900">Creating your share link...</span>
                </div>
              </motion.div>
            )}

            {publishError && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200"
              >
                <p className="text-sm text-red-600">{publishError}</p>
              </motion.div>
            )}

            {formUrl && !publishing && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mb-6 p-6 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200"
              >
                <div className="flex items-center gap-2 mb-3">
                  <Share2 className="w-5 h-5 text-blue-600" />
                  <h3 className="font-semibold text-blue-900">Share with Your Students</h3>
                </div>
                <p className="text-sm text-blue-700 mb-3">
                  Your assessment is ready! Share this link with your students:
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    readOnly
                    value={formUrl}
                    className="flex-1 px-4 py-2 bg-white border border-blue-300 rounded-lg text-sm text-gray-700 font-mono"
                  />
                  <motion.button
                    onClick={handleCopyLink}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    {copied ? (
                      <>
                        <Check className="w-4 h-4" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        Copy
                      </>
                    )}
                  </motion.button>
                </div>
              </motion.div>
            )}

            {/* What's next */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="mb-8 p-6 rounded-xl bg-gray-50"
            >
              <h3 className="font-semibold text-gray-900 mb-3">What's next?</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Review and customize your questions in the dashboard</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Share the link with your students</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                  <span>Track student understanding in real-time</span>
                </li>
              </ul>
            </motion.div>

            {/* CTA Button */}
            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              onClick={handleComplete}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              View Your Dashboard
              <ArrowRight className="w-5 h-5" />
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </>
  )
}
