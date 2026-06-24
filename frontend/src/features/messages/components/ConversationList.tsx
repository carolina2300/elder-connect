import { MessageSquare } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { cn } from '@/shared/lib/cn'
import { t } from '@/shared/i18n/strings'
import type { ConversationSummary } from '../api/messages'

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function formatTime(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  if (d.toDateString() === now.toDateString()) {
    return d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })
  }
  return d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' })
}

interface Props {
  conversations: ConversationSummary[]
  isLoading: boolean
  isError: boolean
  activeId?: string
  onSelect: (id: string) => void
}

export function ConversationList({ conversations, isLoading, isError, activeId, onSelect }: Props) {
  if (isLoading) {
    return (
      <div className="flex flex-col">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-3">
            <Skeleton className="size-10 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (isError) {
    return <p className="px-4 py-6 text-sm text-destructive">{t.messages.errorConversations}</p>
  }

  if (conversations.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 py-12 text-center">
        <MessageSquare className="size-10 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">{t.messages.noConversations}</p>
        <p className="text-xs text-muted-foreground">{t.messages.noConversationsHint}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col overflow-y-auto">
      {conversations.map((conv) => (
        <button
          key={conv.id}
          type="button"
          onClick={() => onSelect(conv.id)}
          className={cn(
            'flex items-center gap-3 border-b border-border/50 px-4 py-3 text-left transition-colors hover:bg-muted/60',
            activeId === conv.id && 'bg-muted'
          )}
        >
          <div className="relative shrink-0">
            <Avatar className="size-10">
              {conv.otherUser.photo ? (
                <AvatarImage src={conv.otherUser.photo} alt={conv.otherUser.name} />
              ) : null}
              <AvatarFallback className="text-sm">{initials(conv.otherUser.name)}</AvatarFallback>
            </Avatar>
            {conv.unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                {conv.unreadCount}
              </span>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span
                className={cn(
                  'truncate text-sm',
                  conv.unreadCount > 0 ? 'font-semibold' : 'font-medium'
                )}
              >
                {conv.otherUser.name}
              </span>
              {conv.lastMessage && (
                <span className="shrink-0 text-xs text-muted-foreground">
                  {formatTime(conv.lastMessage.sentAt)}
                </span>
              )}
            </div>
            {conv.lastMessage && (
              <p
                className={cn(
                  'mt-0.5 truncate text-xs',
                  conv.unreadCount > 0 ? 'font-medium text-foreground' : 'text-muted-foreground'
                )}
              >
                {conv.lastMessage.body}
              </p>
            )}
          </div>
        </button>
      ))}
    </div>
  )
}
