package com.eldercare.eldercare.component;

import com.eldercare.eldercare.service.StorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.assertj.MockMvcTester;
import org.springframework.transaction.annotation.Transactional;

/**
 * Base class for component tests.
 *
 * <p>Boots the full application context against the real Postgres database from
 * {@code compose.yaml} (must be running: {@code docker compose up -d postgres}).
 * External systems are stubbed:
 * <ul>
 *   <li>Kafka listeners are disabled ({@code spring.kafka.listener.auto-startup=false})</li>
 *   <li>The {@code KafkaEmailConsumer} email path is disabled via feature flag</li>
 *   <li>{@link StorageService} (S3) is replaced with a Mockito mock</li>
 * </ul>
 *
 * <p>{@code webEnvironment = MOCK} + {@code @Transactional} means each test's database
 * writes are rolled back afterwards. This does NOT cover work done through {@code @Async}.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
public abstract class AbstractComponentTest {

    @Autowired
    protected MockMvcTester mvc;

    @MockitoBean
    protected StorageService storageService;
}
