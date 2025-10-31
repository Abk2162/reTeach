// Common types used throughout the application

export interface WaitlistEntry {
  id: string
  email: string
  name?: string
  company?: string
  created_at: string
  subscribed_to_updates?: boolean
  estimated_monthly_tokens?: string
  use_case?: string
}

export interface ApiKey {
  id: string
  name: string
  key_prefix: string
  created_at: string
  last_used_at?: string
  usage_count?: number
}

export interface UsageData {
  date: string
  requests: number
  tokens_saved: number
  compression_ratio: number
}

export interface User {
  id: string
  email: string
  created_at: string
  last_sign_in?: string
}

export interface Organization {
  id: string
  name: string
  created_at: string
  default_mode: 'test' | 'live'
}

export interface FilterState {
  search: string
  sortBy: string
  sortOrder: 'asc' | 'desc'
}

export type MessageType = 'success' | 'error' | 'info'

// Generic API response types
export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Event handler types
export type ChangeHandler = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
export type FormHandler = (e: React.FormEvent) => void
export type ClickHandler = (e: React.MouseEvent) => void