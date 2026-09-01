package com.eldercare.eldercare.component;

import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;

class PostComponentTest extends AbstractComponentTest {

    private String registerUserPayload() {
        return """
                {
                  "name": "Ada Lovelace",
                  "email": "ada-%s@email.com",
                  "password": "s3cret-pw",
                  "role": "CARE_SEEKER"
                }
                """.formatted(UUID.randomUUID());
    }

    private String registerAndGetToken() throws Exception {
        var result = mvc.post().uri("/api/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(registerUserPayload())
                .exchange();
        assertThat(result).hasStatus(HttpStatus.CREATED);
        return JsonPath.read(result.getResponse().getContentAsString(), "$.token");
    }

    private String createPostPayload(String description) {
        return createPostPayload(description, "Lisboa", 800, 1200);
    }

    private String createPostPayload(String description, String distrito, int minCents, int maxCents) {
        return """
            {
              "kind": "CARETAKER",
              "description": "%s",
              "location": {
                "distrito": "%s",
                "concelho": "Lisboa",
                "freguesia": "Arroios",
                "postalCode": "1000-001"
              },
              "priceRange": {
                "minCents": %d,
                "maxCents": %d,
                "unit": "PER_HOUR"
              },
              "duration": {
                "amount": 3,
                "unit": "MONTH"
              },
              "startDate": "2026-10-01",
              "endDate": "2026-12-31",
              "dailyStartTime": "09:00:00",
              "dailyEndTime": "17:00:00",
              "requiredQualifications": ["COMPANION", "PERSONAL_HYGIENE"]
            }
            """.formatted(description, distrito, minCents, maxCents);
    }

    private String createPost(String token, String payload) throws Exception {
        var result = mvc.post().uri("/api/posts")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .contentType(MediaType.APPLICATION_JSON)
                .content(payload)
                .exchange();

        assertThat(result).hasStatus(HttpStatus.CREATED);
        return result.getResponse().getContentAsString();
    }

    private String search(String token, String queryString) throws Exception {
        var result = mvc.get().uri("/api/posts?" + queryString)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .exchange();

        assertThat(result).hasStatusOk();
        return result.getResponse().getContentAsString();
    }

    // --- tests ---------------------------------------------------------

    @Test
    void create_returnsCreatedWithId() throws Exception {
        String token = registerAndGetToken();
        String post = createPost(token, createPostPayload("description"));

        assertThat(JsonPath.<String>read(post, "$.id")).isNotBlank();

    }

    @Test
    void findById_afterCreate_returnsPost() throws Exception {
        String token = registerAndGetToken();
        String post = createPost(token, createPostPayload("description"));
        String id = JsonPath.read(post, "$.id");

        var result = mvc.get().uri("/api/posts/%s".formatted(id))
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .exchange()
                .getResponse()
                .getContentAsString();

        assertThat(JsonPath.<String>read(result, "$.id")).isEqualTo(id);
        assertThat(JsonPath.<String>read(result, "$.description")).isEqualTo("description");
        assertThat(JsonPath.<String>read(result, "$.kind")).isEqualTo("CARETAKER");
        assertThat(JsonPath.<String>read(result, "$.startDate")).isEqualTo("2026-10-01");


    }

    @Test
    void findById_unknownId_returnsNotFound() throws Exception{
        String token = registerAndGetToken();

        createPost(token, createPostPayload("to delete"));

        var result = mvc.get().uri("/api/posts/%s".formatted(UUID.randomUUID()))
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .exchange();

        assertThat(result).hasStatus(HttpStatus.NOT_FOUND);


    }

    @Test
    void delete_byOwner_returnsNoContentAndPostGone() throws Exception {
        String token = registerAndGetToken();
        String post = createPost(token, createPostPayload("to delete"));
        String postId = JsonPath.read(post, "$.id");

        var resultDelete = mvc.delete().uri("/api/posts/%s".formatted(postId))
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .exchange();

        var resultGet = mvc.get().uri("/api/posts/%s".formatted(postId))
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                .exchange();


        assertThat(resultDelete).hasStatus(HttpStatus.NO_CONTENT);
        assertThat(resultGet).hasStatus(HttpStatus.NOT_FOUND);


    }

    @Test
    void delete_byNonOwner_returnsForbidden() throws Exception {
        String token = registerAndGetToken();
        String post = createPost(token, createPostPayload("to delete"));
        String postId = JsonPath.read(post, "$.id");

        String tokenUser2 = registerAndGetToken();

        var resultDelete = mvc.delete().uri("/api/posts/%s".formatted(postId))
                .header(HttpHeaders.AUTHORIZATION, "Bearer "+ tokenUser2)
                .exchange();

        assertThat(resultDelete).hasStatus(HttpStatus.FORBIDDEN);
    }

    // --- search ----------------------------------------------------------

    @Test
    void search_filtersByDistrito_returnsOnlyMatchingPosts() throws Exception {
        String tokenUser = registerAndGetToken();
        String postTest = createPostPayload("description-test", "Test", 100, 200);
        String postPorto = createPostPayload("description-porto", "Porto", 100, 200);
        createPost(tokenUser, postTest);
        createPost(tokenUser, postPorto);
        // Search with distrito=Lisboa, assert $.content is size 1 and its
        String searchResult = search(tokenUser, "distrito=Test");

        assertThat(JsonPath.<Integer>read(searchResult, "$.totalElements")).isEqualTo(1);
        // location.distrito is "Lisboa" (the Porto post must not appear).

        assertThat(JsonPath.<java.util.List<?>>read(searchResult, "$.content[?(@.description=='description-test')]")).hasSize(1);
        assertThat(JsonPath.<java.util.List<?>>read(searchResult, "$.content[?(@.description=='description-porto')]")).isEmpty();
    }

    @Test
    void search_filtersByPriceRange_returnsOnlyOverlappingPosts() throws Exception {
        String tokenUser = registerAndGetToken();
        String post1 = createPostPayload("description-post1", "Test1", 800, 1200);
        String post2 = createPostPayload("description-post2", "Test2", 5000, 6000);
        createPost(tokenUser, post1);
        createPost(tokenUser, post2);

        // Search with priceMinCents/priceMaxCents overlapping only the first,
        String searchResult = search(tokenUser, "priceMinCents=0&priceMaxCents=2000");

        // assert $.content has just that post.
        assertThat(JsonPath.<java.util.List<?>>read(searchResult, "$.content[?(@.description=='description-post1')]")).hasSize(1);
        assertThat(JsonPath.<java.util.List<?>>read(searchResult, "$.content[?(@.description=='description-post2')]")).isEmpty();
        assertThat(JsonPath.<Integer>read(searchResult, "$.content[0].priceRange.minCents")).isGreaterThan(0);
        assertThat(JsonPath.<Integer>read(searchResult, "$.content[0].priceRange.maxCents")).isLessThan(2000);


    }

    @Test
    void search_respectsPageAndSize() throws Exception {
        String tokenUser = registerAndGetToken();
        String distrito = "distrito" + UUID.randomUUID();
        String post1 = createPostPayload("description-post1", distrito, 800, 1200);
        String post2 = createPostPayload("description-post2", distrito, 5000, 6000);
        String post3 = createPostPayload("description-post3", distrito, 5000, 6000);
        createPost(tokenUser, post1);
        createPost(tokenUser, post2);
        createPost(tokenUser, post3);

        // has 2 items, $.totalElements is 3, $.totalPages is 2.
        // Then search page=1&size=2, assert $.content has 1 item.
        String searchPage0 = search(tokenUser, "distrito="+distrito+"&page=0&size=2");
        assertThat(JsonPath.<Integer>read(searchPage0, "$.totalElements")).isEqualTo(3);
        assertThat(JsonPath.<Integer>read(searchPage0, "$.content.length()")).isEqualTo(2);
        assertThat(JsonPath.<Integer>read(searchPage0, "$.totalPages")).isEqualTo(2);

        String searchPage1 = search(tokenUser, "distrito="+distrito+"&page=1&size=2");
        assertThat(JsonPath.<Integer>read(searchPage1, "$.content.length()")).isEqualTo(1);
        assertThat(JsonPath.<Integer>read(searchPage1, "$.totalElements")).isEqualTo(3);
        assertThat(JsonPath.<Integer>read(searchPage1, "$.totalPages")).isEqualTo(2);


    }

    @Test
    void search_sortPriceAsc_ordersByMinPriceAscending() throws Exception {
        String tokenUser = registerAndGetToken();
        String distrito = "distrito" + UUID.randomUUID();
        String post1 = createPostPayload("description-post1", distrito, 5000, 6000);
        String post2 = createPostPayload("description-post2", distrito, 800, 1200);
        String post3 = createPostPayload("description-post3", distrito, 1200, 3000);

        createPost(tokenUser, post1);
        createPost(tokenUser, post2);
        createPost(tokenUser, post3);

        String body = search(tokenUser, "distrito="+distrito+"&sort=price_asc");
        assertThat(JsonPath.<Integer>read(body, "$.content.length()")).isEqualTo(3);
        assertThat(JsonPath.<Integer>read(body, "$.content[0].priceRange.minCents")).isEqualTo(800);
        assertThat(JsonPath.<Integer>read(body, "$.content[1].priceRange.minCents")).isEqualTo(1200);
        assertThat(JsonPath.<Integer>read(body, "$.content[2].priceRange.minCents")).isEqualTo(5000);
    }
}
