import type { Message } from '@/shared/types/domain'

export interface SeedConversation {
  id: string
  participantIds: [string, string]
  createdAt: string
}

export const seedConversations: SeedConversation[] = [
  {
    id: 'conv-0001-0001-0001-000000000001',
    participantIds: ['11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333'],
    createdAt: '2026-05-01T09:00:00.000Z',
  },
  {
    id: 'conv-0002-0002-0002-000000000002',
    participantIds: ['22222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444'],
    createdAt: '2026-05-05T14:00:00.000Z',
  },
  {
    id: 'conv-0003-0003-0003-000000000003',
    participantIds: ['55555555-5555-5555-5555-555555555555', '77777777-7777-7777-7777-777777777777'],
    createdAt: '2026-05-10T11:00:00.000Z',
  },
]

export const seedMessages: Message[] = [
  // Conv 1: Margarida (CARE_SEEKER) ↔ Ana (CARE_GIVER) — 8 msgs, 2 unread for Margarida
  {
    id: 'msg-00000001',
    conversationId: 'conv-0001-0001-0001-000000000001',
    senderId: '33333333-3333-3333-3333-333333333333',
    body: 'Olá Margarida! Vi o seu anúncio e gostaria de me apresentar. Chamo-me Ana e tenho 8 anos de experiência.',
    sentAt: '2026-05-01T09:05:00.000Z',
    readAt: '2026-05-01T09:10:00.000Z',
  },
  {
    id: 'msg-00000002',
    conversationId: 'conv-0001-0001-0001-000000000001',
    senderId: '11111111-1111-1111-1111-111111111111',
    body: 'Olá Ana! Obrigada por entrar em contacto. Fiquei muito contente.',
    sentAt: '2026-05-01T09:15:00.000Z',
    readAt: '2026-05-01T09:20:00.000Z',
  },
  {
    id: 'msg-00000003',
    conversationId: 'conv-0001-0001-0001-000000000001',
    senderId: '33333333-3333-3333-3333-333333333333',
    body: 'Tenho experiência em limpeza doméstica, companhia e cuidados com demência.',
    sentAt: '2026-05-01T09:22:00.000Z',
    readAt: '2026-05-01T09:30:00.000Z',
  },
  {
    id: 'msg-00000004',
    conversationId: 'conv-0001-0001-0001-000000000001',
    senderId: '11111111-1111-1111-1111-111111111111',
    body: 'Que dias está disponível na próxima semana?',
    sentAt: '2026-05-01T09:35:00.000Z',
    readAt: '2026-05-01T09:40:00.000Z',
  },
  {
    id: 'msg-00000005',
    conversationId: 'conv-0001-0001-0001-000000000001',
    senderId: '33333333-3333-3333-3333-333333333333',
    body: 'Estou disponível de segunda a sexta, das 9h às 17h.',
    sentAt: '2026-05-01T09:45:00.000Z',
    readAt: '2026-05-01T09:50:00.000Z',
  },
  {
    id: 'msg-00000006',
    conversationId: 'conv-0001-0001-0001-000000000001',
    senderId: '11111111-1111-1111-1111-111111111111',
    body: 'Ótimo! Pode começar na próxima segunda-feira?',
    sentAt: '2026-05-01T10:00:00.000Z',
    readAt: '2026-05-01T10:05:00.000Z',
  },
  {
    id: 'msg-00000007',
    conversationId: 'conv-0001-0001-0001-000000000001',
    senderId: '33333333-3333-3333-3333-333333333333',
    body: 'Com certeza! Podemos acertar os detalhes finais?',
    sentAt: '2026-05-13T10:10:00.000Z',
    readAt: null,
  },
  {
    id: 'msg-00000008',
    conversationId: 'conv-0001-0001-0001-000000000001',
    senderId: '33333333-3333-3333-3333-333333333333',
    body: 'O valor seria de €12/hora. Está de acordo?',
    sentAt: '2026-05-13T10:12:00.000Z',
    readAt: null,
  },

  // Conv 2: Rui (CARE_SEEKER) ↔ João (CARE_GIVER) — 5 msgs, all read
  {
    id: 'msg-00000009',
    conversationId: 'conv-0002-0002-0002-000000000002',
    senderId: '44444444-4444-4444-4444-444444444444',
    body: 'Boa tarde, Rui! Posso ajudá-lo com transporte e acompanhamento após a cirurgia.',
    sentAt: '2026-05-05T14:05:00.000Z',
    readAt: '2026-05-05T14:10:00.000Z',
  },
  {
    id: 'msg-00000010',
    conversationId: 'conv-0002-0002-0002-000000000002',
    senderId: '22222222-2222-2222-2222-222222222222',
    body: 'Obrigado, João. Estou a recuperar de uma cirurgia à anca e preciso de apoio.',
    sentAt: '2026-05-05T14:20:00.000Z',
    readAt: '2026-05-05T14:25:00.000Z',
  },
  {
    id: 'msg-00000011',
    conversationId: 'conv-0002-0002-0002-000000000002',
    senderId: '44444444-4444-4444-4444-444444444444',
    body: 'Tenho experiência nessa área. Quando gostaria de começar?',
    sentAt: '2026-05-05T14:30:00.000Z',
    readAt: '2026-05-05T14:35:00.000Z',
  },
  {
    id: 'msg-00000012',
    conversationId: 'conv-0002-0002-0002-000000000002',
    senderId: '22222222-2222-2222-2222-222222222222',
    body: 'Idealmente na próxima semana, se for possível.',
    sentAt: '2026-05-05T14:40:00.000Z',
    readAt: '2026-05-05T14:45:00.000Z',
  },
  {
    id: 'msg-00000013',
    conversationId: 'conv-0002-0002-0002-000000000002',
    senderId: '44444444-4444-4444-4444-444444444444',
    body: 'Perfeito, fica combinado! Faço-lhe chegar a minha proposta em breve.',
    sentAt: '2026-05-05T15:00:00.000Z',
    readAt: '2026-05-05T15:10:00.000Z',
  },

  // Conv 3: Carla (CARE_SEEKER) ↔ Sofia (CARE_GIVER) — 3 msgs, 1 unread for Carla
  {
    id: 'msg-00000014',
    conversationId: 'conv-0003-0003-0003-000000000003',
    senderId: '55555555-5555-5555-5555-555555555555',
    body: 'Olá Sofia! Preciso de apoio durante a semana para o meu pai que tem Alzheimer.',
    sentAt: '2026-05-10T11:05:00.000Z',
    readAt: '2026-05-10T11:10:00.000Z',
  },
  {
    id: 'msg-00000015',
    conversationId: 'conv-0003-0003-0003-000000000003',
    senderId: '77777777-7777-7777-7777-777777777777',
    body: 'Olá Carla! Tenho formação específica em demência e já trabalhei com vários utentes.',
    sentAt: '2026-05-10T11:15:00.000Z',
    readAt: '2026-05-10T11:20:00.000Z',
  },
  {
    id: 'msg-00000016',
    conversationId: 'conv-0003-0003-0003-000000000003',
    senderId: '77777777-7777-7777-7777-777777777777',
    body: 'Podemos marcar uma chamada para conhecer melhor as necessidades do seu pai?',
    sentAt: '2026-05-14T16:30:00.000Z',
    readAt: null,
  },
]
