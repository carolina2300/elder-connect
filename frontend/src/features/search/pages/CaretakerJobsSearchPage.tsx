import { FilterBar } from '../components/FilterBar'
import { ActiveFilterPills } from '../components/ActiveFilterPills'
import { PostList } from '../components/PostList'
import { useSearchFilters } from '../hooks/useSearchFilters'
import { usePostsSearch } from '../hooks/usePostsSearch'
import { t } from '@/shared/i18n/strings'

const PRICE_MIN = 0
const PRICE_MAX = 300000 // €3.000

export function CaretakerJobsSearchPage() {
  const { filters } = useSearchFilters()
  const query = usePostsSearch(filters)

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">{t.search.caretakerSearchTitle}</h1>
        <p className="mt-2 text-muted-foreground">{t.search.caretakerSearchSubtitle}</p>
      </div>

      <div className="mb-6 space-y-3">
        <FilterBar viewerRole="CARE_GIVER" priceLimitMinCents={PRICE_MIN} priceLimitMaxCents={PRICE_MAX} />
        <ActiveFilterPills />
      </div>

      <PostList
        posts={query.data?.content}
        isLoading={query.isLoading}
        isError={query.isError}
        totalElements={query.data?.totalElements}
        loadingMore={query.isFetching && !query.isLoading}
      />
    </div>
  )
}
