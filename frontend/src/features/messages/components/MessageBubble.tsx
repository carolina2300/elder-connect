import { cn } from '@/shared/lib/cn'
import type { Message } from '@/shared/types/domain'

interface Props {
  message: Message
  isMine: boolean
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })
}

export function MessageBubble({ message, isMine }: Props) {
  const isOptimistic = message.id.startsWith('optimistic-')
  return (
    <div className={cn('flex', isMine ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[70%] rounded-2xl px-4 py-2.5 text-sm',
          isMine
            ? 'bg-primary text-primary-foreground rounded-br-sm'
            : 'bg-muted text-foreground rounded-bl-sm',
          isOptimistic && 'opacity-60'
        )}
      >
        <p className="whitespace-pre-wrap break-words">{message.body}</p>
        <p
          className={cn(
            'mt-1 text-right text-[10px]',
            isMine ? 'text-primary-foreground/70' : 'text-muted-foreground'
          )}
        >
          {formatTime(message.sentAt)}
        </p>
      </div>
    </div>
  )
}
