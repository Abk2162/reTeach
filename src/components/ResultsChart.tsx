'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts'
import type { TopicStat } from '@/lib/schema'

interface ResultsChartProps {
  stats: TopicStat[]
}

export default function ResultsChart({ stats }: ResultsChartProps) {
  // Color scale based on percentage
  const getColor = (pct: number) => {
    if (pct >= 80) return '#10b981' // green-500
    if (pct >= 70) return '#3b82f6' // blue-500
    if (pct >= 60) return '#f59e0b' // amber-500
    return '#ef4444' // red-500
  }

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={400}>
        <BarChart
          data={stats}
          margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="topic"
            angle={-45}
            textAnchor="end"
            height={100}
            tick={{ fill: '#6b7280', fontSize: 12 }}
          />
          <YAxis
            label={{ value: '% Correct', angle: -90, position: 'insideLeft', style: { fill: '#6b7280' } }}
            domain={[0, 100]}
            tick={{ fill: '#6b7280' }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '12px'
            }}
            formatter={(value: number) => [`${value.toFixed(1)}%`, 'Correct']}
            labelFormatter={(label) => `Topic: ${label}`}
          />
          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            formatter={() => 'Student Performance'}
          />
          <Bar dataKey="correctPct" name="% Correct" radius={[8, 8, 0, 0]}>
            {stats.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={getColor(entry.correctPct)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Stats Summary */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
            Average Score
          </p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
            {(stats.reduce((sum, s) => sum + s.correctPct, 0) / stats.length).toFixed(1)}%
          </p>
        </div>

        <div className="p-4 bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg">
          <p className="text-sm font-medium text-green-900 dark:text-green-200">
            Strongest Topic
          </p>
          <p className="text-sm font-bold text-green-600 dark:text-green-400 mt-1">
            {stats.reduce((max, s) => s.correctPct > max.correctPct ? s : max, stats[0])?.topic || 'N/A'}
          </p>
        </div>

        <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm font-medium text-red-900 dark:text-red-200">
            Needs Focus
          </p>
          <p className="text-sm font-bold text-red-600 dark:text-red-400 mt-1">
            {stats.reduce((min, s) => s.correctPct < min.correctPct ? s : min, stats[0])?.topic || 'N/A'}
          </p>
        </div>
      </div>

      {/* Performance Guide */}
      <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Performance Guide:
        </p>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">≥80% Mastery</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-blue-500 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">70-79% Good</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-amber-500 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">60-69% Needs Review</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded"></div>
            <span className="text-gray-600 dark:text-gray-400">&lt;60% Needs Focus</span>
          </div>
        </div>
      </div>
    </div>
  )
}
