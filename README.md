# Maruthi Insure Care - Agency Management System

**Maruthi Insure Care** is a modern, comprehensive, and highly secure Insurance Agency Management web application. Built for insurance agents and agencies, it streamlines client onboarding, securely stores policy documents, manages automated outreach (birthdays and anniversaries), and provides a polished self-service portal for clients.

---

## 🌟 Key Features

### For the Agency (Dashboard)
- **Agent Dashboard**: A high-end, responsive UI built with modern Tailwind CSS to track clients, documents, and outreach at a glance.
- **Client Management**: Create, edit, and organize clients with up to 15 different metadata fields (including various insurance types and expiry dates).
- **Secure File Storage**: Upload KYC, policy documents, and receipts directly to Supabase storage, categorized for easy retrieval.
- **Outreach Canvas Engine**: Built-in HTML5 Canvas generator that automatically creates branded Birthday and Anniversary greeting cards for clients with custom messaging and agency branding.
- **Settings & Configuration**: Fully adjustable user profile, UI configurations, WhatsApp message templating, and more.

### For the Client (Client Portal)
- **Agent-Led Onboarding**: When agents create a client, the system generates a secure temporary password and a unique ID (e.g., `MC-000045`) for the client.
- **Self-Service Dashboard**: Clients can log in using their credentials to view their active policies, family members, and download their own documents without needing to call the agent.
- **Strict Data Isolation**: Row Level Security (RLS) and Server-side JWT validation ensures clients can only ever see their own documents and data.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS (with custom utility classes and animations)
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage Buckets
- **Security & Authentication**:
  - `bcryptjs`: Cryptographic hashing for client temporary passwords.
  - `jose`: Secure Edge-compatible JSON Web Token (JWT) generation.
  - Next.js HTTP-Only Cookies (via `proxy.ts` middleware validation).
- **Validation**: `zod` for robust server-side API payload validation.

---

## 🔐 Architecture & Security Overview

To guarantee the safety of sensitive Personally Identifiable Information (PII) and policy documents, the architecture was heavily hardened:

1. **Atomic ID Generation**: Client login IDs (`MC-XXXXXX`) are generated using a PostgreSQL Sequence directly in the database to prevent race conditions if multiple agents onboard clients simultaneously.
2. **Server-Side API Protection**: Next.js 16 Proxy Middleware (`proxy.ts`) intercepts traffic to the Client Portal and API routes to ensure valid HTTP-Only JWT tokens are present before rendering or returning data.
3. **Password Cryptography**: While the UI generates and shows a plaintext password *once* for the agent to share, the database only ever stores the `bcrypt` hash of the password.
4. **Zod API Contracts**: All `POST` and `PUT` API endpoints strictly validate incoming JSON payloads using `zod` schemas to prevent malformed data from reaching PostgreSQL.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ 
- A Supabase Project (Database & Storage)

### 2. Environment Variables
Create a `.env.local` file in the root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
JWT_SECRET=your-very-secure-random-string-here
```

### 3. Database Setup
Copy the contents of `supabase_setup.sql` (found in the root directory) and run it in your Supabase SQL Editor. This script will:
- Create all tables (`profiles`, `clients`, `family_members`, `documents`).
- Configure Row Level Security (RLS) policies.
- Create the atomic sequence for client ID generation.
- (Optional) You can uncomment the seed data at the bottom of the SQL file for testing.

### 4. Installation & Running
```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

---

## 📂 Project Structure

- `app/dashboard/*`: Contains all internal agency-facing routes (Clients, Birthdays, Settings).
- `app/client-login/*`: The login gateway for clients.
- `app/client-portal/*`: The secure dashboard specifically for logged-in clients.
- `app/api/*`: Next.js Route Handlers strictly validating and interfacing with Supabase.
- `proxy.ts`: Next.js 16 Middleware for intercepting requests and enforcing JWT verification.
- `DATABASE.md` & `API.md`: Detailed engineering documentation on the schema and endpoints.
