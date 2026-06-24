import { useMemo } from 'react'
import { useListPosts } from '@/features/posts/api/posts'
import type { SearchFilters } from './useSearchFilters'

const PAGE_SIZE = 10

export function usePostsSearch(filters: SearchFilters) {
  const params = useMemo(
    () => ({
      distrito: filters.distrito,
      concelho: filters.concelho,
      freguesia: filters.freguesia,
      qualifications: filters.qualifications,
      availableOn: filters.date,
      priceMinCents: filters.priceMinCents,
      priceMaxCents: filters.priceMaxCents,
      durationMinMonths: filters.durationMinMonths,
      durationMaxMonths: filters.durationMaxMonths,
      sort: filters.sort,
      page: 1,
      size: PAGE_SIZE * filters.page,
    }),
    [filters]
  )
  return useListPosts(params)
}

export const SEARCH_PAGE_SIZE = PAGE_SIZE
