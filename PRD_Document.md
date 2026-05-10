# PRODUCT REQUIREMENTS DOCUMENT  
## Insurance Client Document Management Portal  
### Maruthi Insure Care  

**Client:** Mr. Sampath Kumar R — Maruthi Insure Care  
**Project Ref:** EST-2026-04-11  
**Prepared By:** Navdeep Ravindran — Auxacode Technologies  
**Document Version:** v1.0  
**Date:** April 27, 2026  
**Delivery Target:** May 2, 2026  
**Status:** In Development  

**Auxacode Technologies Pvt Ltd**  
www.auxacode.com  
contact@auxacode.com  

---

# 1. Product Overview  

## 1.1 Purpose  
This document defines the product requirements for the Insurance Client Document Management Portal commissioned by Maruthi Insure Care. The system replaces the agent's current unstructured workflow, relying on WhatsApp messages, physical folders, and scattered files, with a centralized, secure digital platform.

## 1.2 Problem Statement  
Mr. Sampath Kumar R currently manages client information and policy documents through WhatsApp conversations and physical or folder-based storage. This results in:

- Difficulty locating specific client documents quickly  
- No structured view of family relationships within a client profile  
- No system for tracking upcoming client birthdays or maintaining relationships  
- Repeated manual sharing of documents to clients on request  
- No secure client-facing access to their own documents  

## 1.3 Solution Summary  
A web-based portal with two user roles, Agent (full access) and Client (read-only), that centralizes client profiles, family structures, and document storage, while providing birthday tracking and WhatsApp outreach tools.

## 1.4 Project Scope  

| In Scope | Out of Scope |
|---------|---------------|
| Secure agent login + dashboard | Mobile native app (iOS/Android) |
| Client & family profile management | WhatsApp Business API auto-send |
| Flexible document upload & naming | Policy premium calculations |
| Birthday tracker + WhatsApp wish button | Document OCR / text extraction |
| Client read-only login portal | Multi-agent / team accounts |
| 1 Year .in domain registration | Payment or billing management |
| 3 months support & bug fixes | Third-party integrations |

---

# 2. User Roles & Personas  

| Role | Description | Access Level |
|------|-------------|---------------|
| Agent | Mr. Sampath Kumar — the insurance agent who owns and operates the portal | Full read/write access to all data, document upload, client management, birthday tools |
| Client | Existing insurance clients of Maruthi Insure Care who log in to view their documents | Read-only access to their own profile and documents only. Cannot edit, upload, or view other clients |

---

# 3. Functional Requirements  

## 3.1 Module 1 — Authentication & Dashboard  

| ID | Requirement | Priority | Notes |
|----|-------------|----------|------|
| FR-01 | Single-user secure login with username + password | Must Have | Agent only |
| FR-02 | Session management with auto-logout on inactivity | Must Have | Security |
| FR-03 | Dashboard showing total clients, documents stored, upcoming birthdays, recent additions | Must Have | |
| FR-04 | Mobile-responsive layout across all pages | Must Have | |
| FR-05 | Clean, professional UI matching approved style guide (Inter/Arial, blue palette, navy sidebar) | Must Have | Design doc ref |

## 3.2 Module 2 — Client & Document Management  

| ID | Requirement | Priority | Notes |
|----|-------------|----------|------|
| FR-06 | Add new client form: name, date of birth, phone number, address | Must Have | |
| FR-07 | View and edit complete client profile | Must Have | |
| FR-08 | Search and filter clients by name or phone | Must Have | |
| FR-09 | Upload unlimited documents per client with custom name (no fixed categories) | Must Have | Flexible naming |
| FR-10 | View, download, and delete uploaded documents | Must Have | |
| FR-11 | Add family members under a client with name, DOB, relationship | Must Have | |
| FR-12 | Each family member has their own independent document storage | Must Have | |
| FR-13 | Client login portal with read-only view of own profile and documents | Must Have | |

## 3.3 Module 3 — Birthday Reminder System  

| ID | Requirement | Priority | Notes |
|----|-------------|----------|------|
| FR-14 | Birthday dashboard widget for upcoming birthdays this week and month | Must Have | |
| FR-15 | Birthday list shows name, relationship, date, age turning | Must Have | |
| FR-16 | WhatsApp wish button opens WhatsApp with pre-filled personalized birthday message | Must Have | Uses wa.me link |
| FR-17 | Customizable birthday message template with client name auto-inserted | Should Have | |
| FR-18 | Birthday notification or alert badge on dashboard | Should Have | |

## 3.4 Module 4 — Social Media Creatives  

| ID | Deliverable | Quantity |
|----|--------------|----------|
| CR-01 | Custom birthday creatives for WhatsApp/social media (Maruthi Insure Care branded) | 5 designs |
| CR-02 | Policy reminder post designs | 2 designs |
| CR-03 | Festive / occasion post designs | 2 designs |

---

# 4. Non-Functional Requirements  

| Category | Requirement |
|----------|-------------|
| Security | All data stored with password protection. Client login restricted to own data only. Session auto-logout |
| Performance | Pages load within 2 seconds. Document upload supports files up to 20MB |
| Usability | Interface usable without technical training. Mobile-friendly on all major browsers |
| Reliability | Minimal downtime. Bug fixes covered for 3 months post-delivery |
| Scalability | System can accommodate growth to 200+ clients without re-architecture |
| Browser Support | Chrome, Safari, Firefox, Edge — latest two major versions |
| Domain | 1 Year .in domain registration included |

