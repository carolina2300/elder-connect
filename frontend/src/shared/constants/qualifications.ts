import type { Qualification } from '@/shared/types/domain'

export const QUALIFICATIONS = [
  'HOUSE_CLEANING',
  'PERSONAL_HYGIENE',
  'COMPANION',
  'DEMENTIA_CARE',
  'SENIOR_TRANSPORTATION',
  'ASSISTED_LIVING',
  'POST_SURGERY',
] as const satisfies readonly Qualification[]

export const QUALIFICATION_LABELS: Record<Qualification, string> = {
  HOUSE_CLEANING: 'House Cleaning',
  PERSONAL_HYGIENE: 'Personal Hygiene',
  COMPANION: 'Companion',
  DEMENTIA_CARE: 'Dementia Care',
  SENIOR_TRANSPORTATION: 'Senior Transportation',
  ASSISTED_LIVING: 'Assisted Living',
  POST_SURGERY: 'Post Surgery',
}
