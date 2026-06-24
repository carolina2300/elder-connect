import { useParams, useNavigate } from 'react-router'
import { MessageSquare } from 'lucide-react'
import { useConversations } from '../api/messages'
import { ConversationList } from '../components/ConversationList'
import { ChatThread } from '../components/ChatThread'
import { useSessionStore } from '@/features/auth/session.store'
import { t } from '@/shared/i18n/strings'

export function MessagesPage() {
  const { conversationId } = useParams<{ conversationId?: string }>()
  const { data: conversations, isLoading, isError } = useConversations()
  const currentUser = useSessionStore((s) => s.currentUser)
  const navigate = useNavigate()

  return (
    <div className="mx-auto flex min-h-0 flex-1 flex-col px-4 py-2 max-w-6xl w-full">
      <div className="flex min-h-0 flex-1 overflow-hidden rounded-xl border border-border">
        {/* Left panel */}
        <div
          className={`flex w-full flex-col border-r border-border md:w-80 md:min-w-80 ${
            conversationId ? 'hidden md:flex' : 'flex'
          }`}
        >
          <div className="border-b border-border px-4 py-3">
            <h1 className="text-lg font-semibold">{t.messages.title}</h1>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <ConversationList
              conversations={conversations ?? []}
              isLoading={isLoading}
              isError={isError}
              activeId={conversationId}
              onSelect={(id) => navigate(`/messages/${id}`)}
            />
          </div>
        </div>

        {/* Right panel */}
        <div
          className={`flex min-h-0 min-w-0 flex-1 flex-col ${conversationId ? 'flex' : 'hidden md:flex'}`}
        >
          {conversationId ? (
            <ChatThread
              conversationId={conversationId}
              currentUserId={currentUser?.id ?? ''}
              onBack={() => navigate('/messages')}
            />
          ) : (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 px-8 text-center">
              <MessageSquare className="size-12 text-muted-foreground/40" />
              <p className="text-muted-foreground">{t.messages.selectConversation}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
