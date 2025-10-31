import type { DiagnosticRow, StudentFlag, TopicStat, Preview } from './schema'

export const fakeDiagnostics: DiagnosticRow[] = [
  {
    id: 'calculus-diagnostic',
    slug: 'calculus-diagnostic',
    formUuid: 'uuid-calculus-1',
    name: 'Calculus I - Limits & Derivatives',
    course: 'Math 101',
    createdAt: '2025-10-14',
    responses: 45,
    completionPct: 90,
    weakTopics: ['Chain Rule', 'Implicit Differentiation', 'Related Rates'],
    strongTopics: ['Limits', 'Derivatives', 'Integrals'],
    status: 'active',
    avgScore: 72.5,
    lastSubmission: '2025-10-14T12:20:00Z'
  },
  {
    id: 'python-data-structures',
    slug: 'python-data-structures',
    formUuid: 'uuid-python-1',
    name: 'Intro to Python - Data Structures',
    course: 'CS 150',
    createdAt: '2025-10-12',
    responses: 32,
    completionPct: 80,
    weakTopics: ['Linked Lists', 'Hash Tables', 'Recursion'],
    strongTopics: ['Lists', 'Trees', 'Stacks'],
    status: 'active',
    avgScore: 68.4,
    lastSubmission: '2025-10-12T09:45:00Z'
  },
  {
    id: 'biology-cell-structure',
    slug: 'biology-cell-structure',
    formUuid: 'uuid-bio-1',
    name: 'Biology - Cell Structure',
    course: 'Bio 200',
    createdAt: '2025-10-10',
    responses: 28,
    completionPct: 70,
    weakTopics: ['Mitochondria', 'Cell Membrane', 'Nucleus'],
    strongTopics: ['Ribosomes', 'Golgi Apparatus', 'Cytoplasm'],
    status: 'active',
    avgScore: 63.1,
    lastSubmission: '2025-10-10T15:05:00Z'
  },
  {
    id: 'chemistry-stoichiometry',
    slug: 'chemistry-stoichiometry',
    formUuid: 'uuid-chem-1',
    name: 'Chemistry - Stoichiometry',
    course: 'Chem 101',
    createdAt: '2025-10-08',
    responses: 15,
    completionPct: 38,
    weakTopics: ['Mole Conversions', 'Limiting Reagent', 'Percent Yield'],
    strongTopics: ['Stoichiometric Ratios', 'Balancing Equations'],
    status: 'active',
    avgScore: 42.8,
    lastSubmission: '2025-10-08T11:30:00Z'
  },
  {
    id: 'physics-kinematics',
    slug: 'physics-kinematics',
    formUuid: 'uuid-phys-1',
    name: 'Physics - Kinematics',
    course: 'Phys 101',
    createdAt: '2025-10-06',
    responses: 0,
    completionPct: 0,
    weakTopics: [],
    strongTopics: [],
    status: 'active',
    lastSubmission: null
  },
  {
    id: 'history-world-war-one',
    slug: 'history-world-war-one',
    formUuid: 'uuid-hist-1',
    name: 'History - World War I',
    course: 'Hist 201',
    createdAt: '2025-09-28',
    responses: 42,
    completionPct: 95,
    weakTopics: ['Treaty of Versailles', 'Trench Warfare'],
    strongTopics: ['Allied Strategy', 'Timeline of Events'],
    status: 'archived',
    avgScore: 81.9,
    lastSubmission: '2025-09-28T10:12:00Z'
  }
]

export const fakeStudentFlags: StudentFlag[] = [
  { student: 'Alice Johnson', scorePct: 42 },
  { student: 'Bob Smith', scorePct: 48 },
  { student: 'Charlie Davis', scorePct: 51 },
  { student: 'Diana Martinez', scorePct: 55 },
  { student: 'Ethan Wilson', scorePct: 58 }
]

export const fakeTopicStats: TopicStat[] = [
  { topic: 'Limits', n: 45, correctPct: 78.5 },
  { topic: 'Derivatives', n: 45, correctPct: 82.3 },
  { topic: 'Chain Rule', n: 45, correctPct: 58.2 },
  { topic: 'Implicit Diff', n: 45, correctPct: 61.7 },
  { topic: 'Related Rates', n: 45, correctPct: 54.9 },
  { topic: 'Integrals', n: 45, correctPct: 85.1 },
  { topic: 'U-Substitution', n: 45, correctPct: 71.4 },
  { topic: 'Integration by Parts', n: 45, correctPct: 68.3 }
]

export const fakePreview: Preview = {
  id: '1',
  title: 'Calculus I - Limits & Derivatives Diagnostic',
  course: 'Math 101',
  updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
  assigned: 48,
  responses: 45,
  completionPct: 93,
  avgScorePct: 68,
  p25: 48,
  p50: 64,
  p75: 78,
  atRisk: 9,
  topics: [
    { name: 'Related Rates', n: 28, correctPct: 42 },
    { name: 'Chain Rule', n: 30, correctPct: 55 },
    { name: 'Implicit Differentiation', n: 29, correctPct: 58 },
    { name: 'Limits', n: 45, correctPct: 79 },
    { name: 'Derivatives', n: 45, correctPct: 82 },
    { name: 'Integrals', n: 45, correctPct: 86 }
  ],
  distBins: [
    { range: [0, 10], n: 1 },
    { range: [10, 20], n: 2 },
    { range: [20, 30], n: 4 },
    { range: [30, 40], n: 5 },
    { range: [40, 50], n: 7 },
    { range: [50, 60], n: 8 },
    { range: [60, 70], n: 7 },
    { range: [70, 80], n: 6 },
    { range: [80, 90], n: 4 },
    { range: [90, 100], n: 1 }
  ],
  subgroups: [
    { name: 'Section A', n: 23, scorePct: 71 },
    { name: 'Section B', n: 22, scorePct: 64 },
    { name: 'Honors Cohort', n: 12, scorePct: 82 }
  ]
}
