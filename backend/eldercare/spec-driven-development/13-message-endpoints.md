# Task 13 — Message Endpoints

## Goal
Messages within a conversation: list, send, and mark as read.

## Endpoints

### GET /api/v1/conversations/:id/messages
Returns all messages in a conversation ordered by `sentAt ASC`.

Response `200`: `List<MessageDto>`

Rules:
- `401` if unauthenticated.
- `404` if conversation not found.
- `403` if authenticated user is not a participant.

### POST /api/v1/conversations/:id/messages
Send a new message.

Request body:
```json
{ "body": "Olá, estou interessada." }
```

Response `201`: `MessageDto`

Rules:
- `401` / `404` / `403` same as above.
- `400` if `body` is blank or empty.

### PATCH /api/v1/conversations/:id/read
Mark all unread messages in this conversation (sent by the other user) as read.

Response `204 No Content`

Rules:
- `401` / `404` / `403` same as above.
- No-op if all messages already read.

## Classes to create

### `SendMessageRequest`
```java
public record SendMessageRequest(@NotBlank String body) {}
```

### `MessageService` — `pt.eldercare.backend.conversation.MessageService`
```java
public class MessageService {

    public List<MessageDto> listMessages(UUID conversationId, UUID viewerId) {
        Conversation conv = getConversationOrThrow(conversationId);
        assertParticipant(conv, viewerId);
        return messageRepository
            .findByConversationIdOrderBySentAtAsc(conversationId)
            .stream().map(messageMapper::toDto).toList();
    }

    @Transactional
    public MessageDto send(UUID conversationId, UUID senderId, String body) {
        Conversation conv = getConversationOrThrow(conversationId);
        assertParticipant(conv, senderId);

        Message msg = new Message();
        msg.setConversation(conv);
        msg.setSender(userRepository.getReferenceById(senderId));
        msg.setBody(body.trim());
        msg.setSentAt(Instant.now());
        return messageMapper.toDto(messageRepository.save(msg));
    }

    @Transactional
    public void markRead(UUID conversationId, UUID viewerId) {
        Conversation conv = getConversationOrThrow(conversationId);
        assertParticipant(conv, viewerId);
        messageRepository.markAsRead(conversationId, viewerId, Instant.now());
    }

    private Conversation getConversationOrThrow(UUID id) {
        return conversationRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Conversa não encontrada"));
    }

    private void assertParticipant(Conversation conv, UUID userId) {
        if (!conv.hasParticipant(userId)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado");
        }
    }
}
```

### `MessageController` additions to `ConversationController`
```java
@GetMapping("/{id}/messages")          // 200
@PostMapping("/{id}/messages")         // 201
@PatchMapping("/{id}/read")            // 204
```

Or create a dedicated `MessageController` — either is fine.

## Notes
- `@Transactional` on `markRead` required because `@Modifying` query in `MessageRepository`.
- `PATCH /read` is the polling endpoint the frontend hits every 5s on the active thread. Keep it cheap — the indexed query on `(conversation_id, read_at)` makes it fast.
- `MessageDto.conversationId` = `UUID`, `senderId` = `UUID` (not the full user object — matches MSW `Message` type).

## Acceptance Criteria
- `GET /conversations/:id/messages` returns messages in chronological order.
- `POST /conversations/:id/messages` with `{"body":"Olá"}` returns 201 with new MessageDto.
- `POST /conversations/:id/messages` with blank body returns 400.
- `PATCH /conversations/:id/read` returns 204 and subsequent GET shows non-null `readAt` on those messages.
- Non-participant user calling any of the three endpoints gets 403.
