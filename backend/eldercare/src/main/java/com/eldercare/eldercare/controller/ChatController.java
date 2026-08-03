package com.eldercare.eldercare.controller;

import com.eldercare.eldercare.dto.ConversationSummaryDto;
import com.eldercare.eldercare.dto.MessageDto;
import com.eldercare.eldercare.dto.SendMessageRequest;
import com.eldercare.eldercare.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/conversations")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping
    public ResponseEntity<ConversationSummaryDto> open(@RequestParam UUID with, Authentication auth) {
        UUID requesterId = (UUID) auth.getPrincipal();
        log.info("Received Request to Open Conversation. Users {} and {}", requesterId, with);
        return ResponseEntity.status(HttpStatus.CREATED).body(chatService.openConversation(requesterId, with));
    }

    @GetMapping
    public List<ConversationSummaryDto> myConversations(Authentication auth) {
        UUID requesterId = (UUID) auth.getPrincipal();
        log.info("Received request to find Conversations of User {}", requesterId);
        return chatService.findMyConversations(requesterId);
    }

    @GetMapping("/{id}/messages")
    public List<MessageDto> messages(@PathVariable UUID id, Authentication auth) {
        UUID requesterId = (UUID) auth.getPrincipal();
        log.info("Received request to find Messages of User {}", requesterId);
        return chatService.findMessages(id, requesterId);
    }

    @PostMapping("/{id}/messages")
    public ResponseEntity<MessageDto> send(@PathVariable UUID id,
                                           @Valid @RequestBody SendMessageRequest req,
                                           Authentication auth) {
        UUID requesterId = (UUID) auth.getPrincipal();
        log.info("Received request to send Message. Conversation {} and Sender {}", id, requesterId);
        return ResponseEntity.status(HttpStatus.CREATED).body(chatService.sendMessage(id, requesterId, req.body()));
    }

    @PatchMapping("/{id}/messages/{msgId}/read")
    public MessageDto markAsRead(@PathVariable UUID id,
                                 @PathVariable UUID msgId,
                                 Authentication auth) {
        UUID requesterId = (UUID) auth.getPrincipal();
        log.info("Received request to mark Message {} as read, of User {}", msgId, requesterId);
        return chatService.markAsRead(id, msgId, requesterId);
    }
}
