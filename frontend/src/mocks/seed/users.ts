import type { Role } from '@/shared/types/domain'

interface SeedUser {
  id: string
  name: string
  email: string
  password: string
  description: string
  photo: string | null
  role: Role
  createdAt: string
}

export const seedUsers: SeedUser[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    name: 'Margarida Sousa',
    email: 'caretaker1@example.com',
    password: 'password123',
    description: 'Professora reformada. Procuro companhia e ajuda semanal na limpeza da casa.',
    photo: '/seed-photos/margarida.png',
    role: 'CARE_SEEKER',
    createdAt: '2026-04-20T10:00:00.000Z',
  },
  {
    id: '22222222-2222-2222-2222-222222222222',
    name: 'Rui Almeida',
    email: 'caretaker2@example.com',
    password: 'password123',
    description: 'Em recuperação de uma cirurgia à anca. Preciso de apoio pós-cirúrgico e transporte.',
    photo: '/seed-photos/rui.svg',
    role: 'CARE_SEEKER',
    createdAt: '2026-04-22T10:00:00.000Z',
  },
  {
    id: '33333333-3333-3333-3333-333333333333',
    name: 'Ana Pereira',
    email: 'caregiver1@example.com',
    password: 'password123',
    description: 'Cuidadora certificada com 8 anos de experiência em demência e apoio domiciliário.',
    photo: '/seed-photos/ana.png',
    role: 'CARE_GIVER',
    createdAt: '2026-03-10T10:00:00.000Z',
  },
  {
    id: '44444444-4444-4444-4444-444444444444',
    name: 'João Costa',
    email: 'caregiver2@example.com',
    password: 'password123',
    description: 'Disponível em dias úteis. Especializado em transporte e acompanhamento de seniores.',
    photo: '/seed-photos/joao.png',
    role: 'CARE_GIVER',
    createdAt: '2026-03-15T10:00:00.000Z',
  },
  {
    id: '55555555-5555-5555-5555-555555555555',
    name: 'Carla Mendes',
    email: 'caretaker3@example.com',
    password: 'password123',
    description: 'Cuido do meu pai com Alzheimer e procuro apoio durante a semana.',
    photo: '/seed-photos/carla.svg',
    role: 'CARE_SEEKER',
    createdAt: '2026-04-28T10:00:00.000Z',
  },
  {
    id: '66666666-6666-6666-6666-666666666666',
    name: 'Pedro Rocha',
    email: 'caretaker4@example.com',
    password: 'password123',
    description: 'Procuro acompanhante para passeios diários e ajuda nas refeições para a minha mãe.',
    photo: '/seed-photos/pedro.svg',
    role: 'CARE_SEEKER',
    createdAt: '2026-05-01T10:00:00.000Z',
  },
  {
    id: '77777777-7777-7777-7777-777777777777',
    name: 'Sofia Lima',
    email: 'caregiver3@example.com',
    password: 'password123',
    description: 'Auxiliar de geriatria com formação em higiene pessoal e cuidados pós-operatórios.',
    photo: '/seed-photos/sofia.svg',
    role: 'CARE_GIVER',
    createdAt: '2026-03-25T10:00:00.000Z',
  },
  {
    id: '88888888-8888-8888-8888-888888888888',
    name: 'António Ferreira',
    email: 'caregiver4@example.com',
    password: 'password123',
    description: 'Cuidador particular, fins-de-semana incluídos. Carta de condução própria.',
    photo: '/seed-photos/antonio.svg',
    role: 'CARE_GIVER',
    createdAt: '2026-04-02T10:00:00.000Z',
  },
]
