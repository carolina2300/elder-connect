package com.eldercare.eldercare.controller;

import com.eldercare.eldercare.dto.ConversationSummaryDto;
import com.eldercare.eldercare.dto.MessageDto;
import com.eldercare.eldercare.dto.SendMessageRequest;
import com.eldercare.eldercare.service.ChatService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ChatControllerTest {

    @Mock
    ChatService chatService;

    @Mock
    Authentication authentication;

    @InjectMocks
    ChatController victim;

    private MessageDto messageDto(UUID convId, UUID senderId) {
        return new MessageDto(UUID.randomUUID(), convId, senderId, "hi", Instant.now(), null);
    }

    @Test
    public void open_returnsCreatedWithRequesterFromAuth() {
        UUID requesterId = UUID.randomUUID();
        UUID withId = UUID.randomUUID();
        UUID convId = UUID.randomUUID();
        ConversationSummaryDto dto = new ConversationSummaryDto(convId, null, null, 0, Instant.now());
        when(authentication.getPrincipal()).thenReturn(requesterId);
        when(chatService.openConversation(requesterId, withId)).thenReturn(dto);

        ResponseEntity<ConversationSummaryDto> result = victim.open(withId, authentication);

        assertEquals(HttpStatus.CREATED, result.getStatusCode());
        assertEquals(dto, result.getBody());
    }

    @Test
    public void myConversations_delegatesWithRequesterId() {
        UUID requesterId = UUID.randomUUID();
        ConversationSummaryDto dto = new ConversationSummaryDto(UUID.randomUUID(), null, null, 0, Instant.now());
        when(authentication.getPrincipal()).thenReturn(requesterId);
        when(chatService.findMyConversations(requesterId)).thenReturn(List.of(dto));

        List<ConversationSummaryDto> result = victim.myConversations(authentication);

        assertEquals(1, result.size());
        assertEquals(dto, result.get(0));
    }

    @Test
    public void messages_delegatesWithRequesterId() {
        UUID requesterId = UUID.randomUUID();
        UUID convId = UUID.randomUUID();
        MessageDto dto = messageDto(convId, requesterId);
        when(authentication.getPrincipal()).thenReturn(requesterId);
        when(chatService.findMessages(convId, requesterId)).thenReturn(List.of(dto));

        List<MessageDto> result = victim.messages(convId, authentication);

        assertEquals(1, result.size());
        assertEquals(dto, result.get(0));
    }

    @Test
    public void send_returnsCreatedWithBodyFromRequest() {
        UUID requesterId = UUID.randomUUID();
        UUID convId = UUID.randomUUID();
        SendMessageRequest req = new SendMessageRequest("hello");
        MessageDto dto = messageDto(convId, requesterId);
        when(authentication.getPrincipal()).thenReturn(requesterId);
        when(chatService.sendMessage(convId, requesterId, "hello")).thenReturn(dto);

        ResponseEntity<MessageDto> result = victim.send(convId, req, authentication);

        assertEquals(HttpStatus.CREATED, result.getStatusCode());
        assertEquals(dto, result.getBody());
    }

    @Test
    public void markAsRead_delegatesWithRequesterId() {
        UUID requesterId = UUID.randomUUID();
        UUID convId = UUID.randomUUID();
        UUID msgId = UUID.randomUUID();
        MessageDto dto = messageDto(convId, requesterId);
        when(authentication.getPrincipal()).thenReturn(requesterId);
        when(chatService.markAsRead(convId, msgId, requesterId)).thenReturn(dto);

        MessageDto result = victim.markAsRead(convId, msgId, authentication);

        assertEquals(dto, result);
    }
}
