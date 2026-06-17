package com.eldercare.eldercare.controller;

import com.eldercare.eldercare.dto.ConversationDto;
import com.eldercare.eldercare.dto.MessageDto;
import com.eldercare.eldercare.dto.SendMessageRequest;
import com.eldercare.eldercare.service.ChatService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/conversations")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @PostMapping
    public ResponseEntity<ConversationDto> open(@RequestParam UUID with, Authentication auth) {
        UUID requesterId = (UUID) auth.getPrincipal();
        return ResponseEntity.status(HttpStatus.CREATED).body(chatService.openConversation(requesterId, with));
    }

    @GetMapping
    public List<ConversationDto> myConversations(Authentication auth) {
        UUID requesterId = (UUID) auth.getPrincipal();
        return chatService.findMyConversations(requesterId);
    }

    @GetMapping("/{id}/messages")
    public List<MessageDto> messages(@PathVariable UUID id, Authentication auth) {
        UUID requesterId = (UUID) auth.getPrincipal();
        return chatService.findMessages(id, requesterId);
    }

    @PostMapping("/{id}/messages")
    public ResponseEntity<MessageDto> send(@PathVariable UUID id,
                                           @Valid @RequestBody SendMessageRequest req,
                                           Authentication auth) {
        UUID requesterId = (UUID) auth.getPrincipal();
        return ResponseEntity.status(HttpStatus.CREATED).body(chatService.sendMessage(id, requesterId, req.body()));
    }

    @PatchMapping("/{id}/messages/{msgId}/read")
    public MessageDto markAsRead(@PathVariable UUID id,
                                 @PathVariable UUID msgId,
                                 Authentication auth) {
        UUID requesterId = (UUID) auth.getPrincipal();
        return chatService.markAsRead(id, msgId, requesterId);
    }
}
