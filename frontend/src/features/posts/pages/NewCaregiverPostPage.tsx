import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import { Separator } from '@/shared/components/ui/separator'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form'
import { ComboBox } from '@/features/search/components/GeoCascade'
import { QUALIFICATIONS, QUALIFICATION_LABELS } from '@/shared/constants/qualifications'
import { PT_DISTRITOS, PT_CONCELHOS, PT_FREGUESIAS } from '@/shared/data/pt-geo'
import { t } from '@/shared/i18n/strings'
import { cn } from '@/shared/lib/cn'
import { useCreatePost } from '../api/posts'
import { ApiError } from '@/shared/lib/api-client'
import type { DayOfWeek, Qualification, TimeSlot, WeeklyAvailability } from '@/shared/types/domain'

const DAYS: DayOfWeek[] = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN']
type SlotKey = 'morning' | 'afternoon' | 'evening'
const SLOT_KEYS: SlotKey[] = ['morning', 'afternoon', 'evening']

const SLOT_TIMES: Record<SlotKey, TimeSlot> = {
  morning: { startTime: '08:00', endTime: '12:00' },
  afternoon: { startTime: '12:00', endTime: '17:00' },
  evening: { startTime: '17:00', endTime: '20:00' },
}

const DAY_LABELS: Record<DayOfWeek, string> = {
  MON: t.newPost.mon,
  TUE: t.newPost.tue,
  WED: t.newPost.wed,
  THU: t.newPost.thu,
  FRI: t.newPost.fri,
  SAT: t.newPost.sat,
  SUN: t.newPost.sun,
}

type AvailGrid = Record<DayOfWeek, Record<SlotKey, boolean>>

function emptyGrid(): AvailGrid {
  return Object.fromEntries(
    DAYS.map((d) => [d, { morning: false, afternoon: false, evening: false }])
  ) as AvailGrid
}

function gridToWeeklyAvailability(grid: AvailGrid): WeeklyAvailability {
  const result: WeeklyAvailability = {}
  for (const day of DAYS) {
    const slots = SLOT_KEYS.filter((s) => grid[day][s]).map((s) => SLOT_TIMES[s])
    if (slots.length > 0) result[day] = slots
  }
  return result
}

function hasAnySlot(grid: AvailGrid): boolean {
  return DAYS.some((d) => SLOT_KEYS.some((s) => grid[d][s]))
}

const schema = z
  .object({
    distrito: z.string().min(1, t.validation.distritRequired),
    concelho: z.string().min(1, t.validation.concelhoRequired),
    freguesia: z.string().optional(),
    postalCode: z.string().optional(),
    earliestStartDate: z.string().min(1, t.validation.dateRequired),
    priceMinEur: z.coerce.number().min(1, t.validation.pricePositive),
    priceMaxEur: z.coerce.number().min(1, t.validation.pricePositive),
    durationAmount: z.coerce.number().min(1, t.validation.durationPositive),
    durationUnit: z.enum(['WEEK', 'MONTH']),
    description: z.string().max(500).optional(),
  })
  .refine((d) => d.priceMaxEur >= d.priceMinEur, {
    message: t.validation.priceMaxLessMin,
    path: ['priceMaxEur'],
  })

type FormData = z.infer<typeof schema>

