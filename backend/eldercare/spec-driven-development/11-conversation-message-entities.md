# Task 11 — Conversation + Message JPA Entities

## Goal
Map `conversations` and `messages` tables to JPA entities. No endpoints yet.

## Classes to create

### `Conversation` entity
```java
@Entity
@Table(name = "conversations")
public class Conversation {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "participant_a", nullable = false)
    private User participantA;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "participant_b", nullable = false)
    private User participantB;

    @Column(nullable = false)
    private Instant createdAt = Instant.now();

    // helper: returns the other participant
    public User otherParticipant(UUID viewerId) {
        return participantA.getId().equals(viewerId) ? participantB : participantA;
    }

    // helper: does this user participate?
    public boolean hasParticipant(UUID userId) {
        return participantA.getId().equals(userId) || participantB.getId().equals(userId);
    }
}
```

### `Message` entity
```java
@Entity
@Table(name = "messages")
public class Message {
    @Id @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id", nullable = false)
    private Conversation conversation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sender_id", nullable = false)
    private User sender;

    @Column(nullable = false)
    private String body;

    @Column(nullable = false)
    private Instant sentAt = Instant.now();

    private Instant readAt;
}
```

### Repositories
```java
public interface ConversationRepository extends JpaRepository<Conversation, UUID> {

    // Find conversation between two users (order-independent)
    @Query("""
        SELECT c FROM Conversation c
        WHERE (c.participantA.id = :a AND c.participantB.id = :b)
           OR (c.participantA.id = :b AND c.participantB.id = :a)
    """)
    Optional<Conversation> findByParticipants(@Param("a") UUID a, @Param("b") UUID b);

    // All conversations a user is part of
    @Query("""
        SELECT c FROM Conversation c
        WHERE c.participantA.id = :userId OR c.participantB.id = :userId
    """)
    List<Conversation> findAllByParticipant(@Param("userId") UUID userId);
}

public interface MessageRepository extends JpaRepository<Message, UUID> {

    List<Message> findByConversationIdOrderBySentAtAsc(UUID conversationId);

    // Mark unread messages in a conversation as read (from the other user)
    @Modifying
    @Query("""
        UPDATE Message m SET m.readAt = :now
        WHERE m.conversation.id = :conversationId
          AND m.sender.id <> :viewerId
          AND m.readAt IS NULL
    """)
    void markAsRead(
        @Param("conversationId") UUID conversationId,
        @Param("viewerId") UUID viewerId,
        @Param("now") Instant now
    );
}
```

### DTOs

```java
// Matches MSW buildSummary() shape
public record ConversationSummaryDto(
    UUID id,
    UserDto otherUser,
    MessageDto lastMessage,    // nullable
    int unreadCount,
    Instant createdAt
) {}

public record MessageDto(
    UUID id,
    UUID conversationId,
    UUID senderId,
    String body,
    Instant sentAt,
    Instant readAt             // nullable
) {}
```

### `ConversationMapper`
- `toSummary(Conversation conv, UUID viewerId, List<Message> messages)`:
  - `otherUser` = `userMapper.toDto(conv.otherParticipant(viewerId))`
  - `lastMessage` = last message in list (null if empty)
  - `unreadCount` = count of messages where `senderId != viewerId && readAt == null`

## Notes
- `@Modifying` queries require `@Transactional` on the calling service method.
- Load `Conversation.participantA` / `participantB` eagerly when needed, or use `JOIN FETCH` in the repository query to avoid N+1.

## Acceptance Criteria
- App starts with no Hibernate mapping errors.
- `ConversationRepository` and `MessageRepository` are injectable.
