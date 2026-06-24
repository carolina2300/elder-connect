export type Role = 'CARE_SEEKER' | 'CARE_GIVER'

export type Qualification =
  | 'HOUSE_CLEANING'
  | 'PERSONAL_HYGIENE'
  | 'COMPANION'
  | 'DEMENTIA_CARE'
  | 'SENIOR_TRANSPORTATION'
  | 'ASSISTED_LIVING'
  | 'POST_SURGERY'

export type DayOfWeek = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN'

export interface User {
  id: string
  name: string
  email: string
  description: string
  photo: string | null
  role: Role
  createdAt: string
}

export interface GeoLocation {
  distrito: string
  concelho: string
  freguesia: string
  postalCode?: string
}

export type Currency = 'EUR'
export type PriceUnit = 'PER_HOUR' | 'PER_DAY' | 'PER_WEEK' | 'PER_MONTH'

export interface PriceRange {
  minCents: number
  maxCents: number
  currency: Currency
  unit: PriceUnit
}

export interface TimeSlot {
  startTime: string
  endTime: string
}

export type WeeklyAvailability = Partial<Record<DayOfWeek, TimeSlot[]>>

export type DurationUnit = 'WEEK' | 'MONTH'
export interface Duration {
  amount: number
  unit: DurationUnit
}

export type PostStatus = 'OPEN' | 'CLOSED'

interface PostBase {
  id: string
  authorId: string
  createdAt: string
  status: PostStatus
  location: GeoLocation
  priceRange: PriceRange
  duration: Duration
  description?: string
}

export interface CaregiverPost extends PostBase {
  kind: 'CAREGIVER'
  weeklyAvailability: WeeklyAvailability
  earliestStartDate: string
  offeredQualifications: Qualification[]
}

export interface CaretakerPost extends PostBase {
  kind: 'CARETAKER'
  startDate: string
  endDate?: string
  dailyTimeWindow: TimeSlot
  requiredQualifications: Qualification[]
}

export type Post = CaregiverPost | CaretakerPost

export interface Conversation {
  id: string
  participantIds: [string, string]
  lastMessage?: Message
  unreadCount: number
  createdAt: string
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  body: string
  sentAt: string
  readAt: string | null
}

export interface AuthResponse {
  user: User
  token: string
}
