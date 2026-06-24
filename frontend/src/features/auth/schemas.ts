import { z } from 'zod'
import { t } from '@/shared/i18n/strings'

export const loginSchema = z.object({
  email: z.string().email(t.validation.emailInvalid),
  password: z.string().min(8, t.validation.passwordMin),
})
export type LoginInput = z.infer<typeof loginSchema>

export const registerSchema = z.object({
  name: z.string().min(2, t.validation.nameTooShort),
  email: z.string().email(t.validation.emailInvalid),
  password: z.string().min(8, t.validation.passwordMin),
  description: z.string().max(500, t.validation.descriptionMax),
  role: z.enum(['CARE_SEEKER', 'CARE_GIVER'], {
    message: t.validation.pickRole,
  }),
})
export type RegisterInput = z.infer<typeof registerSchema>
