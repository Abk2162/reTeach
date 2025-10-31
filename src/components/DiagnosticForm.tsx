'use client'

import SectionHeader from './SectionHeader'

const inputClassName =
  'mt-2 w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400'

interface PromptConfig {
  title: string
  focus: string
  textbook: string
  chapters: string
  gradeLevel: string
  questionCount: number
  notes: string
  assessmentType: 'survey' | 'quiz'
  useTextbookPdf: boolean
  textbookFile: File | null
}

interface DiagnosticFormProps {
  config: PromptConfig
  onConfigChange: <Key extends keyof PromptConfig>(key: Key, value: PromptConfig[Key]) => void
  promptCharacters: number
  error?: string | null
}

export default function DiagnosticForm({ config, onConfigChange, promptCharacters, error }: DiagnosticFormProps) {
  return (
    <form className="space-y-8">
      <section>
        <SectionHeader title="Assessment Type" />
        <div className="mt-3 space-y-3">
          <div className="grid gap-3 md:grid-cols-2">
            <button
              type="button"
              onClick={() => onConfigChange('assessmentType', 'survey')}
              className={`relative rounded-xl border-2 p-4 text-left transition-all ${
                config.assessmentType === 'survey'
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-indigo-400'
              }`}
            >
              <div className="font-semibold text-gray-900 dark:text-white">Diagnostic Survey</div>
              <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                Informal yes/no questions to identify knowledge gaps
              </div>
            </button>
            <button
              type="button"
              onClick={() => onConfigChange('assessmentType', 'quiz')}
              className={`relative rounded-xl border-2 p-4 text-left transition-all ${
                config.assessmentType === 'quiz'
                  ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/20'
                  : 'border-gray-200 dark:border-gray-700 hover:border-indigo-400'
              }`}
            >
              <div className="font-semibold text-gray-900 dark:text-white">Formal Quiz</div>
              <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                Multiple-choice questions with detailed explanations
              </div>
            </button>
          </div>
        </div>
      </section>

      <section>
        <SectionHeader title="Overview" />
        <div className="mt-3 space-y-4">
          <div>
            <label htmlFor="title" className="text-sm font-medium text-foreground/80">
              Title
            </label>
            <input
              id="title"
              value={config.title}
              onChange={(e) => onConfigChange('title', e.target.value)}
              placeholder="Algebra II · Unit 4 check-in"
              className={inputClassName}
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="focus" className="text-sm font-medium text-foreground/80">
              Prompt
            </label>
            <textarea
              id="focus"
              value={config.focus}
              onChange={(e) => onConfigChange('focus', e.target.value)}
              placeholder="Describe focus: topic, grade, tone."
              className={`${inputClassName} h-32 resize-none`}
            />
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-3 py-1 font-medium text-gray-700 dark:text-gray-200 shadow-sm">
                {promptCharacters} characters
              </span>
              <span className="hidden sm:inline">
                Include outcomes, misconceptions, tone, constraints.
              </span>
            </div>
          </div>
        </div>
      </section>

      <section>
        <SectionHeader title="Context" />
        <div className="mt-3 space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label htmlFor="textbook" className="text-sm font-medium text-foreground/80">
                Textbook Name
              </label>
              <input
                id="textbook"
                value={config.textbook}
                onChange={(e) => onConfigChange('textbook', e.target.value)}
                placeholder="Stewart Calculus 8e"
                className={inputClassName}
                disabled={config.useTextbookPdf}
              />
            </div>
            <div>
              <label htmlFor="grade" className="text-sm font-medium text-foreground/80">
                Grade
              </label>
              <input
                id="grade"
                value={config.gradeLevel}
                onChange={(e) => onConfigChange('gradeLevel', e.target.value)}
                placeholder="Grade 10"
                className={inputClassName}
              />
            </div>
          </div>
          <div>
            <label htmlFor="chapters" className="text-sm font-medium text-foreground/80">
              Chapters
            </label>
            <input
              id="chapters"
              value={config.chapters}
              onChange={(e) => onConfigChange('chapters', e.target.value)}
              placeholder="Ch.2.1, Ch.2.2, Ch.2.4"
              className={inputClassName}
            />
          </div>

          {/* Textbook PDF Upload Option */}
          <div className="rounded-xl border border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800/50">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="useTextbookPdf"
                checked={config.useTextbookPdf}
                onChange={(e) => {
                  onConfigChange('useTextbookPdf', e.target.checked)
                  if (!e.target.checked) {
                    onConfigChange('textbookFile', null)
                  }
                }}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <div className="flex-1">
                <label htmlFor="useTextbookPdf" className="text-sm font-medium text-gray-900 dark:text-white cursor-pointer">
                  Upload Textbook PDF (Optional)
                </label>
                <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                  AI will generate questions directly from your textbook content instead of searching the web
                </p>

                {config.useTextbookPdf && (
                  <div className="mt-3">
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          if (file.type !== 'application/pdf') {
                            alert('Please upload a PDF file')
                            return
                          }
                          if (file.size > 50 * 1024 * 1024) {
                            alert('File size must be less than 50MB')
                            return
                          }
                          onConfigChange('textbookFile', file)
                          // Auto-fill textbook name from filename
                          if (!config.textbook) {
                            onConfigChange('textbook', file.name.replace('.pdf', ''))
                          }
                        }
                      }}
                      className="text-sm text-gray-600 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100 dark:file:bg-indigo-900/30 dark:file:text-indigo-300"
                    />
                    {config.textbookFile && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                        Selected: {config.textbookFile.name} ({(config.textbookFile.size / 1024 / 1024).toFixed(2)} MB)
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section>
        <SectionHeader title="Notes" />
        <div className="mt-3 space-y-4">
          <div>
            <label htmlFor="notes" className="text-sm font-medium text-foreground/80">
              Notes (optional)
            </label>
            <textarea
              id="notes"
              value={config.notes}
              onChange={(e) => onConfigChange('notes', e.target.value)}
              placeholder="Mention tone, pitfalls, or constraints."
              className={`${inputClassName} h-28 resize-none`}
            />
          </div>
        </div>
      </section>

      <section>
        <SectionHeader title="Configuration" />
        <div className="mt-3">
          <label htmlFor="question-count" className="text-sm font-medium text-foreground/80">
            Questions
          </label>
          <input
            id="question-count"
            type="number"
            value={config.questionCount}
            onChange={(e) => {
              const value = Number(e.target.value)
              if (!Number.isNaN(value)) {
                onConfigChange('questionCount', value)
              }
            }}
            onBlur={(e) => {
              const value = Number(e.target.value)
              if (Number.isNaN(value) || value < 5 || value > 50) {
                onConfigChange('questionCount', Math.min(50, Math.max(5, value || 10)))
              }
            }}
            className={`${inputClassName} max-w-[160px]`}
          />
          <p className="mt-2 text-xs text-muted-foreground">
            5–50 questions recommended.
          </p>
        </div>
      </section>

      {error && (
        <div className="rounded-xl border border-amber-300/60 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
          {error}
        </div>
      )}
    </form>
  )
}
