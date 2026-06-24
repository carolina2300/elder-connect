import { authHandlers } from './auth'
import { userHandlers } from './users'
import { postsHandlers } from './posts'
import { messagesHandlers } from './messages'

export const handlers = [...authHandlers, ...userHandlers, ...postsHandlers, ...messagesHandlers]
