package com.eldercare.eldercare.service;

import com.eldercare.eldercare.dto.ConversationSummaryDto;
import com.eldercare.eldercare.dto.MessageDto;
import com.eldercare.eldercare.exception.ConversationNotFoundException;
import com.eldercare.eldercare.model.Conversation;
import com.eldercare.eldercare.model.Message;
import com.eldercare.eldercare.model.User;
import com.eldercare.eldercare.repository.ConversationRepository;
import com.eldercare.eldercare.repository.MessageRepository;
import com.eldercare.eldercare.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.access.AccessDeniedException;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ChatServiceTest {

    @Mock
    ConversationRepository conversationRepository;

    @Mock
    MessageRepository messageRepository;

    @Mock
    UserRepository userRepository;

    @InjectMocks
    ChatService victim;

    private User userWithId(UUID id) {
        return User.builder().id(id).build();
    }

    private Conversation conversation(UUID id, User a, User b) {
        Conversation c = new Conversation();
        c.setId(id);
        c.setParticipantA(a);
        c.setParticipantB(b);
        return c;
    }

    private Message message(UUID id, Conversation c, User sender, String body, Instant readAt) {
        Message m = new Message();
        m.setId(id);
        m.setConversation(c);
        m.setSender(sender);
        m.setBody(body);
        m.setReadAt(readAt);
        return m;
    }

    @Test
    public void openConversation_whenExists_returnsSummaryWithOtherUser() {
        UUID requesterId = UUID.randomUUID();
        UUID otherId = UUID.randomUUID();
        UUID convId = UUID.randomUUID();
        Conversation existing = conversation(convId, userWithId(requesterId), userWithId(otherId));
        when(conversationRepository.findBetween(requesterId, otherId)).thenReturn(Optional.of(existing));
        when(messageRepository.findByConversationIdOrderBySentAtAsc(convId)).thenReturn(List.of());

        ConversationSummaryDto result = victim.openConversation(requesterId, otherId);

        assertEquals(convId, result.id());
        assertEquals(otherId, result.otherUser().id());
        assertNull(result.lastMessage());
        assertEquals(0, result.unreadCount());
        verify(conversationRepository, never()).save(any());
    }

    @Test
    public void openConversation_whenNotExists_createsAndReturnsSummary() {
        UUID requesterId = UUID.randomUUID();
        UUID otherId = UUID.randomUUID();
        UUID convId = UUID.randomUUID();
        when(conversationRepository.findBetween(requesterId, otherId)).thenReturn(Optional.empty());
        when(userRepository.getReferenceById(requesterId)).thenReturn(userWithId(requesterId));
        when(userRepository.getReferenceById(otherId)).thenReturn(userWithId(otherId));
        when(conversationRepository.save(any(Conversation.class))).thenAnswer(invocation -> {
            Conversation c = invocation.getArgument(0);
            c.setId(convId);
            return c;
        });
        when(messageRepository.findByConversationIdOrderBySentAtAsc(convId)).thenReturn(List.of());

        ConversationSummaryDto result = victim.openConversation(requesterId, otherId);

        assertEquals(convId, result.id());
        assertEquals(otherId, result.otherUser().id());
        verify(conversationRepository).save(any(Conversation.class));
    }

    @Test
    public void findMyConversations_returnsSummariesWithUnreadCount() {
        UUID userId = UUID.randomUUID();
        UUID otherId = UUID.randomUUID();
        UUID convId = UUID.randomUUID();
        Conversation c = conversation(convId, userWithId(userId), userWithId(otherId));
        when(conversationRepository.findAllByParticipant(userId)).thenReturn(List.of(c));
        Message unread = message(UUID.randomUUID(), c, userWithId(otherId), "hi", null);
        Message read = message(UUID.randomUUID(), c, userWithId(otherId), "yo", Instant.now());
        when(messageRepository.findByConversationIdOrderBySentAtAsc(convId)).thenReturn(List.of(unread, read));

        List<ConversationSummaryDto> result = victim.findMyConversations(userId);

        assertEquals(1, result.size());
        assertEquals(otherId, result.get(0).otherUser().id());
        assertEquals(1, result.get(0).unreadCount());
        assertEquals("yo", result.get(0).lastMessage().body());
    }

    @Test
    public void findMessages_whenConversationMissing_throws() {
        UUID convId = UUID.randomUUID();
        when(conversationRepository.findById(convId)).thenReturn(Optional.empty());

        assertThrows(ConversationNotFoundException.class,
                () -> victim.findMessages(convId, UUID.randomUUID()));
    }

    @Test
    public void findMessages_whenNotParticipant_throws() {
        UUID convId = UUID.randomUUID();
        Conversation c = conversation(convId, userWithId(UUID.randomUUID()), userWithId(UUID.randomUUID()));
        when(conversationRepository.findById(convId)).thenReturn(Optional.of(c));

        assertThrows(AccessDeniedException.class,
                () -> victim.findMessages(convId, UUID.randomUUID()));
    }

    @Test
    public void findMessages_whenParticipant_returnsMessages() {
        UUID convId = UUID.randomUUID();
        UUID requesterId = UUID.randomUUID();
        Conversation c = conversation(convId, userWithId(requesterId), userWithId(UUID.randomUUID()));
        when(conversationRepository.findById(convId)).thenReturn(Optional.of(c));
        Message m = message(UUID.randomUUID(), c, userWithId(requesterId), "hello", null);
        when(messageRepository.findByConversationIdOrderBySentAtAsc(convId)).thenReturn(List.of(m));

        List<MessageDto> result = victim.findMessages(convId, requesterId);

        assertEquals(1, result.size());
        assertEquals("hello", result.get(0).body());
    }

    @Test
    public void sendMessage_savesAndReturnsDto() {
        UUID convId = UUID.randomUUID();
        UUID senderId = UUID.randomUUID();
        Conversation c = conversation(convId, userWithId(senderId), userWithId(UUID.randomUUID()));
        when(conversationRepository.findById(convId)).thenReturn(Optional.of(c));
        when(userRepository.getReferenceById(senderId)).thenReturn(userWithId(senderId));
        when(messageRepository.save(any(Message.class))).thenAnswer(invocation -> {
            Message m = invocation.getArgument(0);
            m.setId(UUID.randomUUID());
            return m;
        });

        MessageDto result = victim.sendMessage(convId, senderId, "new message");

        ArgumentCaptor<Message> captor = ArgumentCaptor.forClass(Message.class);
        verify(messageRepository).save(captor.capture());
        assertEquals("new message", captor.getValue().getBody());
        assertEquals(senderId, result.senderId());
        assertEquals("new message", result.body());
    }

    @Test
    public void sendMessage_whenNotParticipant_throws() {
        UUID convId = UUID.randomUUID();
        Conversation c = conversation(convId, userWithId(UUID.randomUUID()), userWithId(UUID.randomUUID()));
        when(conversationRepository.findById(convId)).thenReturn(Optional.of(c));

        assertThrows(AccessDeniedException.class,
                () -> victim.sendMessage(convId, UUID.randomUUID(), "x"));
        verify(messageRepository, never()).save(any());
    }

    @Test
    public void markAsRead_whenUnreadFromOther_setsReadAt() {
        UUID convId = UUID.randomUUID();
        UUID requesterId = UUID.randomUUID();
        UUID senderId = UUID.randomUUID();
        UUID msgId = UUID.randomUUID();
        Conversation c = conversation(convId, userWithId(requesterId), userWithId(senderId));
        when(conversationRepository.findById(convId)).thenReturn(Optional.of(c));
        Message m = message(msgId, c, userWithId(senderId), "ping", null);
        when(messageRepository.findById(msgId)).thenReturn(Optional.of(m));
        when(messageRepository.save(any(Message.class))).thenAnswer(invocation -> invocation.getArgument(0));

        MessageDto result = victim.markAsRead(convId, msgId, requesterId);

        assertNotNull(result.readAt());
        verify(messageRepository).save(any(Message.class));
    }

    @Test
    public void markAsRead_whenOwnMessage_doesNotMark() {
        UUID convId = UUID.randomUUID();
        UUID requesterId = UUID.randomUUID();
        UUID msgId = UUID.randomUUID();
        Conversation c = conversation(convId, userWithId(requesterId), userWithId(UUID.randomUUID()));
        when(conversationRepository.findById(convId)).thenReturn(Optional.of(c));
        Message m = message(msgId, c, userWithId(requesterId), "mine", null);
        when(messageRepository.findById(msgId)).thenReturn(Optional.of(m));

        MessageDto result = victim.markAsRead(convId, msgId, requesterId);

        assertNull(result.readAt());
        verify(messageRepository, never()).save(any());
    }

    @Test
    public void markAsRead_whenMessageMissing_throws() {
        UUID convId = UUID.randomUUID();
        UUID requesterId = UUID.randomUUID();
        UUID msgId = UUID.randomUUID();
        Conversation c = conversation(convId, userWithId(requesterId), userWithId(UUID.randomUUID()));
        when(conversationRepository.findById(convId)).thenReturn(Optional.of(c));
        when(messageRepository.findById(msgId)).thenReturn(Optional.empty());

        assertThrows(IllegalArgumentException.class,
                () -> victim.markAsRead(convId, msgId, requesterId));
    }
}
