export interface PageResponse<T> {
  content: T[]
  page: number
  size: number
  totalElements: number
  totalPages: number
}

export interface ProblemDetails {
  type: string
  title: string
  status: number
  detail?: string
}
