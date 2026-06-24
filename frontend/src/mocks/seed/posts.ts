import type { Post } from '@/shared/types/domain'

/**
 * 12 hand-written demo posts: 6 caregiver offers + 6 caretaker requests.
 * Spread across 6 distritos, varied qualifications, prices, dates.
 */
export const seedPosts: Post[] = [
  // ──────────────────────────────────────────────────────────────
  // CARETAKER posts (people who need help)
  // ──────────────────────────────────────────────────────────────
  {
    id: 'post-001',
    kind: 'CARETAKER',
    authorId: '11111111-1111-1111-1111-111111111111', // Margarida Sousa
    createdAt: '2026-05-02T09:00:00.000Z',
    status: 'OPEN',
    location: { distrito: 'Lisboa', concelho: 'Lisboa', freguesia: 'Alvalade' },
    priceRange: { minCents: 1000, maxCents: 1500, currency: 'EUR', unit: 'PER_HOUR' },
    duration: { amount: 3, unit: 'MONTH' },
    startDate: '2026-05-15',
    endDate: '2026-08-15',
    dailyTimeWindow: { startTime: '09:00', endTime: '13:00' },
    requiredQualifications: ['HOUSE_CLEANING', 'COMPANION'],
  },
  {
    id: 'post-002',
    kind: 'CARETAKER',
    authorId: '22222222-2222-2222-2222-222222222222', // Rui Almeida
    createdAt: '2026-05-03T11:30:00.000Z',
    status: 'OPEN',
    location: { distrito: 'Porto', concelho: 'Porto', freguesia: 'Paranhos' },
    priceRange: { minCents: 1200, maxCents: 2000, currency: 'EUR', unit: 'PER_HOUR' },
    duration: { amount: 2, unit: 'MONTH' },
    startDate: '2026-05-20',
    endDate: '2026-07-20',
    dailyTimeWindow: { startTime: '08:00', endTime: '12:00' },
    requiredQualifications: ['POST_SURGERY', 'SENIOR_TRANSPORTATION', 'PERSONAL_HYGIENE'],
  },
  {
    id: 'post-003',
    kind: 'CARETAKER',
    authorId: '55555555-5555-5555-5555-555555555555', // Carla Mendes
    createdAt: '2026-05-05T14:00:00.000Z',
    status: 'OPEN',
    location: { distrito: 'Setúbal', concelho: 'Almada', freguesia: 'Costa da Caparica' },
    priceRange: { minCents: 1500, maxCents: 2000, currency: 'EUR', unit: 'PER_HOUR' },
    duration: { amount: 6, unit: 'MONTH' },
    startDate: '2026-06-01',
    endDate: '2026-12-01',
    dailyTimeWindow: { startTime: '14:00', endTime: '20:00' },
    requiredQualifications: ['DEMENTIA_CARE', 'COMPANION', 'PERSONAL_HYGIENE', 'ASSISTED_LIVING'],
  },
  {
    id: 'post-004',
    kind: 'CARETAKER',
    authorId: '66666666-6666-6666-6666-666666666666', // Pedro Rocha
    createdAt: '2026-05-06T08:15:00.000Z',
    status: 'OPEN',
    location: { distrito: 'Braga', concelho: 'Braga', freguesia: 'Lomar e Arcos' },
    priceRange: { minCents: 900, maxCents: 1300, currency: 'EUR', unit: 'PER_HOUR' },
    duration: { amount: 4, unit: 'MONTH' },
    startDate: '2026-05-25',
    endDate: '2026-09-25',
    dailyTimeWindow: { startTime: '10:00', endTime: '14:00' },
    requiredQualifications: ['COMPANION', 'SENIOR_TRANSPORTATION'],
  },
  {
    id: 'post-005',
    kind: 'CARETAKER',
    authorId: '11111111-1111-1111-1111-111111111111', // Margarida Sousa
    createdAt: '2026-05-08T16:20:00.000Z',
    status: 'OPEN',
    location: { distrito: 'Lisboa', concelho: 'Sintra', freguesia: 'Algueirão-Mem Martins' },
    priceRange: { minCents: 1100, maxCents: 1600, currency: 'EUR', unit: 'PER_HOUR' },
    duration: { amount: 1, unit: 'MONTH' },
    startDate: '2026-06-01',
    endDate: '2026-07-01',
    dailyTimeWindow: { startTime: '15:00', endTime: '18:00' },
    requiredQualifications: ['HOUSE_CLEANING'],
  },
  {
    id: 'post-006',
    kind: 'CARETAKER',
    authorId: '22222222-2222-2222-2222-222222222222', // Rui Almeida
    createdAt: '2026-05-10T10:00:00.000Z',
    status: 'OPEN',
    location: { distrito: 'Faro', concelho: 'Faro', freguesia: 'Faro (Sé e São Pedro)' },
    priceRange: { minCents: 1500, maxCents: 2000, currency: 'EUR', unit: 'PER_HOUR' },
    duration: { amount: 3, unit: 'MONTH' },
    startDate: '2026-06-15',
    endDate: '2026-09-15',
    dailyTimeWindow: { startTime: '09:00', endTime: '17:00' },
    requiredQualifications: ['ASSISTED_LIVING', 'POST_SURGERY', 'PERSONAL_HYGIENE', 'COMPANION', 'DEMENTIA_CARE'],
  },

  // ──────────────────────────────────────────────────────────────
  // CAREGIVER posts (people offering services)
  // ──────────────────────────────────────────────────────────────
  {
    id: 'post-101',
    kind: 'CAREGIVER',
    authorId: '33333333-3333-3333-3333-333333333333', // Ana Pereira
    createdAt: '2026-05-01T08:30:00.000Z',
    status: 'OPEN',
    location: { distrito: 'Lisboa', concelho: 'Lisboa', freguesia: 'Avenidas Novas' },
    priceRange: { minCents: 1200, maxCents: 1800, currency: 'EUR', unit: 'PER_HOUR' },
    duration: { amount: 6, unit: 'MONTH' },
    earliestStartDate: '2026-05-20',
    weeklyAvailability: {
      MON: [{ startTime: '09:00', endTime: '13:00' }],
      TUE: [{ startTime: '09:00', endTime: '13:00' }],
      WED: [{ startTime: '09:00', endTime: '17:00' }],
      THU: [{ startTime: '09:00', endTime: '13:00' }],
      FRI: [{ startTime: '09:00', endTime: '13:00' }],
    },
    offeredQualifications: ['DEMENTIA_CARE', 'ASSISTED_LIVING', 'COMPANION', 'PERSONAL_HYGIENE'],
  },
  {
    id: 'post-102',
    kind: 'CAREGIVER',
    authorId: '44444444-4444-4444-4444-444444444444', // João Costa
    createdAt: '2026-05-02T12:00:00.000Z',
    status: 'OPEN',
    location: { distrito: 'Porto', concelho: 'Vila Nova de Gaia', freguesia: 'Canidelo' },
    priceRange: { minCents: 1000, maxCents: 1400, currency: 'EUR', unit: 'PER_HOUR' },
    duration: { amount: 3, unit: 'MONTH' },
    earliestStartDate: '2026-05-15',
    weeklyAvailability: {
      MON: [{ startTime: '08:00', endTime: '12:00' }, { startTime: '14:00', endTime: '18:00' }],
      TUE: [{ startTime: '08:00', endTime: '12:00' }, { startTime: '14:00', endTime: '18:00' }],
      WED: [{ startTime: '08:00', endTime: '12:00' }],
      THU: [{ startTime: '08:00', endTime: '12:00' }, { startTime: '14:00', endTime: '18:00' }],
      FRI: [{ startTime: '08:00', endTime: '12:00' }],
    },
    offeredQualifications: ['SENIOR_TRANSPORTATION', 'COMPANION'],
  },
  {
    id: 'post-103',
    kind: 'CAREGIVER',
    authorId: '77777777-7777-7777-7777-777777777777', // Sofia Lima
    createdAt: '2026-05-04T09:45:00.000Z',
    status: 'OPEN',
    location: { distrito: 'Braga', concelho: 'Braga', freguesia: 'Braga (São Vicente)' },
    priceRange: { minCents: 950, maxCents: 1300, currency: 'EUR', unit: 'PER_HOUR' },
    duration: { amount: 4, unit: 'MONTH' },
    earliestStartDate: '2026-05-25',
    weeklyAvailability: {
      MON: [{ startTime: '14:00', endTime: '20:00' }],
      TUE: [{ startTime: '14:00', endTime: '20:00' }],
      WED: [{ startTime: '14:00', endTime: '20:00' }],
      THU: [{ startTime: '14:00', endTime: '20:00' }],
      FRI: [{ startTime: '14:00', endTime: '18:00' }],
      SAT: [{ startTime: '10:00', endTime: '14:00' }],
    },
    offeredQualifications: ['PERSONAL_HYGIENE', 'POST_SURGERY', 'COMPANION', 'HOUSE_CLEANING', 'ASSISTED_LIVING'],
  },
  {
    id: 'post-104',
    kind: 'CAREGIVER',
    authorId: '88888888-8888-8888-8888-888888888888', // António Ferreira
    createdAt: '2026-05-06T15:30:00.000Z',
    status: 'OPEN',
    location: { distrito: 'Coimbra', concelho: 'Coimbra', freguesia: 'Santo António dos Olivais' },
    priceRange: { minCents: 1100, maxCents: 1500, currency: 'EUR', unit: 'PER_HOUR' },
    duration: { amount: 12, unit: 'MONTH' },
    earliestStartDate: '2026-06-01',
    weeklyAvailability: {
      MON: [{ startTime: '09:00', endTime: '17:00' }],
      TUE: [{ startTime: '09:00', endTime: '17:00' }],
      WED: [{ startTime: '09:00', endTime: '17:00' }],
      THU: [{ startTime: '09:00', endTime: '17:00' }],
      FRI: [{ startTime: '09:00', endTime: '17:00' }],
      SAT: [{ startTime: '10:00', endTime: '16:00' }],
      SUN: [{ startTime: '10:00', endTime: '16:00' }],
    },
    offeredQualifications: ['SENIOR_TRANSPORTATION', 'COMPANION', 'ASSISTED_LIVING', 'HOUSE_CLEANING'],
  },
  {
    id: 'post-105',
    kind: 'CAREGIVER',
    authorId: '33333333-3333-3333-3333-333333333333', // Ana Pereira
    createdAt: '2026-05-09T10:10:00.000Z',
    status: 'OPEN',
    location: { distrito: 'Lisboa', concelho: 'Cascais', freguesia: 'Cascais e Estoril' },
    priceRange: { minCents: 1400, maxCents: 2000, currency: 'EUR', unit: 'PER_HOUR' },
    duration: { amount: 2, unit: 'MONTH' },
    earliestStartDate: '2026-06-10',
    weeklyAvailability: {
      WED: [{ startTime: '09:00', endTime: '13:00' }],
      THU: [{ startTime: '09:00', endTime: '13:00' }],
      FRI: [{ startTime: '09:00', endTime: '13:00' }],
    },
    offeredQualifications: ['DEMENTIA_CARE', 'COMPANION'],
  },
  {
    id: 'post-106',
    kind: 'CAREGIVER',
    authorId: '44444444-4444-4444-4444-444444444444', // João Costa
    createdAt: '2026-05-11T13:00:00.000Z',
    status: 'OPEN',
    location: { distrito: 'Faro', concelho: 'Loulé', freguesia: 'Quarteira' },
    priceRange: { minCents: 900, maxCents: 1200, currency: 'EUR', unit: 'PER_HOUR' },
    duration: { amount: 1, unit: 'MONTH' },
    earliestStartDate: '2026-06-01',
    weeklyAvailability: {
      MON: [{ startTime: '09:00', endTime: '12:00' }],
      TUE: [{ startTime: '09:00', endTime: '12:00' }],
      WED: [{ startTime: '09:00', endTime: '12:00' }],
      THU: [{ startTime: '09:00', endTime: '12:00' }],
      FRI: [{ startTime: '09:00', endTime: '12:00' }],
    },
    offeredQualifications: ['SENIOR_TRANSPORTATION'],
  },
]
