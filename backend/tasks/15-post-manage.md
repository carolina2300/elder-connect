# Task 15 — Post Management (Close / Reopen / Delete)

## Goal
Let post authors manage their own posts from `/me/posts` (ROADMAP item 7).

## Endpoints

### PATCH /api/v1/posts/:id/status
Toggle post between `OPEN` and `CLOSED`.

Request body:
```json
{ "status": "CLOSED" }
```

Response `200`: updated `PostDto`

Rules:
- Auth required.
- `404` if post not found.
- `403` if authenticated user is not the post author.
- `status` must be `OPEN` or `CLOSED`.

### DELETE /api/v1/posts/:id
Permanently delete a post (and its child records via CASCADE).

Response `204 No Content`

Rules:
- Auth required.
- `404` if post not found.
- `403` if authenticated user is not the post author.

### GET /api/v1/users/me/posts
Return all posts authored by the authenticated user (any status).

Response `200`: `PageResponse<PostDto>`
Query params: `page`, `size`, `status` (optional filter: OPEN | CLOSED | all).

## Classes to create

### `UpdatePostStatusRequest`
```java
public record UpdatePostStatusRequest(@NotNull PostStatus status) {}
```

### `PostService` additions
```java
public PostDto updateStatus(UUID postId, UUID requesterId, PostStatus newStatus) {
    Post post = postRepository.findById(postId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Publicação não encontrada"));
    assertAuthor(post, requesterId);
    post.setStatus(newStatus);
    return postMapper.toDto(postRepository.save(post));
}

public void delete(UUID postId, UUID requesterId) {
    Post post = postRepository.findById(postId)
        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Publicação não encontrada"));
    assertAuthor(post, requesterId);
    postRepository.delete(post);
}

public PageResponse<PostDto> listMyPosts(UUID authorId, PostStatus statusFilter, int page, int size) {
    // Specification: author = authorId, optionally filter by status
}

private void assertAuthor(Post post, UUID userId) {
    if (!post.getAuthor().getId().equals(userId)) {
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado");
    }
}
```

### `PostController` additions
```java
@PatchMapping("/{id}/status")   // 200
@DeleteMapping("/{id}")         // 204
```

Add to `UserController` (or a new `MeController`):
```java
@GetMapping("/users/me/posts")  // 200 PageResponse<PostDto>
```

## `PostRepository` addition
```java
Page<Post> findByAuthorId(UUID authorId, Pageable pageable);
// or with optional status filter via Specification
```

## Acceptance Criteria
- Author can `PATCH /posts/:id/status` with `{"status":"CLOSED"}` → 200 with status=CLOSED.
- Author can re-open with `{"status":"OPEN"}`.
- Non-author gets 403.
- `DELETE /posts/:id` by author → 204, subsequent GET → 404.
- `GET /users/me/posts` returns the authenticated user's posts across all statuses.
- `GET /users/me/posts?status=OPEN` returns only open posts.
