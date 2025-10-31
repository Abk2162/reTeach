'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight, Zap, Shield, TrendingDown, CheckCircle, Menu, X, User, Search, FileText, Clock, Lock } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import ReTeachBackground from '@/components/ReTeachBackground'

export default function LandingPage() {
  const router = useRouter()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  const features = [
    {
      title: "Smart Topic Extraction",
      subtitle: "AI-Powered Analysis",
      content: "Our AI analyzes your syllabus and automatically extracts key learning objectives, saving hours of manual work.",
      metric: "100+ topics identified"
    },
    {
      title: "Question Generation",
      subtitle: "Assessment Made Easy",
      content: "Get AI-generated diagnostic MCQs tailored to each topic's learning objectives and difficulty level.",
      metric: "Personalized assessments"
    },
    {
      title: "Performance Analytics",
      subtitle: "Data-Driven Insights",
      content: "Track student understanding by topic with detailed analytics and identify areas needing reinforcement.",
      metric: "Real-time feedback"
    }
  ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % features.length)
    }, 5000)
    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleGetStarted = () => {
    const envMode = process.env.NEXT_PUBLIC_ENV_MODE
    if (envMode === 'production') {
      router.push('/login')
    } else {
      // Development mode - go to localhost login
      window.location.href = 'http://localhost:3000/login'
    }
  }

  return (
    <div className="min-h-screen relative">
      {/* Animated Background */}
      <ReTeachBackground />
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 liquid-glass border-b border-white/20 py-2">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <Link href="/">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center cursor-pointer"
                  >
                    <img
                      src="/logo.png"
                      alt="reTeach logo"
                      className="w-12 h-12 object-contain"
                    />
                    <span className="text-3xl font-semibold tracking-tight text-black">reTeach</span>
                  </motion.div>
                </Link>
              </div>

              <div className="hidden md:flex items-center space-x-8">
                <motion.button
                  onClick={handleGetStarted}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-1 px-5 py-2.5 rounded-full bg-gray-900 hover:bg-gray-800 text-white transition-all duration-200 shadow-md hover:shadow-lg text-base font-medium"
                >
                  <span>Get Started</span>
                </motion.button>
              </div>

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Mobile menu */}
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="md:hidden bg-white border-t border-gray-100"
              >
                <div className="px-4 py-2 space-y-1">
                  <button onClick={handleGetStarted} className="block py-2 text-gray-600 w-full text-left">Get Started</button>
                </div>
              </motion.div>
            )}
        </div>
      </nav>

      {/* Hero Section (fluid) */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold mb-8 leading-tight text-gray-900">
              <span className="block">No <span className="text-green-600">Student</span></span>
              <span className="block">Left Behind</span>
            </h1>
            <p className="text-xl sm:text-2xl text-slate-600 mb-12 max-w-4xl mx-auto leading-relaxed">
              Extract topics. Generate questions. Analyze student understanding.
            </p>
          </motion.div>

          {/* Dashboard Preview Image */}
          {false && (<motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            className="mt-24 flex justify-center relative"
          >
            {/* Very subtle glow behind preview to keep it integrated */}
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-200/10 via-violet-200/10 to-fuchsia-200/10 blur-3xl" />
            <div className="relative max-w-6xl w-full">
              <div className="bg-white/70 backdrop-blur-md rounded-3xl shadow-lg border border-white/20 overflow-hidden">
                <div className="bg-white/30 px-6 py-4 border-b border-white/20">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-bold text-black">reTeach Dashboard</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span>Live Demo</span>
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
                <div className="p-8">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                    {/* Left side - Usage metrics */}
                    <div className="space-y-8">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-xl p-6 transition-all duration-200 bg-white/40 backdrop-blur-sm border border-white/20">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm bg-gradient-to-br from-emerald-100 to-green-100">
                              <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-600">Applications</p>
                              <p className="text-3xl font-bold text-slate-900">23</p>
                              <div className="flex items-center text-sm text-emerald-600 font-medium">
                                <span className="mr-1">↗</span>
                                <span>+4 this week</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="rounded-xl p-6 transition-all duration-200 bg-white/40 backdrop-blur-sm border border-white/20">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm bg-gradient-to-br from-sage-100 to-emerald-100">
                              <svg className="w-6 h-6 text-sage-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-600">Awards Found</p>
                              <p className="text-3xl font-bold text-gradient-primary">$47K</p>
                              <div className="flex items-center text-sm text-emerald-600 font-medium">
                                <span className="mr-1">↗</span>
                                <span>12 matches</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-white/40 backdrop-blur-sm rounded-xl p-6 transition-all duration-300 border border-white/20">
                        <h4 className="font-bold text-slate-900 mb-4">Application Progress</h4>
                        <div className="h-36 bg-white rounded-lg border border-emerald-200/40 shadow-inner">
                          {/* Enhanced SVG Chart */}
                          <svg className="w-full h-full p-2" viewBox="0 0 200 80" preserveAspectRatio="none">
                            <defs>
                              <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                                <stop offset="0%" stopColor="#10B981" stopOpacity="0.18"/>
                                <stop offset="50%" stopColor="#059669" stopOpacity="0.12"/>
                                <stop offset="100%" stopColor="#10B981" stopOpacity="0"/>
                              </linearGradient>
                              <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#10B981"/>
                                <stop offset="50%" stopColor="#059669"/>
                                <stop offset="100%" stopColor="#10B981"/>
                              </linearGradient>
                              <filter id="glow">
                                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                                <feMerge>
                                  <feMergeNode in="coloredBlur"/>
                                  <feMergeNode in="SourceGraphic"/>
                                </feMerge>
                              </filter>
                            </defs>
                            {/* Grid lines */}
                            <line x1="0" y1="20" x2="200" y2="20" stroke="#E5E7EB" strokeWidth="1"/>
                            <line x1="0" y1="40" x2="200" y2="40" stroke="#E5E7EB" strokeWidth="1"/>
                            <line x1="0" y1="60" x2="200" y2="60" stroke="#E5E7EB" strokeWidth="1"/>
                            {/* Chart line with glow */}
                            <path d="M0 70 L25 65 L50 45 L75 35 L100 25 L125 30 L150 20 L175 15 L200 10" 
                                  stroke="url(#lineGradient)" strokeWidth="3" fill="none" filter="url(#glow)"/>
                            {/* Chart area fill */}
                            <path d="M0 70 L25 65 L50 45 L75 35 L100 25 L125 30 L150 20 L175 15 L200 10 L200 80 L0 80 Z" 
                                  fill="url(#chartGradient)"/>
                            {/* Enhanced data points */}
                            <circle cx="25" cy="65" r="3" fill="#10B981" stroke="white" strokeWidth="2"/>
                            <circle cx="50" cy="45" r="3" fill="#059669" stroke="white" strokeWidth="2"/>
                            <circle cx="75" cy="35" r="3" fill="#10B981" stroke="white" strokeWidth="2"/>
                            <circle cx="100" cy="25" r="3" fill="#059669" stroke="white" strokeWidth="2"/>
                            <circle cx="125" cy="30" r="3" fill="#10B981" stroke="white" strokeWidth="2"/>
                            <circle cx="150" cy="20" r="3" fill="#059669" stroke="white" strokeWidth="2"/>
                            <circle cx="175" cy="15" r="3" fill="#10B981" stroke="white" strokeWidth="2"/>
                            <circle cx="200" cy="10" r="3" fill="#059669" stroke="white" strokeWidth="2"/>
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    {/* Right side - Recent activity */}
                    <div className="space-y-8">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-xl p-6 transition-all duration-200 bg-white/40 backdrop-blur-sm border border-white/20">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm bg-gradient-to-br from-teal-100 to-cyan-100">
                              <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-600">Deadlines</p>
                              <p className="text-3xl font-bold text-slate-900">8</p>
                              <div className="flex items-center text-sm text-amber-600 font-medium">
                                <span className="mr-1">⚠</span>
                                <span>Next: 5 days</span>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="rounded-xl p-6 transition-all duration-200 bg-white/40 backdrop-blur-sm border border-white/20">
                          <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm bg-gradient-to-br from-blue-100 to-indigo-100">
                              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-600">Essays Written</p>
                              <p className="text-3xl font-bold text-slate-900">12</p>
                              <div className="flex items-center text-sm text-blue-600 font-medium">
                                <span className="mr-1">✓</span>
                                <span>3 reviewed</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="bg-gradient-to-br from-emerald-50/60 via-green-50/50 to-teal-50/40 rounded-xl p-6 hover:shadow-lg transition-all duration-300 border border-emerald-200/40">
                        <h4 className="font-bold text-slate-900 mb-4">Recent Activity</h4>
                        <div className="space-y-4">
                          <div className="flex items-center space-x-3 text-sm p-2 rounded-lg hover:bg-green-50/50 transition-colors">
                            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-gray-700 font-medium">Essay submitted</span>
                            <span className="text-gray-500 ml-auto">2 min ago</span>
                          </div>
                          <div className="flex items-center space-x-3 text-sm p-2 rounded-lg hover:bg-blue-50/50 transition-colors">
                            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                            <span className="text-gray-700 font-medium">New scholarship match</span>
                            <span className="text-gray-500 ml-auto">15 min ago</span>
                          </div>
                          <div className="flex items-center space-x-3 text-sm p-2 rounded-lg hover:bg-emerald-50/50 transition-colors">
                            <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
                            <span className="text-gray-700 font-medium">Application completed</span>
                            <span className="text-gray-500 ml-auto">1 hour ago</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>)}
          
          {/* Get Started Button */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="mt-16 text-center"
          >
            <motion.button
              onClick={handleGetStarted}
              whileHover={{ scale: 1.05, boxShadow: "0 20px 40px -12px rgba(99, 102, 241, 0.3)" }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center px-10 py-5 bg-gray-900 hover:bg-gray-800 text-white font-bold text-lg rounded-full shadow-lg hover:shadow-xl transition-all duration-200 relative overflow-hidden"
            >
              <span className="relative z-10 flex items-center">
                Get Started
                <ChevronRight className="ml-3 w-6 h-6" />
              </span>
              <div className="absolute inset-0 bg-gray-800 opacity-0 hover:opacity-10 transition-opacity duration-200"></div>
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="mt-20 flex flex-wrap justify-center gap-8 text-gray-600"
          >
            <motion.div 
              className="flex items-center space-x-3 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full shadow-sm hover:shadow-md transition-all duration-300"
              whileHover={{ scale: 1.05, y: -2 }}
            >
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <span className="font-medium">Save Time Automatically</span>
            </motion.div>
            <motion.div
              className="flex items-center space-x-3 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full shadow-sm hover:shadow-md transition-all duration-300"
              whileHover={{ scale: 1.05, y: -2 }}
            >
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <span className="font-medium">Assess Understanding</span>
            </motion.div>
            <motion.div
              className="flex items-center space-x-3 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full shadow-sm hover:shadow-md transition-all duration-300"
              whileHover={{ scale: 1.05, y: -2 }}
            >
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <FileText className="w-5 h-5 text-blue-600" />
              </div>
              <span className="font-medium">Track Progress</span>
          </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Problem Section */}
      <section id="problem" className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16 relative z-10"
          >
            <h2 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              The Assessment{' '}
              <span className="text-gray-800">Challenge</span>
            </h2>
            <p className="text-xl sm:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Every educator faces the same time-consuming challenges
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 relative z-10">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              viewport={{ once: true }}
              className="bg-white/50 backdrop-blur-sm rounded-3xl p-8 shadow-md border border-white/20 hover:shadow-lg transition-all duration-300 group hover:-translate-y-1"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-6 shadow-md group-hover:scale-105 transition-transform duration-200">
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 group-hover:text-red-600 transition-colors duration-300">Manual Question Writing</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Hours spent manually crafting diagnostic questions aligned to learning objectives, only to run out of time.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              viewport={{ once: true }}
              className="bg-white/50 backdrop-blur-sm rounded-3xl p-8 shadow-md border border-white/20 hover:shadow-lg transition-all duration-300 group hover:-translate-y-1"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-6 shadow-md group-hover:scale-105 transition-transform duration-200">
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 group-hover:text-orange-600 transition-colors duration-300">Grading Burden</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Drowning in stacks of student responses, struggling to identify patterns and provide timely feedback.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              viewport={{ once: true }}
              className="bg-white/50 backdrop-blur-sm rounded-3xl p-8 shadow-md border border-white/20 hover:shadow-lg transition-all duration-300 group hover:-translate-y-1"
            >
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-6 shadow-md group-hover:scale-105 transition-transform duration-200">
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900 group-hover:text-yellow-600 transition-colors duration-300">Limited Insights</h3>
              <p className="text-gray-600 text-lg leading-relaxed">
                Struggling to identify which topics students struggle with most and how to adjust instruction accordingly.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How reTeach Works (Split) */}
      <section id="solution" className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16 relative z-10"
          >
            <h2 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-4 leading-tight">
              How reTeach Works for You
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              We combine AI with simple workflows to save you time and improve student outcomes.
            </p>
          </motion.div>

          <div className="flex justify-center">
            {/* Left: Feature Grid (2x2) */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="w-full"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
                {/* Syllabus Upload */}
                <div className="rounded-2xl p-6 bg-white/60 backdrop-blur-sm border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-md bg-indigo-50 flex items-center justify-center">
                      <Search className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Upload Syllabus</h3>
                  </div>
                  <p className="text-sm text-gray-600">Paste text or upload PDF/TXT files with your course content.</p>
                </div>

                {/* Topic Extraction */}
                <div className="rounded-2xl p-6 bg-white/60 backdrop-blur-sm border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-md bg-indigo-50 flex items-center justify-center">
                      <FileText className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Review Topics</h3>
                  </div>
                  <p className="text-sm text-gray-600">AI extracts learning objectives and you adjust their weights.</p>
                </div>

                {/* Question Generation */}
                <div className="rounded-2xl p-6 bg-white/60 backdrop-blur-sm border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-md bg-indigo-50 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Generate & Publish</h3>
                  </div>
                  <p className="text-sm text-gray-600">Create diagnostic MCQs and publish to Google Forms instantly.</p>
                </div>

                {/* Analytics */}
                <div className="rounded-2xl p-6 bg-white/60 backdrop-blur-sm border border-gray-200">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 rounded-md bg-indigo-50 flex items-center justify-center">
                      <Lock className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Analyze Results</h3>
                  </div>
                  <p className="text-sm text-gray-600">View student performance by topic with detailed analytics.</p>
                </div>
              </div>
            </motion.div>

            {/* Right column removed */}
          </div>

        </div>
      </section>

      {/* Features Showcase Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16 relative z-10"
          >
            <h2 className="text-5xl sm:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Why Choose{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600">
                reTeach
              </span>
            </h2>
            <p className="text-xl sm:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Built for educators who want to understand student learning
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto">
            <motion.div
              key={currentTestimonial}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/60 backdrop-blur-md rounded-3xl p-10 shadow-lg text-center border border-white/20 relative z-10"
            >
              <div className="absolute inset-0 bg-white/20 rounded-3xl"></div>
              
              {/* Feature header */}
              <div className="flex justify-center mb-8 relative z-10">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-100 to-violet-100 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-lg"></div>
                </div>
              </div>
              
              <div className="relative z-10">
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">{features[currentTestimonial].title}</h3>
                <p className="text-lg sm:text-xl text-indigo-600 font-semibold mb-6">{features[currentTestimonial].subtitle}</p>
                <p className="text-base sm:text-lg text-gray-600 mb-8 leading-relaxed max-w-xl mx-auto">
                  {features[currentTestimonial].content}
                </p>
                <div className="inline-flex items-center px-5 py-2.5 bg-white text-gray-900 rounded-full text-lg font-bold border-2 border-gray-200 shadow-sm">
                  {features[currentTestimonial].metric}
                </div>
              </div>
            </motion.div>

            <div className="flex justify-center mt-8 space-x-3 relative z-10">
              {features.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentTestimonial(index)}
                  className={`h-3 rounded-full transition-all duration-300 hover:scale-110 ${
                    index === currentTestimonial 
                      ? 'bg-gray-800 w-10' 
                      : 'bg-gray-300 hover:bg-gray-400 w-3'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Get Started Section (fluid) */}
      <section id="demo" className="py-24 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gray-900/90 rounded-3xl p-16 text-center text-white relative overflow-hidden shadow-xl"
          >
            {/* Inner glow effect */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-white/5 rounded-3xl"></div>

            <div className="relative z-10">
              <h2 className="text-5xl sm:text-6xl font-bold mb-6 leading-tight">
                Ready to Get Started?
              </h2>
              <p className="text-xl sm:text-2xl mb-12 opacity-95 max-w-2xl mx-auto leading-relaxed">
                Create your first diagnostic assessment in minutes
              </p>

              <motion.button
                onClick={handleGetStarted}
                whileHover={{ scale: 1.05, boxShadow: "0 10px 30px -10px rgba(255, 255, 255, 0.3)" }}
                whileTap={{ scale: 0.95 }}
                className="px-12 py-6 bg-white text-indigo-600 font-bold text-xl rounded-full hover:bg-gray-50 transition-all duration-300 shadow-xl hover:shadow-2xl inline-flex items-center"
              >
                Get Started
                <ChevronRight className="ml-3 w-6 h-6" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-200">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center space-y-6">
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <Link href="/contact" className="hover:text-gray-700 transition-colors">Contact Us</Link>
              <Link href="/privacy" className="hover:text-gray-700 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-gray-700 transition-colors">Terms of Service</Link>
            </div>
            <p className="text-center text-gray-600">&copy; 2025 reTeach. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
