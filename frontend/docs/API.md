# API Reference — Requests by Page

> **Status:** All endpoints currently mocked via MSW (`VITE_MSW=on`).
> Base URL: `/api/v1` (override with `VITE_API_BASE_URL` env var).
> Auth: `Authorization: Bearer {token}` header, managed by `apiFetch()` in `src/shared/lib/api-client.ts`.

---

## Auth Endpoints (all pages)

These fire on every app load and on user action, not tied to a single page.

### `GET /auth/me`

Restores session on app startup. Fires once if a token exists in local storage.

```
Response 200: User
Response 401: clears session, redirects to /login
```

Hook: `useMe()` — `src/features/auth/api/auth.ts`

---

## `/login`

### `POST /auth/login`

```json
Request:  { "email": "string", "password": "string" }
Response: { "user": User, "token": "string" }
```

On success: stores token + user in Zustand session store, redirects to `/search/*`.  
On failure: shows field error from `ProblemDetails` response.

Hook: `useLogin()` — `src/features/auth/api/auth.ts`

---

## `/register`

### `POST /auth/register`

```json
Request: {
  "email": "string",
  "password": "string",
  "name": "string",
  "role": "CARE_TAKER" | "CARE_GIVER",
  "description": "string (optional)",
  "photo": "string | null (optional)"
}
Response: { "user": User, "token": "string" }
```

On success: same as login — stores session, redirects.  
On failure (duplicate email): 409 with `ProblemDetails`.

Hook: `useRegister()` — `src/features/auth/api/auth.ts`

---

## `/me` — My Profile

Reads from Zustand session store (no network call for the profile itself).  
The only request fired here is on edit.

### `PATCH /users/me`

```json
Request:  { "name"?: "string", "description"?: "string", "photo"?: "string | null" }
Response: User
```

Fires when user submits the edit dialog. Updates session store + React Query cache.

Hook: `useUpdateMe()` — `src/features/profile/api/profile.ts`

---

## `/users/:id` — User Profile

### `GET /users/:id`

```
Response 200: User
Response 404: shows not-found state
```

Fires on mount with the `:id` from the URL.

Hook: `useUser(id)` — `src/features/profile/api/profile.ts`

---

## `/posts/:id` — Post Detail

Two requests fire on mount.

### `GET /posts/:id`

```
Response 200: Post (CARETAKER or CAREGIVER variant — see types below)
Response 404: shows not-found state
```

Hook: `usePost(id)` — `src/features/posts/api/posts.ts`

### `GET /users/:authorId`

Fires after the post loads, using `post.authorId`.

```
Response 200: User
```

Hook: `useAuthor(post)` — `src/features/posts/api/posts.ts`

---

## `/search/caretakers` — Caretaker Jobs Search

> Accessible to `CARE_GIVER` role only. Shows `CARETAKER` posts.

### `GET /posts`

Fires on mount and on every filter change. Filters are synced to URL query params.

```
Query Parameters:
  sort             "recent" | "price_asc" | "price_desc"   required
  page             number (1-indexed)                       required
  size             number (default 10, max 50)
  distrito         string
  concelho         string
  freguesia        string
  qualifications   string (comma-separated Qualification values)
  availableOn      string (ISO 8601 date)
  priceMinCents    number
  priceMaxCents    number
  durationMinMonths number
  durationMaxMonths number

Response: {
  "content": Post[],
  "page": number,
  "size": number,
  "totalElements": number,
  "totalPages": number
}
```

Hook: `useListPosts(params)` via `usePostsSearch()` — `src/features/search/hooks/usePostsSearch.ts`

---

## `/search/caregivers` — Caregiver Offers Search

> Accessible to `CARE_TAKER` role only. Shows `CAREGIVER` posts.

Same endpoint and parameters as `/search/caretakers` above.

### `GET /posts`

Identical contract — the backend filters results by the authenticated user's role.

---

## Logout (Navbar — all authenticated pages)

### `POST /auth/logout`

```
Response: 204 No Content
```

Clears session store, invalidates all React Query cache, redirects to `/`.

Hook: `useLogout()` — `src/features/auth/api/auth.ts`

---

## Data Types

### `User`

```ts
{
  id: string
  name: string
  email: string
  role: "CARE_TAKER" | "CARE_GIVER"
  description: string
  photo: string | null
  createdAt: string  // ISO 8601
}
```

### `Post` (CARETAKER variant)

```ts
{
  id: string
  kind: "CARETAKER"
  authorId: string
  createdAt: string
  status: "OPEN" | "CLOSED"
  location: { distrito: string, concelho: string, freguesia: string }
  priceRange: { minCents: number, maxCents: number, currency: "EUR", unit: "PER_HOUR" | "PER_MONTH" }
  duration: { amount: number, unit: "MONTH" | "WEEK" }
  startDate: string
  endDate: string
  dailyTimeWindow: { startTime: string, endTime: string }
  requiredQualifications: Qualification[]
}
```

### `Post` (CAREGIVER variant)

```ts
{
  id: string
  kind: "CAREGIVER"
  authorId: string
  createdAt: string
  status: "OPEN" | "CLOSED"
  location: { distrito: string, concelho: string, freguesia: string }
  priceRange: { minCents: number, maxCents: number, currency: "EUR", unit: "PER_HOUR" }
  duration: { amount: number, unit: "MONTH" | "WEEK" }
  earliestStartDate: string
  weeklyAvailability: { MON?: TimeSlot[], TUE?: TimeSlot[], WED?: TimeSlot[], THU?: TimeSlot[], FRI?: TimeSlot[], SAT?: TimeSlot[], SUN?: TimeSlot[] }
  offeredQualifications: Qualification[]
}
```

### `Qualification` values

```
HOUSE_CLEANING | PERSONAL_HYGIENE | COMPANION | DEMENTIA_CARE |
SENIOR_TRANSPORTATION | ASSISTED_LIVING | POST_SURGERY
```

### `ProblemDetails` (error shape)

```ts
{
  type: string      // error type URI
  title: string     // human-readable summary
  status: number    // HTTP status code
  detail?: string   // extended description
}
```

---

## Mock Setup

MSW intercepts all `/api/v1/*` requests in development. Enable with `VITE_MSW=on`.

| File | Purpose |
|------|---------|
| `src/mocks/browser.ts` | MSW worker init |
| `src/mocks/db.ts` | In-memory store, token map, filter logic |
| `src/mocks/handlers/auth.ts` | Login, register, logout, me |
| `src/mocks/handlers/users.ts` | GET user, PATCH me |
| `src/mocks/handlers/posts.ts` | GET posts (paginated+filtered), GET post by id |
| `src/mocks/seed/users.ts` | 8 seed users (4 CARE_TAKER, 4 CARE_GIVER) |
| `src/mocks/seed/posts.ts` | 12 seed posts (6 per kind) across Portuguese districts |

Seed user password for all accounts: `password123`.

Simulated latency: auth 150ms · users 120ms · posts 180ms.
