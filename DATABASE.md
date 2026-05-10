# Database Schema — Maruthi Insure Care

This project uses **Supabase** (PostgreSQL) as the backend database and authentication provider.

---

## Tables

### `auth.users` (Built-in Supabase Auth)
- Managed by Supabase Auth automatically
- Fields: `id` (uuid), `email`, `aud`, `role`, `created_at`

### `public.profiles`
Stores application-level profile data linked to auth users.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid (PK) | References `auth.users.id` |
| `email` | text | |
| `full_name` | text | |
| `role` | text | `'Agent'` or `'Client'` |
| `phone` | text | Optional |
| `created_at` | timestamptz | Default `now()` |

### `public.clients`
Insurance clients managed by agents.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid (PK) | Auto-generated |
| `agent_id` | uuid | References `profiles.id` (nullable for dummy mode) |
| `name` | text | Required |
| `phone` | text | Required |
| `email` | text | Optional |
| `date_of_birth` | date | Required |
| `address` | text | Optional |
| `status` | text | `'Active'`, `'Pending'`, `'Inactive'` |
| `login_email` | text | For client portal login |
| `login_password_hash` | text | For client portal login |
| `created_at` | timestamptz | Default `now()` |
| `updated_at` | timestamptz | Default `now()` |

### `public.family_members`
Family members under each client.

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid (PK) | Auto-generated |
| `client_id` | uuid (FK) | References `clients.id` ON DELETE CASCADE |
| `name` | text | Required |
| `date_of_birth` | date | Required |
| `relationship` | text | e.g. Wife, Son, Daughter, Father |
| `phone` | text | Optional |
| `created_at` | timestamptz | Default `now()` |

### `public.documents`
Document metadata (actual files stored in Supabase Storage).

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid (PK) | Auto-generated |
| `client_id` | uuid (FK) | References `clients.id` ON DELETE CASCADE |
| `family_member_id` | uuid (FK, nullable) | References `family_members.id` ON DELETE SET NULL |
| `name` | text | Custom display name |
| `file_name` | text | Original file name |
| `file_url` | text | Supabase Storage URL |
| `file_type` | text | `'PDF'`, `'IMG'`, `'DOC'`, `'XLS'`, `'FILE'` |
| `file_size` | bigint | File size in bytes |
| `uploaded_by` | text | Uploader identifier |
| `created_at` | timestamptz | Default `now()` |

### `public.birthday_wishes` (Optional — for tracking sent wishes)

| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid (PK) | Auto-generated |
| `recipient_name` | text | |
| `recipient_type` | text | `'client'` or `'family_member'` |
| `recipient_id` | uuid | |
| `sent_at` | timestamptz | Default `now()` |
| `message` | text | |
| `sent_by` | text | |

---

## Storage Buckets

- **`documents`** — Stores uploaded policy documents, KYC files, etc.

---

## Row Level Security (RLS)

RLS policies are included in the SQL setup to ensure:
- Agents can read/write all data
- Clients can only read their own data
