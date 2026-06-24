package com.eldercare.eldercare.service;

import com.eldercare.eldercare.dto.ConversationSummaryDto;
import com.eldercare.eldercare.dto.MessageDto;
import com.eldercare.eldercare.dto.UserDto;
import com.eldercare.eldercare.exception.ConversationNotFoundException;
import com.eldercare.eldercare.model.Conversation;
import com.eldercare.eldercare.model.Message;
import com.eldercare.eldercare.model.User;
import com.eldercare.eldercare.repository.ConversationRepository;
import com.eldercare.eldercare.repository.MessageRepository;
import com.eldercare.eldercare.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ConversationRepository conversationRepository;
    private final MessageRepository messageRepository;
    private final UserRepository userRepository;

    @Transactional
    public ConversationSummaryDto openConversation(UUID requesterId, UUID otherUserId) {
        return conversationRepository.findBetween(requesterId, otherUserId)
                .map(c -> toSummary(c, requesterId))
                .orElseGet(() -> {
                    User a = userRepository.getReferenceById(requesterId);
                    User b = userRepository.getReferenceById(otherUserId);
                    Conversation c = new Conversation();
                    c.setParticipantA(a);
                    c.setParticipantB(b);
                    return toSummary(conversationRepository.save(c), requesterId);
                });
    }

    @Transactional(readOnly = true)
    public List<ConversationSummaryDto> findMyConversations(UUID userId) {
        return conversationRepository.findAllByParticipant(userId).stream()
                .map(c -> toSummary(c, userId))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<MessageDto> findMessages(UUID conversationId, UUID requesterId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ConversationNotFoundException(conversationId));
        assertParticipant(conversation, requesterId);
        return messageRepository.findByConversationIdOrderBySentAtAsc(conversationId).stream()
                .map(this::toMessageDto)
                .toList();
    }

    @Transactional
    public MessageDto sendMessage(UUID conversationId, UUID senderId, String body) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ConversationNotFoundException(conversationId));
        assertParticipant(conversation, senderId);
        Message message = new Message();
        message.setConversation(conversation);
        message.setSender(userRepository.getReferenceById(senderId));
        message.setBody(body);
        return toMessageDto(messageRepository.save(message));
    }

    @Transactional
    public MessageDto markAsRead(UUID conversationId, UUID messageId, UUID requesterId) {
        Conversation conversation = conversationRepository.findById(conversationId)
                .orElseThrow(() -> new ConversationNotFoundException(conversationId));
        assertParticipant(conversation, requesterId);
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new IllegalArgumentException("Message not found: " + messageId));
        if (message.getReadAt() == null && !message.getSender().getId().equals(requesterId)) {
            message.setReadAt(Instant.now());
            message = messageRepository.save(message);
        }
        return toMessageDto(message);
    }

    private void assertParticipant(Conversation c, UUID userId) {
        boolean isParticipant = c.getParticipantA().getId().equals(userId)
                || c.getParticipantB().getId().equals(userId);
        if (!isParticipant) {
            throw new AccessDeniedException("Not a participant of this conversation");
        }
    }

    private ConversationSummaryDto toSummary(Conversation c, UUID requesterId) {
        User other = c.getParticipantA().getId().equals(requesterId)
                ? c.getParticipantB()
                : c.getParticipantA();
        List<Message> msgs = messageRepository.findByConversationIdOrderBySentAtAsc(c.getId());
        MessageDto lastMessage = msgs.isEmpty() ? null : toMessageDto(msgs.get(msgs.size() - 1));
        int unreadCount = (int) msgs.stream()
                .filter(m -> !m.getSender().getId().equals(requesterId) && m.getReadAt() == null)
                .count();
        return new ConversationSummaryDto(c.getId(), toUserDto(other), lastMessage, unreadCount, c.getCreatedAt());
    }

    private UserDto toUserDto(User u) {
        return new UserDto(u.getId(), u.getEmail(), u.getName(), u.getDescription(),
                u.getPhoto(), u.getPhoneNumber(), u.getUserType(), u.getCreatedAt());
    }

    private MessageDto toMessageDto(Message m) {
        return new MessageDto(m.getId(), m.getConversation().getId(), m.getSender().getId(), m.getBody(), m.getSentAt(), m.getReadAt());
    }
}
