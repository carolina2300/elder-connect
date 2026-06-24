package com.eldercare.eldercare.dto;

import java.time.Instant;
import java.util.UUID;

/**
 * Matches the frontend ConversationSummary contract: the other participant
 * resolved relative to the requester, plus last message and unread count.
 */
public record ConversationSummaryDto(
        UUID id,
        UserDto otherUser,
        MessageDto lastMessage,
        int unreadCount,
        Instant createdAt
) {}
