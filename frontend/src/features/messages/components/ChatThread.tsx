import { useEffect, useLayoutEffect, useRef, useCallback, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Skeleton } from '@/shared/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar'
import { useMessages, useMarkRead, useConversations } from '../api/messages'
import { MessageBubble } from './MessageBubble'
import { MessageInput } from './MessageInput'
import { t } from '@/shared/i18n/strings'

const PAGE_SIZE = 20

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

interface Props {
  conversationId: string
  currentUserId: string
  onBack: () => void
}

export function ChatThread({ conversationId, currentUserId, onBack }: Props) {
  const { data: allMsgs, isLoading, isError } = useMessages(conversationId)
  const { data: conversations } = useConversations()
  const markRead = useMarkRead(conversationId)
  const bottomRef = useRef<HTMLDivElement>(null)
  const scrollRef = useRef<HTMLDivElement>(null)
  const prevTotalRef = useRef(0)
  const initialScrollDone = useRef(false)
  // saved before displayCount increases so we can restore scroll position
  const scrollAnchor = useRef<{ scrollHeight: number; scrollTop: number } | null>(null)
  const [displayCount, setDisplayCount] = useState(PAGE_SIZE)

  const conv = conversations?.find((c) => c.id === conversationId)
  const total = allMsgs?.length ?? 0
  const hasMore = total > displayCount
  const displayedMsgs = allMsgs ? allMsgs.slice(-displayCount) : []

  const isNearBottom = useCallback(() => {
    const el = scrollRef.current
    if (!el) return true
    return el.scrollHeight - el.scrollTop - el.clientHeight < 120
  }, [])

  // Reset when conversation changes
  useEffect(() => {
    markRead.mutate()
    initialScrollDone.current = false
    prevTotalRef.current = 0
    setDisplayCount(PAGE_SIZE)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId])

  // Scroll to bottom on first load; scroll on new messages if near bottom
  useEffect(() => {
    if (!allMsgs) return
    if (!initialScrollDone.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'instant' })
      initialScrollDone.current = true
    } else if (total > prevTotalRef.current && isNearBottom()) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
    prevTotalRef.current = total
  }, [allMsgs, total, isNearBottom])

  // After displayCount grows, restore scroll so content doesn't jump
  useLayoutEffect(() => {
    const el = scrollRef.current
    const anchor = scrollAnchor.current
    if (!el || !anchor) return
    el.scrollTop = el.scrollHeight - anchor.scrollHeight + anchor.scrollTop
    scrollAnchor.current = null
  }, [displayCount])

  // Load older messages when user scrolls near the top
  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const handleScroll = () => {
      if (el.scrollTop < 60 && allMsgs && displayCount < allMsgs.length) {
        scrollAnchor.current = { scrollHeight: el.scrollHeight, scrollTop: el.scrollTop }
        setDisplayCount((c) => c + PAGE_SIZE)
      }
    }
    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [allMsgs, displayCount])

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <Button variant="ghost" size="icon" className="shrink-0 md:hidden" onClick={onBack}>
          <ArrowLeft className="size-4" />
          <span className="sr-only">{t.messages.backToList}</span>
        </Button>
        {conv ? (
          <>
            <Avatar className="size-8 shrink-0">
              {conv.otherUser.photo ? (
                <AvatarImage src={conv.otherUser.photo} alt={conv.otherUser.name} />
              ) : null}
              <AvatarFallback className="text-xs">{initials(conv.otherUser.name)}</AvatarFallback>
            </Avatar>
            <p className="text-sm font-semibold leading-tight">{conv.otherUser.name}</p>
          </>
        ) : (
          <Skeleton className="h-5 w-32" />
        )}
      </div>

      <div ref={scrollRef} className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={`flex ${i % 2 === 0 ? '' : 'justify-end'}`}>
                <Skeleton className="h-10 w-48 rounded-2xl" />
              </div>
            ))}
          </div>
        ) : isError ? (
          <p className="mt-8 text-center text-sm text-destructive">{t.messages.errorMessages}</p>
        ) : !allMsgs || allMsgs.length === 0 ? (
          <p className="mt-8 text-center text-sm text-muted-foreground">{t.messages.noMessages}</p>
        ) : (
          <>
            {hasMore && (
              <p className="py-2 text-center text-xs text-muted-foreground">
                {t.messages.scrollForOlder}
              </p>
            )}
            {displayedMsgs.map((msg) => (
              <MessageBubble key={msg.id} message={msg} isMine={msg.senderId === currentUserId} />
            ))}
          </>
        )}
        <div ref={bottomRef} />
      </div>

      <MessageInput conversationId={conversationId} />
    </div>
  )
}
