'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { ChevronRight, Clock, CheckCircle, FileText } from 'lucide-react'

interface WelcomeStepProps {
  onNext: () => void
}

export default function WelcomeStep({ onNext }: WelcomeStepProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-2xl w-full"
      >
        {/* Logo */}
        <motion.div variants={itemVariants} className="flex justify-center mb-8">
          <Image
            src="/logo.png"
            alt="reTeach"
            width={80}
            height={80}
            className="rounded-2xl"
          />
        </motion.div>

        {/* Main card */}
        <motion.div
          variants={itemVariants}
          className="bg-white rounded-3xl shadow-xl border border-gray-200 p-10 md:p-12"
        >
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Welcome to <span className="text-green-600">reTeach</span>
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed">
              Let's get you set up in just a few minutes. We'll help you create your first diagnostic assessment.
            </p>
          </div>

          {/* Feature list */}
          <div className="space-y-4 mb-10">
            {[
              {
                icon: FileText,
                title: 'Upload Your Syllabus',
                description: 'Paste or upload your course content'
              },
              {
                icon: CheckCircle,
                title: 'Review Topics',
                description: 'AI extracts and organizes learning objectives'
              },
              {
                icon: Clock,
                title: 'Generate Questions',
                description: 'Create diagnostic assessments instantly'
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className="flex items-start gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* CTA Button */}
          <motion.button
            variants={itemVariants}
            onClick={onNext}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            Let's Get Started
            <ChevronRight className="w-5 h-5" />
          </motion.button>

          <p className="text-center text-xs text-gray-500 mt-6">
            Takes about 3 minutes • You can skip and return later
          </p>
        </motion.div>
      </motion.div>
    </div>
  )
}
