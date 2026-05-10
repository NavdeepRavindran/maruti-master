# API Endpoints — Maruthi Insure Care

All endpoints are Next.js API Routes under `/app/api/`.

---

## Authentication

### `POST /api/auth/login`
Authenticate a user with email and password.

- **Request:** `{ "email": "...", "password": "..." }`
- **Response:** `{ "user": {...}, "session": {...} }`


---

## Clients

### `GET /api/clients`
List all clients with optional search and filter.

- **Query Params:** `search`, `status` (`Active`, `Pending`, `all`)
- **Response:** `{ "clients": [...], "total": number }`

### `POST /api/clients`
Create a new client.

- **Request:** `{ "name", "phone", "date_of_birth", "email?", "address?" }`
- **Response:** `{ "client": {...} }`

### `GET /api/clients/[id]`
Get single client with family members and documents.

- **Response:** `{ "client": {...}, "family_members": [...], "documents": [...] }`

### `PUT /api/clients/[id]`
Update client details.

### `DELETE /api/clients/[id]`
Delete client and all associated family members and documents.

---

## Family Members

### `GET /api/clients/[id]/family`
List family members for a client.

### `POST /api/clients/[id]/family`
Add a family member.

- **Request:** `{ "name", "date_of_birth", "relationship", "phone?" }`

### `PUT /api/clients/[id]/family/[fid]`
Update a family member.

### `DELETE /api/clients/[id]/family/[fid]`
Delete a family member and their documents.

---

## Documents

### `GET /api/documents`
List all documents with optional filters.

- **Query Params:** `client_id`, `family_member_id`, `search`
- **Response:** `{ "documents": [...], "total": number }`

### `POST /api/documents`
Create document metadata entry.

- **Request:** `{ "client_id", "name", "file_name", "family_member_id?", "file_url?", "file_size?" }`

### `DELETE /api/documents/[id]`
Delete a document (metadata + storage file).

---

## Birthdays

### `GET /api/birthdays`
Get upcoming birthdays from clients and family members.

- **Query Params:** `range` (`today`, `week`, `month`, `all`)
- **Response:** `{ "birthdays": [...], "stats": { "today", "thisWeek", "thisMonth", "total" } }`

---

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/login` | Login page |
| `/dashboard` | Dashboard overview |
| `/dashboard/clients` | Client directory with search, add, edit, delete |
| `/dashboard/clients/[id]` | Client profile with family members and documents |
| `/dashboard/documents` | Document vault with search and delete |
| `/dashboard/birthdays` | Birthday outreach with WhatsApp integration |
| `/dashboard/settings` | Portal settings |

---

## Sample Data Structure (Output Example)

Here is how the data looks when fetched from Supabase (as seen in the connection test):

### Profiles
```json
[
  {
    "id": "7ac382c6-441a-452a-bc10-80845f818bd9",
    "email": "agent@maruthi.com",
    "full_name": "agent@maruthi.com",
    "role": "Agent",
    "phone": null,
    "created_at": "2026-05-09T13:51:05.17128+00:00"
  }
]
```

### Clients
```json
[
  {
    "id": "31ccb76e-c8f0-4769-bb49-e241d7c6606b",
    "agent_id": null,
    "name": "Anil Kapoor",
    "phone": "+91 98765 43210",
    "email": "anil.kapoor@email.com",
    "date_of_birth": "1985-05-12",
    "address": "12, MG Road, Bangalore - 560001",
    "status": "Active",
    "login_email": null,
    "login_password_hash": null,
    "created_at": "2026-05-09T13:07:05.083729+00:00",
    "updated_at": "2026-05-09T13:07:05.083729+00:00"
  }
]
```

### Documents
```json
[
  {
    "id": "a3f8e6c7-3a8e-4509-9557-87973f1cf198",
    "client_id": "54c47639-473f-43a8-8e7a-cf41135d95ed",
    "family_member_id": null,
    "name": "Test Health Policy",
    "file_name": "health_policy.pdf",
    "file_url": "https://example.com/file.pdf",
    "file_type": "PDF",
    "file_size": 2048,
    "uploaded_by": "Test Script",
    "created_at": "2026-05-09T14:10:33.950937+00:00"
  }
]
```

### Family Members
```json
[
  {
    "id": "4ec92777-8700-4936-ba5b-acb7bf003d8e",
    "client_id": "54c47639-473f-43a8-8e7a-cf41135d95ed",
    "name": "Test Spouse",
    "date_of_birth": "1992-02-02",
    "relationship": "Spouse",
    "phone": null,
    "created_at": "2026-05-09T14:10:33.838224+00:00"
  }
]
```
