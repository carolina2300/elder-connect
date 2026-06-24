import type { DayOfWeek } from '@/shared/types/domain'

export const DAYS_OF_WEEK = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'] as const satisfies readonly DayOfWeek[]

export const DAY_LABELS: Record<DayOfWeek, string> = {
  MON: 'Segunda-feira',
  TUE: 'Terça-feira',
  WED: 'Quarta-feira',
  THU: 'Quinta-feira',
  FRI: 'Sexta-feira',
  SAT: 'Sábado',
  SUN: 'Domingo',
}

export const DAY_LABELS_SHORT: Record<DayOfWeek, string> = {
  MON: 'Seg',
  TUE: 'Ter',
  WED: 'Qua',
  THU: 'Qui',
  FRI: 'Sex',
  SAT: 'Sáb',
  SUN: 'Dom',
}
