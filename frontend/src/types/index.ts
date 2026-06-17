export type UserType = 'CARE_SEEKER' | 'CARE_GIVER';
export type PostKind = 'CAREGIVER' | 'CARETAKER';
export type PostStatus = 'OPEN' | 'CLOSED';
export type PriceUnit = 'PER_HOUR' | 'PER_DAY' | 'PER_WEEK' | 'PER_MONTH';
export type DurationUnit = 'WEEK' | 'MONTH';
export type WeekDay = 'MON' | 'TUE' | 'WED' | 'THU' | 'FRI' | 'SAT' | 'SUN';
export type Qualification =
  | 'HOUSE_CLEANING'
  | 'PERSONAL_HYGIENE'
  | 'COMPANION'
  | 'DEMENTIA_CARE'
  | 'SENIOR_TRANSPORTATION'
  | 'ASSISTED_LIVING'
  | 'POST_SURGERY';

export interface User {
  id: string;
  email: string;
  name: string;
  description?: string;
  photo?: string;
  phoneNumber?: string;
  userType: UserType;
  createdAt: string;
}

export interface GeoLocation {
  distrito: string;
  concelho: string;
  freguesia: string;
  postalCode?: string;
}

export interface PriceRange {
  minCents: number;
  maxCents: number;
  unit: PriceUnit;
}

export interface PostDuration {
  amount: number;
  unit: DurationUnit;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
}

export interface Post {
  id: string;
  authorId: string;
  kind: PostKind;
  status: PostStatus;
  createdAt: string;
  description: string;
  location: GeoLocation;
  priceRange: PriceRange;
  duration: PostDuration;
  earliestStartDate?: string;
  offeredQualifications?: Qualification[];
  weeklyAvailability?: Record<WeekDay, TimeSlot[]>;
  startDate?: string;
  endDate?: string;
  dailyStartTime?: string;
  dailyEndTime?: string;
  requiredQualifications?: Qualification[];
}

export interface Review {
  id: string;
  reviewerId: string;
  reviewedId: string;
  rating: number;
  text: string;
  createdAt: string;
}

export interface Message {
  id: string;
  senderId: string;
  body: string;
  sentAt: string;
  readAt?: string;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  lastMessage?: Message;
}

export interface CreatePostRequest {
  kind: PostKind;
  description: string;
  location: GeoLocation;
  priceRange: PriceRange;
  duration: PostDuration;
  earliestStartDate?: string;
  offeredQualifications?: Qualification[];
  availabilitySlots?: { day: WeekDay; startTime: string; endTime: string }[];
  startDate?: string;
  endDate?: string;
  dailyStartTime?: string;
  dailyEndTime?: string;
  requiredQualifications?: Qualification[];
}
