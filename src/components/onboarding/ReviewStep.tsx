'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useStore } from '@/lib/store'
import { ArrowLeft, ArrowRight, Loader2, Sparkles, Edit2, Trash2, Plus, Check, X } from 'lucide-react'
import { generateQuestions } from '@/lib/api'

interface ReviewStepProps {
  onNext: () => void
  onBack: () => void
}

export default function ReviewStep({ onNext, onBack }: ReviewStepProps) {
  const router = useRouter()
  const { data: session } = useSession()
  const { topics, setQuestions, updateTopic, removeTopic, addTopic, courseName } = useStore()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [isAddingNew, setIsAddingNew] = useState(false)
  const [newTopicName, setNewTopicName] = useState('')

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)

    try {
      // Save course name to backend if provided
      if (courseName && session?.user?.email) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/teachers/${session.user.email}/course-name`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ course_name: courseName }),
        })
      }

      const response = await generateQuestions(topics, 3) // 3 questions per topic
      setQuestions(response)
      // Redirect to preview page to review/edit questions before publishing
      router.push('/preview')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate questions')
    } finally {
      setLoading(false)
    }
  }

  const startEdit = (topicId: string, name: string) => {
    setEditingId(topicId)
    setEditName(name)
  }

  const saveEdit = () => {
    if (editingId && editName.trim()) {
      updateTopic(editingId, { name: editName.trim() })
      setEditingId(null)
    }
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditName('')
  }

  const handleRemove = (topicId: string) => {
    removeTopic(topicId)
  }

  const startAddNew = () => {
    setIsAddingNew(true)
    setNewTopicName('')
  }

  const saveNewTopic = () => {
    if (newTopicName.trim()) {
      addTopic({
        id: `topic-${Date.now()}`,
        name: newTopicName.trim(),
        weight: 1,
        prereqs: []
      })
      setIsAddingNew(false)
      setNewTopicName('')
    }
  }

  const cancelAddNew = () => {
    setIsAddingNew(false)
    setNewTopicName('')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-3xl w-full"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4"
          >
            <Sparkles className="w-8 h-8 text-green-600" />
          </motion.div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
            Topics Extracted!
          </h2>
          <p className="text-lg text-gray-600">
            We found {topics.length} topics. Edit them or add more before generating questions.
          </p>
        </div>

        {/* Main card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 space-y-6">
          {/* Topics list */}
          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            <AnimatePresence mode="popLayout">
              {topics.map((topic, index) => (
                <motion.div
                  key={topic.id}
                  layout
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05, duration: 0.3 }}
                  className="flex items-center gap-3 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  {editingId === topic.id ? (
                    <>
                      {/* Edit mode */}
                      <div className="flex-1">
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Topic name"
                          autoFocus
                        />
                      </div>
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={saveEdit}
                          className="p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors"
                          title="Save"
                        >
                          <Check className="w-5 h-5" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={cancelEdit}
                          className="p-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                          title="Cancel"
                        >
                          <X className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Display mode */}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{topic.name}</h3>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-medium text-gray-500 bg-white px-3 py-1 rounded-full">
                          {3} questions
                        </span>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => startEdit(topic.id, topic.name)}
                          disabled={loading}
                          className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Edit topic"
                        >
                          <Edit2 className="w-4 h-4" />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleRemove(topic.id)}
                          disabled={loading || topics.length === 1}
                          className="p-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          title="Remove topic"
                        >
                          <Trash2 className="w-4 h-4" />
                        </motion.button>
                      </div>
                    </>
                  )}
                </motion.div>
              ))}

              {/* Add new topic row */}
              {isAddingNew && (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center gap-3 p-4 rounded-xl bg-green-50 border-2 border-green-200"
                >
                  <div className="flex-1">
                    <input
                      type="text"
                      value={newTopicName}
                      onChange={(e) => setNewTopicName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      placeholder="New topic name"
                      autoFocus
                    />
                  </div>
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={saveNewTopic}
                      className="p-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-lg transition-colors"
                      title="Add topic"
                    >
                      <Check className="w-5 h-5" />
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={cancelAddNew}
                      className="p-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
                      title="Cancel"
                    >
                      <X className="w-5 h-5" />
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Add new topic button */}
          {!isAddingNew && (
            <motion.button
              onClick={startAddNew}
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-3 border-2 border-dashed border-gray-300 hover:border-gray-400 rounded-xl text-gray-600 hover:text-gray-700 font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-5 h-5" />
              Add Topic
            </motion.button>
          )}


          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-4 bg-red-50 border border-red-200 rounded-lg"
            >
              <p className="text-sm text-red-600">{error}</p>
            </motion.div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <motion.button
              onClick={onBack}
              disabled={loading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 text-gray-700 disabled:text-gray-400 font-medium rounded-lg transition-colors flex items-center gap-2 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </motion.button>

            <motion.button
              onClick={handleGenerate}
              disabled={loading}
              whileHover={!loading ? { scale: 1.02 } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              className="flex-1 px-6 py-3 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300
                text-white font-semibold rounded-lg
                transition-all duration-200 shadow-lg hover:shadow-xl
                disabled:cursor-not-allowed disabled:shadow-none
                flex items-center justify-center gap-3"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating Questions...
                </>
              ) : (
                <>
                  Generate Questions
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
