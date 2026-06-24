import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router'
import type { Qualification } from '@/shared/types/domain'
import { QUALIFICATIONS } from '@/shared/constants/qualifications'

export type SortKey = 'recent' | 'price_asc' | 'price_desc'

export interface SearchFilters {
  distrito?: string
  concelho?: string
  freguesia?: string
  qualifications: Qualification[]
  date?: string
  priceMinCents?: number
  priceMaxCents?: number
  durationMinMonths?: number
  durationMaxMonths?: number
  sort: SortKey
  page: number
}

const SORTS: readonly SortKey[] = ['recent', 'price_asc', 'price_desc']

function readInt(sp: URLSearchParams, key: string): number | undefined {
  const v = sp.get(key)
  if (v === null || v === '') return undefined
  const n = Number(v)
  return Number.isFinite(n) ? n : undefined
}

function readQualifications(sp: URLSearchParams): Qualification[] {
  const v = sp.get('qualifications')
  if (!v) return []
  const set = new Set<Qualification>()
  v.split(',').forEach((s) => {
    const trimmed = s.trim() as Qualification
    if ((QUALIFICATIONS as readonly string[]).includes(trimmed)) set.add(trimmed)
  })
  return Array.from(set)
}

function readSort(sp: URLSearchParams): SortKey {
  const v = sp.get('sort') as SortKey | null
  return v && SORTS.includes(v) ? v : 'recent'
}

function readFilters(sp: URLSearchParams): SearchFilters {
  return {
    distrito: sp.get('distrito') ?? undefined,
    concelho: sp.get('concelho') ?? undefined,
    freguesia: sp.get('freguesia') ?? undefined,
    qualifications: readQualifications(sp),
    date: sp.get('date') ?? undefined,
    priceMinCents: readInt(sp, 'priceMinCents'),
    priceMaxCents: readInt(sp, 'priceMaxCents'),
    durationMinMonths: readInt(sp, 'durationMinMonths'),
    durationMaxMonths: readInt(sp, 'durationMaxMonths'),
    sort: readSort(sp),
    page: Math.max(1, readInt(sp, 'page') ?? 1),
  }
}

function writeFilters(filters: SearchFilters): URLSearchParams {
  const sp = new URLSearchParams()
  if (filters.distrito) sp.set('distrito', filters.distrito)
  if (filters.concelho) sp.set('concelho', filters.concelho)
  if (filters.freguesia) sp.set('freguesia', filters.freguesia)
  if (filters.qualifications.length > 0) sp.set('qualifications', filters.qualifications.join(','))
  if (filters.date) sp.set('date', filters.date)
  if (filters.priceMinCents !== undefined) sp.set('priceMinCents', String(filters.priceMinCents))
  if (filters.priceMaxCents !== undefined) sp.set('priceMaxCents', String(filters.priceMaxCents))
  if (filters.durationMinMonths !== undefined) sp.set('durationMinMonths', String(filters.durationMinMonths))
  if (filters.durationMaxMonths !== undefined) sp.set('durationMaxMonths', String(filters.durationMaxMonths))
  if (filters.sort !== 'recent') sp.set('sort', filters.sort)
  if (filters.page > 1) sp.set('page', String(filters.page))
  return sp
}

export type FilterKey = keyof SearchFilters

export interface UseSearchFiltersResult {
  filters: SearchFilters
  setFilters: (next: Partial<SearchFilters>) => void
  clearFilter: (key: FilterKey) => void
  clearAll: () => void
  toggleQualification: (q: Qualification) => void
  hasAnyFilter: boolean
  activeFilterCount: number
  moreFiltersActiveCount: number
}

export function useSearchFilters(): UseSearchFiltersResult {
  const [searchParams, setSearchParams] = useSearchParams()

  const filters = useMemo(() => readFilters(searchParams), [searchParams])

  const replace = useCallback(
    (next: SearchFilters) => {
      setSearchParams(writeFilters(next), { replace: false })
    },
    [setSearchParams]
  )

  const setFilters = useCallback(
    (partial: Partial<SearchFilters>) => {
      const next: SearchFilters = { ...filters, ...partial, page: 1 }
      // Cascade resets
      if ('distrito' in partial && partial.distrito !== filters.distrito) {
        next.concelho = undefined
        next.freguesia = undefined
      }
      if ('concelho' in partial && partial.concelho !== filters.concelho) {
        next.freguesia = undefined
      }
      replace(next)
    },
    [filters, replace]
  )

  const clearFilter = useCallback(
    (key: FilterKey) => {
      const next: SearchFilters = { ...filters, page: 1 }
      if (key === 'qualifications') next.qualifications = []
      else if (key === 'sort') next.sort = 'recent'
      else if (key === 'page') next.page = 1
      else (next as unknown as Record<string, unknown>)[key] = undefined
      if (key === 'distrito') { next.concelho = undefined; next.freguesia = undefined }
      if (key === 'concelho') { next.freguesia = undefined }
      replace(next)
    },
    [filters, replace]
  )

  const clearAll = useCallback(() => {
    replace({ qualifications: [], sort: 'recent', page: 1 })
  }, [replace])

  const toggleQualification = useCallback(
    (q: Qualification) => {
      const set = new Set(filters.qualifications)
      if (set.has(q)) set.delete(q)
      else set.add(q)
      setFilters({ qualifications: Array.from(set) })
    },
    [filters.qualifications, setFilters]
  )

  const activeFilterCount =
    (filters.distrito ? 1 : 0) +
    (filters.concelho ? 1 : 0) +
    (filters.freguesia ? 1 : 0) +
    filters.qualifications.length +
    (filters.date ? 1 : 0) +
    (filters.priceMinCents !== undefined ? 1 : 0) +
    (filters.priceMaxCents !== undefined ? 1 : 0) +
    (filters.durationMinMonths !== undefined ? 1 : 0) +
    (filters.durationMaxMonths !== undefined ? 1 : 0)

  const moreFiltersActiveCount =
    (filters.freguesia ? 1 : 0) +
    (filters.priceMinCents !== undefined ? 1 : 0) +
    (filters.priceMaxCents !== undefined ? 1 : 0) +
    (filters.durationMinMonths !== undefined ? 1 : 0) +
    (filters.durationMaxMonths !== undefined ? 1 : 0)

  return {
    filters,
    setFilters,
    clearFilter,
    clearAll,
    toggleQualification,
    hasAnyFilter: activeFilterCount > 0,
    activeFilterCount,
    moreFiltersActiveCount,
  }
}
