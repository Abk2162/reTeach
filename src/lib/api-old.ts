// Utility functions for making authenticated API calls

/**
 * Get the current OAuth token from localStorage
 */
export function getAuthToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem('oauth_token')
}

/**
 * Get the current user's email from localStorage
 */
export function getUserEmail(): string | null {
  if (typeof window === 'undefined') return null
  const userStr = localStorage.getItem('user')
  if (!userStr) return null
  
  try {
    const user = JSON.parse(userStr)
    return user.email || null
  } catch {
    return null
  }
}

/**
 * Make an authenticated API request with the OAuth token and user email
 */
export async function authenticatedFetch(
  url: string, 
  options: RequestInit = {},
  orgId?: string
): Promise<Response> {
  const token = getAuthToken()
  const userEmail = getUserEmail()
  
  if (!token) {
    throw new Error('No authentication token found. Please log in again.')
  }

  if (!userEmail) {
    throw new Error('No user email found. Please log in again.')
  }

  const headers = new Headers(options.headers)
  headers.set('Authorization', `Bearer ${token}`)
  headers.set('X-User-Email', userEmail)
  
  // Add organization ID if provided
  if (orgId) {
    headers.set('X-Org-ID', orgId)
  }
  
  return fetch(url, {
    ...options,
    headers
  })
}

/**
 * Make a GET request with authentication
 */
export async function authenticatedGet(url: string, orgId?: string): Promise<Response> {
  return authenticatedFetch(url, { method: 'GET' }, orgId)
}

/**
 * Make a POST request with authentication
 */
export async function authenticatedPost(
  url: string, 
  data: unknown,
  orgId?: string
): Promise<Response> {
  return authenticatedFetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  }, orgId)
}

/**
 * Make a DELETE request with authentication
 */
export async function authenticatedDelete(url: string, orgId?: string): Promise<Response> {
  return authenticatedFetch(url, { method: 'DELETE' }, orgId)
}
