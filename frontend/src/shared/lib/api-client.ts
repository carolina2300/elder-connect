import { useSessionStore } from '@/features/auth/session.store'
import type { ProblemDetails } from '@/shared/types/api'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api'

export class ApiError extends Error {
  status: number
  detail?: string
  constructor(problem: ProblemDetails) {
    super(problem.title || `HTTP ${problem.status}`)
    this.status = problem.status
    this.detail = problem.detail
  }
}

interface RequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'
  body?: unknown
  signal?: AbortSignal
}

export async function apiFetch<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, signal } = opts
  const headers: Record<string, string> = { Accept: 'application/json' }

  const token = useSessionStore.getState().token
  if (token) headers.Authorization = `Bearer ${token}`
  if (body !== undefined) headers['Content-Type'] = 'application/json'

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    signal,
  })

  if (res.status === 401) {
    useSessionStore.getState().clearSession()
  }

  if (!res.ok) {
    let problem: ProblemDetails
    try {
      problem = (await res.json()) as ProblemDetails
    } catch {
      problem = { type: 'about:blank', title: res.statusText, status: res.status }
    }
    throw new ApiError(problem)
  }

  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}
