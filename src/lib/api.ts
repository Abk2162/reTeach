import type { Topic, Question, TopicStat, Preview, DiagnosticRow } from './schema'
import { fakePreview } from './fakeData'

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:8000'

const TEACHER_EMAIL = process.env.NEXT_PUBLIC_TEACHER_EMAIL
const TEACHER_NAME = process.env.NEXT_PUBLIC_TEACHER_NAME

/**
 * Parse topics from syllabus text using AI backend
 */
export async function parseTopics(syllabusText: string): Promise<Topic[]> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/topics/parse`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        syllabus_text: syllabusText,
        course_level: 'ug' // undergraduate
      })
    })

    if (!response.ok) {
      throw new Error(`Failed to parse topics: ${response.statusText}`)
    }

    const data = await response.json()
    return data.topics || []

  } catch (error) {
    console.error('Error parsing topics:', error)
    throw error
  }
}

/**
 * Generate MCQ questions for given topics using AI backend
 */
export async function generateQuestions(
  topics: Topic[],
  _count: number = 20, // Unused - now always generates 3 per topic
  assessmentType: 'survey' | 'quiz' = 'quiz',
  textbookId?: string | null
): Promise<Question[]> {
  try {
    // Generate exactly 3 questions per topic
    const topicNames = topics.map(t => t.name)
    const countPerTopic = 3

    // Use survey endpoint for survey type, questions endpoint for quiz
    const endpoint = assessmentType === 'survey'
      ? `${API_BASE_URL}/api/survey/generate`
      : `${API_BASE_URL}/api/questions/generate`

    const requestBody: any = {
      topics: topicNames,
      count_per_topic: countPerTopic,
      difficulty: 'med',
      total_count: topicNames.length * countPerTopic  // Total = 3 * number of topics
    }

    // If textbook ID is provided, include it for textbook-based generation
    if (textbookId) {
      requestBody.textbook_id = textbookId
      requestBody.use_textbook = true
    }

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      throw new Error(`Failed to generate questions: ${response.statusText}`)
    }

    const data = await response.json()

    // Transform backend response to match frontend schema
    const questions = (data.questions || []).map((q: any) => ({
      id: q.id,
      topic: q.topic,
      stem: q.stem,
      options: q.options?.slice(0, 3) ?? ['Yes', 'Maybe', 'No'],
      answerIndex: q.answerIndex,
      rationale: q.rationale,
      difficulty: q.difficulty,
      bloom: q.bloom
    }))

    return questions

  } catch (error) {
    console.error('Error generating questions:', error)
    throw error
  }
}

export async function createForm(
  title: string,
  questions: Question[]
): Promise<{ formUrl: string; slug: string; formId: string }> {
  try {
    const payload: Record<string, any> = {
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
      }))
    }

    if (TEACHER_EMAIL) {
      payload.teacher_email = TEACHER_EMAIL
      if (TEACHER_NAME) {
        payload.teacher_name = TEACHER_NAME
      }
    }

    const response = await fetch(`${API_BASE_URL}/api/forms/publish`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      throw new Error(`Failed to publish form: ${response.statusText}`)
    }

    const data = await response.json()

    // Build full URL for student access
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'
    const formUrl = `${baseUrl}/form/${data.slug}`

    return {
      formUrl,
      slug: data.slug,
      formId: data.form_id
    }
  } catch (error) {
    console.error('Error creating form:', error)
    throw error
  }
}

export async function fetchResults(formId: string): Promise<{
  formTitle: string
  totalResponses: number
  topics: TopicStat[]
}> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/forms/${formId}/stats`)

    if (!response.ok) {
      throw new Error(`Failed to fetch results: ${response.statusText}`)
    }

    const data = await response.json()

    // Transform backend response to match TopicStat schema
    return {
      formTitle: data.form_title ?? 'Class Diagnostic',
      totalResponses: data.total_responses ?? 0,
      topics: (data.topics || []).map((topic: any) => ({
        topic: topic.topic_name,
        n: topic.num_students ?? topic.total_responses ?? 0,
        correctPct: Number(topic.correct_pct ?? topic.correct_percentage ?? 0)
      }))
    }

  } catch (error) {
    console.error('Error fetching results:', error)
    throw error
  }
}

export async function fetchPreview(formId: string): Promise<Preview> {
  // Stub: Return composed preview payload
  // In production: aggregate metrics + distribution via backend
  await new Promise(resolve => setTimeout(resolve, 900))

  return {
    ...fakePreview,
    id: formId,
    title: fakePreview.title,
    updatedAt: fakePreview.updatedAt
  }
}

export async function fetchDiagnosticsOverview(): Promise<DiagnosticRow[]> {
  try {
    const params = new URLSearchParams()
    if (TEACHER_EMAIL) {
      params.set('teacher_email', TEACHER_EMAIL)
    }

    const queryString = params.toString()
    const response = await fetch(
      `${API_BASE_URL}/api/forms${queryString ? `?${queryString}` : ''}`
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch diagnostics: ${response.statusText}`)
    }

    const data = await response.json()

    return (data || []).map((item: any) => {
      const slug = item.slug || item.id
      const completionPct = Number(item.completion_pct ?? 0)
      const weakTopics = Array.isArray(item.weak_topics)
        ? item.weak_topics.filter(Boolean).slice(0, 3)
        : []
      const strongTopics = Array.isArray(item.strong_topics)
        ? item.strong_topics.filter(Boolean).slice(0, 3)
        : []

      const status = item.status ?? 'active'

      return {
        id: slug,
        slug,
        formUuid: item.form_uuid || item.id || slug,
        name: item.title || 'Untitled Diagnostic',
        course: item.course || 'Course',
        createdAt: item.created_at || new Date().toISOString(),
        responses: Number(item.responses ?? 0),
        completionPct: completionPct > 100 ? 100 : completionPct < 0 ? 0 : completionPct,
        weakTopics,
        strongTopics,
        status: status === 'published' ? 'active' : status,
        avgScore:
          item.avg_score !== null && item.avg_score !== undefined
            ? Number(item.avg_score)
            : undefined,
        lastSubmission: item.last_submission || undefined
      } satisfies DiagnosticRow
    })
  } catch (error) {
    console.error('Error fetching diagnostics:', error)
    throw error
  }
}

export async function deleteForm(slug: string): Promise<void> {
  try {
    const params = new URLSearchParams()
    if (TEACHER_EMAIL) {
      params.set('teacher_email', TEACHER_EMAIL)
    }

    const queryString = params.toString()
    const response = await fetch(
      `${API_BASE_URL}/api/forms/${slug}${queryString ? `?${queryString}` : ''}`,
      {
        method: 'DELETE'
      }
    )

    if (!response.ok) {
      throw new Error(`Failed to delete form: ${response.statusText}`)
    }
  } catch (error) {
    console.error(`Error deleting form ${slug}:`, error)
    throw error
  }
}