---

# 5. Data Model & Entities  

## 5.1 Core Entities  

| Entity | Key Fields | Relationships |
|--------|------------|---------------|
| Client | Name, DOB, Phone, Address, Login credentials | Has many Family Members, Documents |
| Family Member | Name, DOB, Relationship to client | Belongs to Client, Has many Documents |
| Document | Custom name, File, Upload date, File type, Size | Belongs to Client or Family Member |
| Agent | Username, Password (hashed), Session token | Manages all Clients |

---

# 6. UI/UX Design Specifications  

## 6.1 Approved Color Palette  

| Role | Hex Code | Usage |
|------|----------|------|
| Primary Blue | #1565C0 | Primary buttons, active nav items, key headings |
| Medium Blue | #1E88E5 | Secondary actions, hover states, links |
| Light Blue | #42A5F5 | Accents, focus rings, input highlights |
| Sky Background | #E3F2FD | Dashboard stat cards, page backgrounds |
| Navy | #0D3B72 | Sidebar, document titles, H1 headings |
| Success Green | #1a7a4a | Success messages, active status badges |
| Alert Orange | #F57C00 | Warnings, pending status, non-critical alerts |
| Body Text | #1A1A2E | Primary body copy |
| Sub Text | #546E7A | Labels, captions, secondary descriptions |

## 6.2 Typography  

| Usage | Size | Weight | Color |
|------|------|--------|------|
| Page Title / H1 | 28–32px | Bold 700 | Navy |
| Section Heading / H2 | 20–24px | SemiBold 600 | Primary Blue |
| Card Title / H3 | 16–18px | Medium 500 | Dark |
| Body Text | 14px | Regular 400 | SubText |
| Labels / Captions | 12px | Medium 500 | Gray |
| Buttons | 14px | SemiBold 600 | White on Blue |

## 6.3 Key Screens  

- Login Page — centered card, logo, username/password, blue CTA button  
- Dashboard — navy sidebar, stats row, recent clients list, upcoming birthdays panel  
- Client Profile — details at top, family members section, documents grid with upload zone  
- Document Upload — dashed blue border, drag-and-drop zone, custom name field  
- Birthday Page — sortable list with WhatsApp wish button per entry  
- Client Portal — stripped-down read-only view showing only own documents  

---

# 7. Delivery Plan & Milestones  

| Day | Date | Deliverables | Module |
|-----|------|---------------|--------|
| Day 1 | Mon Apr 28 | Project setup, DB schema, auth system, login page, dashboard layout | M1 |
| Day 2 | Tue Apr 29 | Add client form, client list + search, client profile page, document upload | M2 |
| Day 3 | Wed Apr 30 | Family member management, per-member documents, client login portal, birthday list | M2 + M3 |
| Day 4 | Thu May 1 | WhatsApp wish button, 9 social media creatives | M3 + M4 |
| Day 5 | Fri May 2 | Full testing, bug fixes, domain setup, handover walkthrough, balance payment | Delivery |

---

# 8. Commercial Summary  

| Module / Deliverable | Total (INR) | Advance Paid | Balance |
|----------------------|-------------|---------------|---------|
| M1 — Login & Dashboard | ₹3,000 | ₹1,800 | ₹1,200 |
| M2 — Client Management & Document Upload | ₹5,500 | ₹3,300 | ₹2,200 |
| M3 — WhatsApp Birthday Reminder | ₹2,000 | ₹1,200 | ₹800 |
| M4 — Social Media Creatives | ₹1,500 | ₹900 | ₹600 |
| 1 Year .in Domain + 3M Support | Complimentary | — | — |
| **TOTAL PROJECT** | **₹12,000** | **₹5,000** | **₹7,000** |

**Advance of ₹5,000 received on April 24, 2026. Balance of ₹7,000 payable on successful delivery. Ref: RCP-2026-04-001.**

---

# 9. Assumptions, Dependencies & Risks  

## 9.1 Assumptions  

- Client will provide company logo within 24 hours of project start  
- Color palette and style guide approved as per Project Initialization Document  
- WhatsApp wish button will use pre-filled wa.me links  
- Client will provide sample client names for testing  
- Domain name availability confirmed before purchase  

## 9.2 Dependencies  

- Agent must supply logo file (PNG/JPG)  
- Hosting environment must be provisioned before final delivery  
- .in domain registration requires valid Indian contact details  

## 9.3 Risks & Mitigations  

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Logo or content not provided by client in time | Medium | Follow up Day 1, use placeholder branding if delayed |
| Scope creep mid-build | High | Strict PRD adherence, separate quotation for extras |
| Domain unavailable | Low | Keep alternative domain options ready |
| Critical bugs on Day 5 | Medium | Reserve 4 hours exclusively for bug fixes |

---

# 10. Document Approval  

By signing below, both parties confirm that this PRD accurately captures the agreed scope, requirements, and delivery terms.

| Auxacode Technologies Pvt Ltd | Maruthi Insure Care |
|-------------------------------|----------------------|
| Navdeep Ravindran | Mr. Sampath Kumar R |
| Authorized Signatory | Client |
| Date: _____________ | Date: _____________ |

---