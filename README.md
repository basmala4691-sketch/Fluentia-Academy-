# Fluentia English Academy — Production Platform & Architecture

Fluentia English Academy is a premium, full-featured online English-learning platform designed primarily for Egyptian English learners and international professionals. It bridges the gap between academic textbook grammar and real-world executive spoken fluency.

---

## 1. Brand Identity & Visual Language
- **Midnight Navy:** `#202F4A`
- **Champagne Gold:** `#D9BC80` / `#B8934C`
- **Ivory Canvas:** `#FAF8F5` / `#F8F1E6`
- **Typography:** *Playfair Display* (Editorial Display Headings) paired with *Plus Jakarta Sans* (Legible Modern Body).
- **Anti-AI Slop Discipline:** Zero-pill metadata design, no generic gradients or decorative pulsing dots, WCAG AA compliance, and responsive desktop/tablet/mobile layouts.

---

## 2. Security Architecture & Role Enforcement

### Public Registration: Exactly Two Account Types
- **Student Account:** For learners with level estimation, goal setting, format preferences.
- **Teacher Account:** For educators. **CRITICAL REQUIREMENT:** New teachers are created with `pending` status. They are strictly quarantined:
  - Cannot access student records
  - Cannot receive student bookings
  - Profile is hidden from the public teacher directory until approved by the owner.
- **Owner Role:** Never exposed in public registration.

### The Discreet Owner Key Icon
- Located at the extreme top-right corner of the navigation bar (`KeyRound` icon).
- Opens an isolated modal requesting designated owner credentials.
- **Rate-Limited:** 4 consecutive failed attempts trigger a 45-second lockout.
- **Neutral Error Messages:** Does not reveal whether username or password was incorrect.
- **Direct Route Protection:** Navigating directly to `/owner-dashboard` without active owner authentication is rejected.
- **Password Confidentiality:** Passwords are never visible to admins or educators.

### Academy Communications Oversight (Safeguarding)
- Academy administrators can inspect student-teacher direct conversations exclusively for safeguarding and dispute resolution.
- Every administrative inspection requires an explicit justification prompt and writes immutably to the permanent audit ledger.

---

## 3. Configured Features

1. **Public Website:**
   - **Hero Section:** "Your English. Your Confidence. Your Next Level." with CTA buttons and metrics strip.
   - **Courses Catalog:** 8 CEFR-aligned courses (A1 to C1, Workplace English, 1-on-1, Speaking Club) with pricing in EGP & USD.
   - **Faculty Directory:** Verified Cambridge/Oxford teachers with filter by specialization and 1-on-1 lesson booking.
   - **Speaking Club:** Virtual roundtable sessions with participant limits and instant seat reservation.
   - **Interactive English Placement Test:** 12-question diagnostic test providing immediate CEFR calculation and syncing with student profile.
   - **Safeguarding & Privacy:** Clear terms and explicit disclosure of administrative communication inspection.

2. **Student Dashboard:**
   - CEFR progress indicators (Grammar, Vocabulary, Fluency, Pronunciation, Confidence)
   - **Spoken English Laboratory:** Web Audio / MediaRecorder microphone recording with playback and submission for teacher audio review.
   - **Vocabulary Notebook:** Term entries with part of speech and category, plus **Interactive Flashcard Revision Mode**.
   - **Files Vault:** Private document and audio clip storage.
   - **Weekly Roadmap:** Assigned phonology and speaking tasks.

3. **Teacher Dashboard:**
   - **Pending Moderation Gate:** Quarantine screen if applicant is unapproved.
   - **Assigned Mentees Dossier:** Student targets and dated notes.
   - **Assignment Reviews:** Create assignments and evaluate speaking audio submissions with CEFR score sliders and written feedback.
   - **Mentorship Schedule:** Weekly lesson calendar with room links.

4. **Owner Dashboard:**
   - Real database analytics: Total students, approved faculty, course enrollments, tuition volume in EGP & USD.
   - **Teacher Approval Queue:** 1-click Approve / Reject with audit logging.
   - **Course Management:** Add, edit, publish/unpublish courses.
   - **Speaking Club Sessions:** Manage session capacity and schedule.
   - **Academy Communications:** Audited conversation inspection with mandatory justification logging.
   - **Tamper-Evident Audit Log:** Searchable chronological record of all administrative events.

---

## 4. Test Accounts & Credentials

The app includes an **Evaluation Role Switcher** at the top of the screen for instant testing of all roles:

| Role | Name | Email | Password |
|---|---|---|---|
| **Academy Owner** | Prof. Tarek Mansour | `owner@fluentia.edu.eg` | `FluentiaOwner2026!` |
| **Approved Teacher** | Dr. Amina El-Sayed | `amina.elsayed@fluentia.edu.eg` | `password123` |
| **Approved Teacher** | Marcus Vance, M.A. | `marcus.vance@fluentia.edu.eg` | `password123` |
| **Pending Teacher** | Youssef Kamal | `youssef.kamal@gmail.com` | `password123` |
| **Student** | Nour Khalil | `nour.khalil@gmail.com` | `password123` |

---

## 5. Deployment Instructions for Vercel & Supabase

### Supabase Setup
1. Create a project at [supabase.com](https://supabase.com).
2. Go to SQL Editor and run `schema.sql` (found under the **Schema & Vercel Docs** tab in the app).
3. Run `security_policies.sql` to activate Row-Level Security.
4. Create a private storage bucket named `fluentia-audio-vault`.

### Environment Variables
Configure these in Vercel Project Settings > Environment Variables:
```env
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
ACADEMY_OWNER_EMAIL="owner@fluentia.edu.eg"
```

### Vercel Deployment
```bash
npm install
npm run build
vercel deploy --prod
```
