package com.eldercare.eldercare.component;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class AuthComponentTest extends AbstractComponentTest {

    private String registerPayload(String email) {
        return """
                {
                  "name": "Ada Lovelace",
                  "email": "%s",
                  "password": "s3cret-pw",
                  "role": "CARE_SEEKER"
                }
                """.formatted(email);
    }

    private String register(String email) throws Exception {
        var result = mvc.post().uri("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(registerPayload(email))
                .exchange();
        assertThat(result).hasStatus(HttpStatus.CREATED);
        return result.getResponse().getContentAsString();
    }

    @Test
    void register_returnsCreatedWithTokenAndUser() throws Exception {
        String email = "ada-" + UUID.randomUUID() + "@example.com";

        String body = register(email);

        assertThat(JsonPath.<String>read(body, "$.token")).isNotBlank();
        assertThat(JsonPath.<String>read(body, "$.user.email")).isEqualTo(email);
    }

    @Test
    void register_withDuplicateEmail_returnsConflict() throws Exception {
        String email = "dup-" + UUID.randomUUID() + "@example.com";
        register(email);

        var second = mvc.post().uri("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(registerPayload(email))
                .exchange();

        assertThat(second).hasStatus(HttpStatus.CONFLICT);
    }

    @Test
    void protectedEndpoint_withoutToken_isRejected() {
        var result = mvc.get().uri("/api/users").exchange();

        assertThat(result).hasStatus(HttpStatus.FORBIDDEN);
    }

    @Test
    void protectedEndpoint_withTokenFromRegister_returnsOk() throws Exception {
        String email = "auth-" + UUID.randomUUID() + "@example.com";
        String token = JsonPath.read(register(email), "$.token");

        var result = mvc.get().uri("/api/users")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .exchange();

        assertThat(result).hasStatusOk();
    }
}
