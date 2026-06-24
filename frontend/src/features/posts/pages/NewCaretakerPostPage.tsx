import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useForm, type Resolver } from 'react-hook-form'
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
import type { Qualification } from '@/shared/types/domain'

const schema = z
  .object({
    distrito: z.string().min(1, t.validation.distritRequired),
    concelho: z.string().min(1, t.validation.concelhoRequired),
    freguesia: z.string().optional(),
    postalCode: z.string().optional(),
    startDate: z.string().min(1, t.validation.dateRequired),
    endDate: z.string().optional(),
    windowStart: z.string().min(1, t.validation.timeRequired),
    windowEnd: z.string().min(1, t.validation.timeRequired),
    priceMinEur: z.coerce.number().min(1, t.validation.pricePositive),
    priceMaxEur: z.coerce.number().min(1, t.validation.pricePositive),
    durationAmount: z.coerce.number().min(1, t.validation.durationPositive),
    durationUnit: z.enum(['WEEK', 'MONTH']),
    description: z.string().max(500).optional(),
  })
  .refine((d) => d.windowEnd > d.windowStart, {
    message: t.validation.timeEndBeforeStart,
    path: ['windowEnd'],
  })
  .refine((d) => d.priceMaxEur >= d.priceMinEur, {
    message: t.validation.priceMaxLessMin,
    path: ['priceMaxEur'],
  })

type FormData = z.infer<typeof schema>

export function NewCaretakerPostPage() {
  const navigate = useNavigate()
  const createPost = useCreatePost()
  const [qualifications, setQualifications] = useState<Qualification[]>([])
  const [qualError, setQualError] = useState<string>()

  const form = useForm<FormData>({
    // zod v4 coerce gives input type `unknown`; resolver output is FormData.
    resolver: zodResolver(schema) as Resolver<FormData>,
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

  function onSubmit(data: FormData) {
    if (qualifications.length === 0) {
      setQualError(t.validation.qualMin)
      return
    }
    createPost.mutate(
      {
        kind: 'CARETAKER',
        location: {
          distrito: data.distrito,
          concelho: data.concelho,
          freguesia: data.freguesia || '',
          postalCode: data.postalCode || undefined,
        },
        priceRange: {
          minCents: Math.round(data.priceMinEur * 100),
          maxCents: Math.round(data.priceMaxEur * 100),
          currency: 'EUR',
          unit: 'PER_HOUR',
        },
        duration: { amount: data.durationAmount, unit: data.durationUnit },
        startDate: data.startDate,
        endDate: data.endDate || undefined,
        dailyTimeWindow: { startTime: data.windowStart, endTime: data.windowEnd },
        requiredQualifications: qualifications,
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
      <h1 className="mb-8 text-3xl font-bold tracking-tight">{t.newPost.createCaretakerTitle}</h1>

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

          {/* Dates */}
          <section className="space-y-4">
            <h2 className="text-lg font-semibold">{t.newPost.datesSection}</h2>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t.newPost.startDate}</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {t.newPost.endDate}{' '}
                      <span className="text-xs font-normal text-muted-foreground">
                        ({t.newPost.endDateHint})
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-medium">{t.newPost.dailyWindowSection}</p>
              <div className="flex items-center gap-3">
                <FormField
                  control={form.control}
                  name="windowStart"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="text-xs text-muted-foreground">
                        {t.newPost.dailyWindowFrom}
                      </FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <span className="mt-6 text-muted-foreground">—</span>
                <FormField
                  control={form.control}
                  name="windowEnd"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel className="text-xs text-muted-foreground">
                        {t.newPost.dailyWindowTo}
                      </FormLabel>
                      <FormControl>
                        <Input type="time" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
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
                      <div className="flex rounded-md border border-border overflow-hidden">
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
