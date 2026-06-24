import { ComboBox } from './GeoCascade'
import { QualificationsFilter } from './QualificationsFilter'
import { DateFilter } from './DateFilter'
import { MoreFiltersPopover } from './MoreFiltersPopover'
import { SortDropdown } from './SortDropdown'
import { useSearchFilters } from '../hooks/useSearchFilters'
import { PT_DISTRITOS, getConcelhos, getFreguesias } from '@/shared/data/pt-geo'
import { t } from '@/shared/i18n/strings'
import type { Role } from '@/shared/types/domain'

interface Props {
  viewerRole: Role
  priceLimitMinCents: number
  priceLimitMaxCents: number
}

export function FilterBar({ viewerRole, priceLimitMinCents, priceLimitMaxCents }: Props) {
  const { filters, setFilters, clearAll, toggleQualification, moreFiltersActiveCount } = useSearchFilters()

  const concelhoOptions = getConcelhos(filters.distrito)
  const freguesiaOptions = getFreguesias(filters.concelho)

  // viewer = CARE_GIVER sees CARETAKER posts → "Quando precisa de ajuda?"
  // viewer = CARE_SEEKER sees CAREGIVER posts → "Disponível a partir de"
  const dateLabel = viewerRole === 'CARE_GIVER' ? t.search.dateCaretakerLabel : t.search.dateCaregiverLabel

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-[1.1fr_1.1fr_1.4fr_1fr_auto_auto]">
        <ComboBox
          label={t.geo.distrito}
          placeholder={t.geo.pickDistrito}
          value={filters.distrito}
          options={PT_DISTRITOS}
          onChange={(v) => setFilters({ distrito: v })}
        />
        <ComboBox
          label={t.geo.concelho}
          placeholder={filters.distrito ? t.geo.pickConcelho : t.geo.concelhoNeedsDistrito}
          value={filters.concelho}
          options={concelhoOptions}
          disabled={!filters.distrito}
          onChange={(v) => setFilters({ concelho: v })}
        />
        <QualificationsFilter
          selected={filters.qualifications}
          onToggle={toggleQualification}
        />
        <DateFilter label={dateLabel} value={filters.date} onChange={(v) => setFilters({ date: v })} />
        <MoreFiltersPopover
          filters={filters}
          setFilters={setFilters}
          clearAll={clearAll}
          activeCount={moreFiltersActiveCount}
          freguesiaOptions={freguesiaOptions}
          freguesiaDisabled={!filters.concelho}
          priceLimitMinCents={priceLimitMinCents}
          priceLimitMaxCents={priceLimitMaxCents}
        />
        <SortDropdown value={filters.sort} onChange={(sort) => setFilters({ sort })} />
      </div>
    </div>
  )
}
