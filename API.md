# Hooked API Reference

Base URL: `http://localhost:5000/api` in development.

## Auth model

Every protected route reads a `jwt` httpOnly cookie (set by `/auth/signup` and `/auth/login`), not a bearer token. Clients must send requests with credentials included (`withCredentials: true` in axios, `credentials: "include"` in fetch).

Most routes that operate on a specific user's data also enforce **ownership**: the `:id`/`:userId` in the URL (or `userId` in the body) must match the authenticated caller, or the request gets a `403`. This is noted per-route below.

## Error format

Every error response is `{ "success": false, "message": "..." }` with an appropriate status code (400/401/403/404/429/500). A validated request body that fails a Zod schema check returns `400` with the first validation issue.

## Rate limiting

`POST /auth/signup`, `POST /auth/login`, `PUT /auth/changePassword`, and `POST /auth/checkPassword` are limited to 20 requests per 15 minutes per IP.

## Pagination

`GET /matches/user-profiles` and `GET /messages/conversation/:userId` accept optional `?page=&limit=` query params. Both default to a generous limit so existing callers that don't pass them see the same result set as before. Response bodies include `page`, `limit`, `total`, and `hasMore`.

---

## Auth — `/api/auth`

| Method & path | Auth | Body | Notes |
|---|---|---|---|
| `POST /signup` | none | `name*, userName*, password*` (min 6 chars), `email, phoneNumber, gender, birthDate, starSign, bio, profilePhoto` | Validated with Zod. Sets the `jwt` cookie. |
| `POST /login` | none | `userName*, password*` | Sets the `jwt` cookie. |
| `POST /logout` | none | — | Clears the cookie. |
| `GET /me` | cookie | — | Returns the current user. |
| `PUT /update/:id` | cookie + ownership | any subset of profile fields | `likes`/`dislikes`/`matches`/`_id` are stripped even if sent. |
| `POST /uploadImage` | none | multipart, field `profilePicture` | Deliberately public — used during signup before an account exists. Returns `{ data: filename }`. |
| `POST /checkPassword` | cookie + ownership | `userId*, password*` | Used before letting the client show a password-change form. |
| `PUT /changePassword` | cookie + ownership | `userId*, password*` | Rejects if the new password equals the old one. |
| `DELETE /me` | cookie | — | Deletes the account **and cascades**: removes the user's Photos, Preference, Subscription, UserDetails, and Messages, and pulls their id out of every other user's `likes`/`dislikes`/`matches`. |
| `GET /` | cookie | — | Lists all users. Not used by the frontend; kept for admin/debug use. |
| `GET /find/:id` | cookie | — | Fetch one user by id. |

## User details — `/api/userDetails` and `/api/details`

Two route files mount the same controller. `/api/userDetails` is the one the frontend uses; `/api/details` is an older `req.user`-based variant kept for compatibility.

| Method & path | Auth | Notes |
|---|---|---|
| `GET /userDetails/user/:id` | cookie | Auto-creates an empty doc on first access. |
| `PUT /userDetails/:id` | cookie + ownership | Upserts profession/education/height/exercise/drinks/smoke/kids/religion. |
| `GET /details/getDetail` | cookie | Same shape, keyed off `req.user` instead of a URL param. |
| `PUT /details/` | cookie | Updates the caller's own details. |

## Preferences — `/api/preference`

| Method & path | Auth | Notes |
|---|---|---|
| `GET /:id` | cookie + ownership | `:id` is a userId. Auto-creates sensible defaults (`Any` gender/religion/star sign, age 16–60) on first access. |
| `PUT /:id` | cookie + ownership | Drives the discovery feed's gender/star sign/religion/age-range filtering. |

## Matches — `/api/matches`

| Method & path | Auth | Notes |
|---|---|---|
| `GET /` | cookie | Your matches, populated with `name` + `profilePhoto`. |
| `GET /user-profiles` | cookie | The swipe deck: excludes yourself and anyone already liked/disliked/matched, applies your Preference filters. Paginated. |
| `GET /likers/:userId` | cookie + ownership | Who has liked you (minus anyone already liked/disliked/matched back) — the data behind the subscription paywall. |
| `POST /swipe-right/:likedUserId` | cookie | Rejects swiping on yourself. If mutual, creates the match on both sides and pushes a `newMatch` socket event to both users if they're connected. |
| `POST /swipe-left/:dislikedUserId` | cookie | — |

## Messages — `/api/messages`

| Method & path | Auth | Notes |
|---|---|---|
| `POST /send` | cookie | `receiverId*, content*`. Rejects if the receiver isn't in your `matches[]`. Pushes a `newMessage` socket event if the receiver is connected. |
| `GET /conversation/:userId` | cookie | Full thread with that user, ascending by time. Paginated. |

## Photos — `/api/photos`

| Method & path | Auth | Notes |
|---|---|---|
| `POST /uploadphoto` | cookie | multipart, field `userPhoto`. Returns `{ data: filename }`. |
| `POST /` | cookie + ownership | `userId*, image*` — records the filename. Capped at 4 photos per user. |
| `GET /:userId` | cookie | Returns an array of filenames (not full doc objects). Auto-creates an empty entry if none exist yet. |

## Subscription — `/api/subscription`

| Method & path | Auth | Notes |
|---|---|---|
| `GET /:userId` | cookie + ownership | Returns `{ expiresOn }` only. `404` if there's no subscription — that's the expected "not subscribed" state. |
| `POST /` | cookie + ownership | `userId*, subscriptionType* (Silver/Gold/Platinum), subscribedOn*, expiresOn*`. Upserts. |

## Payment — `/api/payment` (eSewa)

Not currently wired up by the frontend (which uses a mock payment UI that calls `/subscription` directly), but functional.

| Method & path | Auth | Notes |
|---|---|---|
| `POST /create` | cookie + ownership | Builds a signed eSewa order payload. |
| `POST /success` | cookie + ownership | Verifies `status === "COMPLETE"` and upserts a Subscription. |

## File uploads

Uploaded images are written to and served from **this backend's own** `public/profilePhotos` and `public/userImages` folders (via `express.static`), never the frontend project. On a fresh clone these directories are created automatically on first request; they aren't committed to git.

## Static assets in the repo, not this API

`GET /profilePhotos/:filename` and `GET /userImages/:filename` serve the raw files directly — they're not JSON endpoints.
