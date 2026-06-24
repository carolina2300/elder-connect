import type { Message, Post, Qualification, User } from '@/shared/types/domain'
import { seedUsers } from './seed/users'
import { seedPosts } from './seed/posts'
import { seedConversations, seedMessages } from './seed/conversations'
import type { SeedConversation } from './seed/conversations'

interface UserRecord extends User {
  password: string
}

export const users = new Map<string, UserRecord>()
export const tokens = new Map<string, string>() // token -> userId
export const posts = new Map<string, Post>()
export const conversations = new Map<string, SeedConversation>()
export const messages = new Map<string, Message>()

seedUsers.forEach((u) => users.set(u.id, u))
seedPosts.forEach((p) => posts.set(p.id, p))
seedConversations.forEach((c) => conversations.set(c.id, c))
seedMessages.forEach((m) => messages.set(m.id, m))

export function findUserByEmail(email: string): UserRecord | undefined {
  for (const u of users.values()) {
    if (u.email.toLowerCase() === email.toLowerCase()) return u
  }
  return undefined
}

export function publicUser(u: UserRecord): User {
  const { password: _password, ...rest } = u
  void _password
  return rest
}

export function issueToken(userId: string): string {
  const token = crypto.randomUUID()
  tokens.set(token, userId)
  return token
}

export function messagesForConversation(conversationId: string): Message[] {
  return Array.from(messages.values())
    .filter((m) => m.conversationId === conversationId)
    .sort((a, b) => a.sentAt.localeCompare(b.sentAt))
}

export function conversationsForUser(userId: string): SeedConversation[] {
  return Array.from(conversations.values()).filter((c) => c.participantIds.includes(userId))
}

export function findConversationByParticipants(a: string, b: string): SeedConversation | undefined {
  for (const c of conversations.values()) {
    if (
      (c.participantIds[0] === a && c.participantIds[1] === b) ||
      (c.participantIds[0] === b && c.participantIds[1] === a)
    ) {
      return c
    }
  }
  return undefined
}

export function userIdFromAuthHeader(authHeader: string | null): string | null {
  if (!authHeader?.startsWith('Bearer ')) return null
  const token = authHeader.slice('Bearer '.length).trim()
  return tokens.get(token) ?? null
}

export type SortKey = 'recent' | 'price_asc' | 'price_desc'

export interface PostsFilter {
  kind: 'CAREGIVER' | 'CARETAKER'
  distrito?: string
  concelho?: string
  freguesia?: string
  qualifications?: Qualification[]
  availableOn?: string
  priceMinCents?: number
  priceMaxCents?: number
  durationMinMonths?: number
  durationMaxMonths?: number
  sort: SortKey
}

function postQualifications(p: Post): readonly Qualification[] {
  return p.kind === 'CAREGIVER' ? p.offeredQualifications : p.requiredQualifications
}

function durationInMonths(p: Post): number {
  return p.duration.unit === 'MONTH' ? p.duration.amount : Math.max(1, Math.round(p.duration.amount / 4))
}

function matches(p: Post, f: PostsFilter): boolean {
  if (p.kind !== f.kind) return false
  if (p.status !== 'OPEN') return false
  if (f.distrito && p.location.distrito !== f.distrito) return false
  if (f.concelho && p.location.concelho !== f.concelho) return false
  if (f.freguesia && p.location.freguesia !== f.freguesia) return false

  if (f.qualifications && f.qualifications.length > 0) {
    const have = new Set(postQualifications(p))
    const anyMatch = f.qualifications.some((q) => have.has(q))
    if (!anyMatch) return false
  }

  if (f.priceMinCents !== undefined && p.priceRange.maxCents < f.priceMinCents) return false
  if (f.priceMaxCents !== undefined && p.priceRange.minCents > f.priceMaxCents) return false

  const months = durationInMonths(p)
  if (f.durationMinMonths !== undefined && months < f.durationMinMonths) return false
  if (f.durationMaxMonths !== undefined && months > f.durationMaxMonths) return false

  if (f.availableOn) {
    if (p.kind === 'CARETAKER') {
      if (f.availableOn < p.startDate) return false
      if (p.endDate && f.availableOn > p.endDate) return false
    } else {
      if (f.availableOn < p.earliestStartDate) return false
    }
  }

  return true
}

function sortPosts(list: Post[], sort: SortKey): Post[] {
  const sorted = [...list]
  if (sort === 'price_asc') {
    sorted.sort((a, b) => a.priceRange.minCents - b.priceRange.minCents)
  } else if (sort === 'price_desc') {
    sorted.sort((a, b) => b.priceRange.maxCents - a.priceRange.maxCents)
  } else {
    sorted.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
  }
  return sorted
}

export function findPosts(filter: PostsFilter): Post[] {
  const all = Array.from(posts.values()).filter((p) => matches(p, filter))
  return sortPosts(all, filter.sort)
}
