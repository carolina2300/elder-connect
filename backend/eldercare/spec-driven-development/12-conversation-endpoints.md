# Task 12 — Conversation Endpoints

## Goal
`GET /api/v1/conversations` and `POST /api/v1/conversations`.

## Endpoints

### GET /api/v1/conversations
Returns all conversations the authenticated user participates in, sorted by most recent message.

Response `200`: `List<ConversationSummaryDto>`

Logic:
1. Load all conversations where `participantA = userId OR participantB = userId`.
2. For each conversation, load its messages.
3. Map to `ConversationSummaryDto` via `ConversationMapper.toSummary()`.
4. Sort by `lastMessage.sentAt` descending (fall back to `createdAt` if no messages).

### POST /api/v1/conversations
Start a conversation with another user (or return existing one if already exists).

Request body:
```json
{ "participantId": "<uuid>" }
```

Response `201`: `ConversationSummaryDto`

Rules (from MSW):
- `401` if unauthenticated.
- `404` if `participantId` not found.
- `400` if viewer and target have the **same role** (`cannotMessageSameRole`).
- If a conversation already exists between the two users, return existing one (idempotent) with `201`.

## Classes to create

### `StartConversationRequest`
```java
public record StartConversationRequest(@NotNull UUID participantId) {}
```

### `ConversationService` — `pt.eldercare.backend.conversation.ConversationService`
```java
public class ConversationService {

    public List<ConversationSummaryDto> listForUser(UUID userId) {
        // load conversations
        // load messages per conversation (batch or join fetch)
        // map + sort
    }

    @Transactional
    public ConversationSummaryDto startOrGet(UUID viewerId, UUID participantId) {
        User viewer = userRepository.findById(viewerId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED));
        User other = userRepository.findById(participantId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilizador não encontrado"));

        if (viewer.getRole() == other.getRole()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Não pode enviar mensagem a alguém com o mesmo papel");
        }

        Conversation conv = conversationRepository
            .findByParticipants(viewerId, participantId)
            .orElseGet(() -> {
                Conversation c = new Conversation();
                c.setParticipantA(viewer);
                c.setParticipantB(other);
                return conversationRepository.save(c);
            });

        List<Message> msgs = messageRepository.findByConversationIdOrderBySentAtAsc(conv.getId());
        return conversationMapper.toSummary(conv, viewerId, msgs);
    }
}
```

### `ConversationController`
```java
@RestController
@RequestMapping("/api/v1/conversations")
public class ConversationController {
    @GetMapping          // 200
    @PostMapping         // 201
}
```

## Notes
- N+1 risk: loading messages for each conversation in a loop. Mitigate by loading all messages for the user's conversations in one query:
  ```java
  @Query("SELECT m FROM Message m WHERE m.conversation.id IN :ids ORDER BY m.sentAt ASC")
  List<Message> findByConversationIds(@Param("ids") List<UUID> ids);
  ```
  Then group in memory by `conversationId`.

## Acceptance Criteria
- `GET /conversations` returns empty list for new user.
- `POST /conversations` with valid cross-role target returns `201` with summary.
- Repeat `POST /conversations` with same target returns `201` with same conversation id.
- `POST /conversations` with same-role target returns `400`.
- `POST /conversations` with unknown participantId returns `404`.