export function NewCaregiverPostPage() {
  const navigate = useNavigate()
  const createPost = useCreatePost()
  const [qualifications, setQualifications] = useState<Qualification[]>([])
  const [qualError, setQualError] = useState<string>()
  const [availGrid, setAvailGrid] = useState<AvailGrid>(emptyGrid)
  const [availError, setAvailError] = useState<string>()

  const form = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onTouched',
    defaultValues: {
      distrito: '',
      concelho: '',
      durationUnit: 'MONTH',
    },
  })

  const distrito = form.watch('distrito')
  const concelho = form.watch('concelho')
  const concelhoOptions = distrito ? (PT_CONCELHOS[distrito] ?? []) : []
  const freguesiaOptions = concelho ? (PT_FREGUESIAS[concelho] ?? []) : []

  function toggleQual(q: Qualification) {
    setQualifications((prev) =>
      prev.includes(q) ? prev.filter((x) => x !== q) : [...prev, q]
    )
    setQualError(undefined)
  }

  function toggleSlot(day: DayOfWeek, slot: SlotKey) {
    setAvailGrid((prev) => ({
      ...prev,
      [day]: { ...prev[day], [slot]: !prev[day][slot] },
    }))
    setAvailError(undefined)
  }

  function onSubmit(data: FormData) {
    let valid = true
    if (qualifications.length === 0) {
      setQualError(t.validation.qualMin)
      valid = false
    }
    if (!hasAnySlot(availGrid)) {
      setAvailError(t.validation.availabilityMin)
      valid = false
    }
    if (!valid) return

    createPost.mutate(
      {
        kind: 'CAREGIVER',
        location: {
          distrito: data.distrito,
          concelho: data.concelho,
          freguesia: data.freguesia || undefined,
          postalCode: data.postalCode || undefined,
        },
        priceRange: {
          minCents: Math.round(data.priceMinEur * 100),
          maxCents: Math.round(data.priceMaxEur * 100),
          currency: 'EUR',
          unit: 'PER_HOUR',
        },
        duration: { amount: data.durationAmount, unit: data.durationUnit },
        earliestStartDate: data.earliestStartDate,
        weeklyAvailability: gridToWeeklyAvailability(availGrid),
        offeredQualifications: qualifications,
        description: data.description || undefined,
      },
      {
        onSuccess: (post) => {
          toast.success(t.newPost.successToast)
          void navigate(`/posts/${post.id}`)
        },
        onError: (err) => {
          const msg = err instanceof ApiError ? err.message : t.newPost.errorToast
          toast.error(msg)
        },
      }
    )
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">{t.newPost.createCaregiverTitle}</h1>

      <Form {...form}>
        <form className="space-y-8" onSubmit={form.handleSubmit(onSubmit)}>
          {/* Location */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">{t.newPost.locationSection}</h2>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="distrito"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.geo.distrito}</FormLabel>
                    <FormControl>
                      <ComboBox
                        label={t.geo.distrito}
                        placeholder={t.geo.pickDistrito}
                        value={field.value || undefined}
                        options={PT_DISTRITOS}
                        onChange={(v) => {
                          field.onChange(v ?? '')
                          form.setValue('concelho', '')
                          form.setValue('freguesia', '')
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="concelho"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.geo.concelho}</FormLabel>
                    <FormControl>
                      <ComboBox
                        label={t.geo.concelho}
                        placeholder={!distrito ? t.geo.concelhoNeedsDistrito : t.geo.pickConcelho}
                        value={field.value || undefined}
                        options={concelhoOptions}
                        disabled={!distrito}
                        onChange={(v) => {
                          field.onChange(v ?? '')
                          form.setValue('freguesia', '')
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="freguesia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.geo.freguesia}</FormLabel>
                    <FormControl>
                      <ComboBox
                        label={t.geo.freguesia}
                        placeholder={!concelho ? t.geo.freguesiaNeedsConcelho : t.geo.pickFreguesia}
                        value={field.value || undefined}
                        options={freguesiaOptions}
                        disabled={!concelho}
                        onChange={(v) => field.onChange(v ?? '')}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="postalCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.geo.postalCode}</FormLabel>
                    <FormControl>
                      <Input placeholder="0000-000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </section>

          <Separator />

          {/* Start date */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">{t.newPost.datesSection}</h2>
            <FormField
              control={form.control}
              name="earliestStartDate"
              render={({ field }) => (
                <FormItem className="max-w-xs">
                  <FormLabel>{t.newPost.earliestStart}</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>

          <Separator />

          {/* Weekly availability */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">{t.newPost.availabilitySection}</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="w-16 pb-2 text-left font-normal text-muted-foreground" />
                    {SLOT_KEYS.map((s) => (
                      <th key={s} className="pb-2 text-center font-medium">
                        {s === 'morning'
                          ? t.newPost.morning
                          : s === 'afternoon'
                            ? t.newPost.afternoon
                            : t.newPost.evening}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {DAYS.map((day) => (
                    <tr key={day}>
                      <td className="py-1 pr-3 font-medium text-muted-foreground">
                        {DAY_LABELS[day]}
                      </td>
                      {SLOT_KEYS.map((slot) => {
                        const checked = availGrid[day][slot]
                        return (
                          <td key={slot} className="py-1 text-center">
                            <button
                              type="button"
                              onClick={() => toggleSlot(day, slot)}
                              className={cn(
                                'mx-auto flex h-8 w-20 items-center justify-center rounded border text-xs transition-colors',
                                checked
                                  ? 'border-primary bg-primary text-primary-foreground'
                                  : 'border-border bg-background text-muted-foreground hover:bg-muted'
                              )}
                            >
                              {checked ? '✓' : '—'}
                            </button>
                          </td>
                        )
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {availError && <p className="text-sm text-destructive">{availError}</p>}
          </section>

          <Separator />

          {/* Qualifications */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">{t.newPost.qualificationsSection}</h2>
            <div className="flex flex-wrap gap-2">
              {QUALIFICATIONS.map((q) => {
                const selected = qualifications.includes(q)
                return (
                  <button
                    key={q}
                    type="button"
                    onClick={() => toggleQual(q)}
                    className={cn(
                      'rounded-full border px-3 py-1 text-sm transition-colors',
                      selected
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-background text-foreground hover:bg-muted'
                    )}
                  >
                    {QUALIFICATION_LABELS[q]}
                  </button>
                )
              })}
            </div>
            {qualError && <p className="text-sm text-destructive">{qualError}</p>}
          </section>

          <Separator />

          {/* Price */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">{t.newPost.priceSection}</h2>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priceMinEur"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.newPost.priceMin}</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} step={1} placeholder="10" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="priceMaxEur"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.newPost.priceMax}</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} step={1} placeholder="20" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </section>

          <Separator />

          {/* Duration */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">{t.newPost.durationSection}</h2>
            <div className="flex items-end gap-3">
              <FormField
                control={form.control}
                name="durationAmount"
                render={({ field }) => (
                  <FormItem className="w-28">
                    <FormLabel>{t.newPost.durationAmount}</FormLabel>
                    <FormControl>
                      <Input type="number" min={1} step={1} placeholder="3" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="durationUnit"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex overflow-hidden rounded-md border border-border">
                        {(['WEEK', 'MONTH'] as const).map((unit) => (
                          <button
                            key={unit}
                            type="button"
                            onClick={() => field.onChange(unit)}
                            className={cn(
                              'px-4 py-2 text-sm transition-colors',
                              field.value === unit
                                ? 'bg-primary text-primary-foreground'
                                : 'bg-background text-foreground hover:bg-muted'
                            )}
                          >
                            {unit === 'WEEK' ? t.newPost.weeks : t.newPost.months}
                          </button>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </section>

          <Separator />

          {/* Description */}
          <section className="space-y-3">
            <h2 className="text-lg font-semibold">{t.newPost.descriptionSection}</h2>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder={t.newPost.descriptionPlaceholder}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>

          <Button type="submit" size="lg" disabled={createPost.isPending}>
            {createPost.isPending ? t.newPost.submitting : t.newPost.submit}
          </Button>
        </form>
      </Form>
    </div>
  )
}
