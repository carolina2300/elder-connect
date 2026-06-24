import { useState } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/shared/components/ui/button'
import { Textarea } from '@/shared/components/ui/textarea'
import { useSendMessage } from '../api/messages'
import { t } from '@/shared/i18n/strings'
import { toast } from 'sonner'

interface Props {
  conversationId: string
}

export function MessageInput({ conversationId }: Props) {
  const [text, setText] = useState('')
  const send = useSendMessage(conversationId)

  function handleSend() {
    const trimmed = text.trim()
    if (!trimmed || send.isPending) return
    setText('')
    send.mutate(trimmed, {
      onError: () => toast.error(t.messages.messageFailed),
    })
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex items-end gap-2 border-t border-border px-4 py-3">
      <Textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={t.messages.typeMessage}
        className="min-h-10 max-h-40 resize-none"
        rows={1}
      />
      <Button
        type="button"
        size="icon"
        onClick={handleSend}
        disabled={!text.trim() || send.isPending}
        aria-label={t.messages.send}
      >
        <Send className="size-4" />
      </Button>
    </div>
  )
}
