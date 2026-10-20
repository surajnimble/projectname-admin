// Standalone data models that are not part of a request or response envelope —
// the app's own static shapes (mirrors Android's `data/models/`). Keep request
// fields in `api-request.ts` and envelope payloads in `base-response.ts`.

export interface SessionUser {
  userId: string;
  name: string;
  email: string;
  phone: string;
  roles: string[];
}
