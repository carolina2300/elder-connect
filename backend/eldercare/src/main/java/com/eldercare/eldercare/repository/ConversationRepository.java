package com.eldercare.eldercare.repository;

import com.eldercare.eldercare.model.Conversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ConversationRepository extends JpaRepository<Conversation, UUID> {

    @Query("SELECT c FROM Conversation c WHERE c.participantA.id = :userId OR c.participantB.id = :userId")
    List<Conversation> findAllByParticipant(@Param("userId") UUID userId);

    @Query("SELECT c FROM Conversation c WHERE (c.participantA.id = :a AND c.participantB.id = :b) OR (c.participantA.id = :b AND c.participantB.id = :a)")
    Optional<Conversation> findBetween(@Param("a") UUID a, @Param("b") UUID b);
}
