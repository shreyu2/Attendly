# BRAIN.md — Attendly Project Memory

You are working on **Attendly**, a real, multi-user, deployable personal college attendance management web application.

This file is the project's persistent memory. It must be kept up to date throughout development.

## Latest Implementation Update (2026-09-08)
- `/` is a public landing page for logged-out visitors and redirects authenticated users to `/dashboard`.
- `/login` and `/signup` are separate Google OAuth entry points using the existing Supabase auth flow; OAuth redirects use the absolute `window.location.origin`.
- Profiles use the Google name/avatar/email only when a profile is first created. Existing `profiles.name`, `semester`, and `department` values are preserved on later sessions.
- Settings now saves the editable Attendly display name, semester, and department explicitly to `profiles`, with saving, success, and error feedback. Email remains read-only.
- New profile academic fields are empty by default. The schema migration clears only the legacy demo values (`Semester 5`, `CSE`, `Computer Science`, and `Computer Science & Engineering`) and changes future defaults to `NULL`.
- Overall safe-skip allowance is calculated from aggregate attended/conducted counts, while subject-level allowances continue to use each subject's effective target.
- Verified with `npm run build` after routing/profile changes and again after the Settings changes. The build passes; Vite reports only its existing large-chunk warning. Supabase OAuth and two-user RLS behavior require configured external accounts and were not executed locally.
- Cloudflare Pages uses the Vite static output; `public/_redirects` rewrites non-file SPA routes to `/index.html` with status `200`, allowing React Router to handle refreshes without bypassing protected-route checks.
- OAuth code contains no Vercel URL and sends Supabase an absolute `window.location.origin`, so the callback returns to the domain that started authentication. Supabase Dashboard should allow both `https://attendly-4x0.pages.dev/` and `https://attendly-teal-two.vercel.app/` under Authentication URL Configuration if both deployments remain active; use the Pages URL as the primary Site URL.
- Live inspection on 2026-09-08 returned HTTP 200 for `/`, `/login`, and all requested protected-route URLs on Cloudflare Pages. Commit `5e08837` containing the Pages fallback was pushed to `main`; no Wrangler CLI or direct Cloudflare credentials are configured in this workspace. A real Google OAuth round trip still requires the configured Supabase/Google accounts.

---

# CURRENT STATE

## Productionization Status: COMPLETED & VERIFIED
- **UI System**: Faithful implementation of Stitch Liquid Glass visual design system (Space Grotesk, Geist, JetBrains Mono, Material Symbols, obsidian glass backgrounds `#06080d` / `#10131a`, cyan `#38bdf8`, emerald `#34d399`, amber `#f59e0b`, rose `#f43f5e`).
- **Clean User Onboarding**: All hardcoded starter/mock data (fake 82%/85% numbers, mock CS-501 subjects, synthetic students) completely removed from the production user flow. New users start with a clean state:
  - 0 subjects -> clear, welcoming onboarding hero cards in Dashboard, Today's Attendance, and Subjects page with direct "Add Subject" actions.
  - Timetable -> empty state guidance explaining timetable configuration after subject creation, with manual slot creator and structured JSON/CSV timetable importer.
- **Dynamic Profile Integration**: All screens (`Header`, `Dashboard`, `TodayAttendance`, `Subjects`, `SubjectDetails`, `Timetable`, `Calendar`, `Settings`) dynamically display the logged-in user's profile information (name, avatar, initials fallback, semester, department) instead of hardcoded strings.
- **Resilient Supabase Client**: `src/lib/supabase.ts` handles missing `.env` variables gracefully (`isSupabaseConfigured` flag exported) to prevent white-screen crashes; Login screen displays friendly configuration guidance if credentials are not yet set.
- **Centralized Mathematical Engine**: `src/lib/attendanceCalculator.ts` strictly implements integer-safe attendance formulas with null handling for 0/0 unconducted states.
- **Full-Stack Persistence**: Real Supabase PostgreSQL database tables with Row-Level Security (RLS) ensuring strict multi-user tenant isolation.

---

# AUTHENTICATION & MULTI-USER ISOLATION

## Status: PRODUCTION READY
- **Supabase Client**: Initialized with environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- **Google OAuth**: One-click Google SSO enabled with automatic redirect handling and session recovery.
- **Email & Password**: Full authentication lifecycle (Sign in, Sign up, Session persistence via Supabase Auth).
- **Guest / Demo Mode**: Clean evaluation mode for previewing functionality when Supabase environment variables are omitted or in offline testing.
- **Profile Synchronization**: Automatically creates or retrieves profile upon authentication, persisting user semester, department, and custom global target attendance percentage.
- **Session Persistence**: React context (`AuthContext.tsx`) restores session on app reload and synchronizes auth state changes.

---

# DATABASE SCHEMA & LEAST-PRIVILEGE SECURITY AUDIT

All database tables, policies, and role grants are defined in `supabase/schema.sql`:

### 1. Security Architecture (Principle of Least Privilege)
- **Role `anon` (Unauthenticated)**:
  - `USAGE` on schema `public` for API gateway routing.
  - `SELECT` on `public.profiles` only (strictly filtered by RLS: `auth.uid() = id` returns 0 rows).
  - **Zero write privileges**: All broad permissions explicitly revoked (`REVOKE ALL ON ALL TABLES/SEQUENCES/ROUTINES`).
  - Cannot access, read, insert, update, or delete rows in `subjects`, `timetable_entries`, or `attendance_records`.
- **Role `authenticated` (Signed-in Students)**:
  - Specific DML privileges only: `SELECT, INSERT, UPDATE, DELETE` on `subjects`, `timetable_entries`, `attendance_records`; `SELECT, INSERT, UPDATE` on `profiles`.
  - Administrative rights (`TRUNCATE`, `TRIGGER`, `REFERENCES`) are omitted.
  - Sequenced usage and routine execution allowed.
- **Role `service_role` (Backend Administrative)**:
  - Bypasses RLS by PostgreSQL design (`BYPASSRLS`). Never exposed to or utilized by frontend clients.
- **Row-Level Security (RLS)**:
  - Enabled and forced on all tables: `profiles`, `subjects`, `timetable_entries`, and `attendance_records`.
  - `FORCE ROW LEVEL SECURITY` applied to prevent privilege escalation even by table owner roles.
  - Strict tenant isolation: every operation requires `auth.uid() = user_id` (or `auth.uid() = id`).
  - UPDATE operations include `WITH CHECK (auth.uid() = user_id)` to prevent reassigning records across users.

### 2. Table Specifications
1. **`profiles`**: `id (UUID PK -> auth.users.id ON DELETE CASCADE)`, `name`, `email`, `avatar_url`, `target_percentage (DEFAULT 80.0)`, `semester`, `department`, `created_at`, `updated_at`
2. **`subjects`**: `id (UUID PK DEFAULT gen_random_uuid())`, `user_id (UUID FK -> auth.users.id ON DELETE CASCADE)`, `name`, `code`, `target_percentage (NULLABLE)`, `credits (DEFAULT 3.0)`, `faculty`, `room`, `color (DEFAULT 'primary')`, `created_at`, `updated_at`
3. **`timetable_entries`**: `id (UUID PK DEFAULT gen_random_uuid())`, `user_id (UUID FK -> auth.users.id ON DELETE CASCADE)`, `subject_id (UUID FK -> subjects.id ON DELETE CASCADE)`, `day_of_week (INT 1-6 Mon-Sat)`, `start_time`, `end_time`, `class_type (DEFAULT 'Lecture')`, `room`, `created_at`, `updated_at`
4. **`attendance_records`**: `id (UUID PK DEFAULT gen_random_uuid())`, `user_id (UUID FK -> auth.users.id ON DELETE CASCADE)`, `subject_id (UUID FK -> subjects.id ON DELETE CASCADE)`, `timetable_entry_id (UUID FK -> timetable_entries.id ON DELETE SET NULL)`, `date (DATE)`, `status (CHECK 'present','absent','cancelled')`, `notes`, `created_at`, `updated_at`

### 3. Automated Verification Matrix
- **Test 1.1 & 1.2**: Anon `SELECT` and `INSERT` on `subjects` denied at privilege layer (`insufficient_privilege`).
- **Test 2.1**: Authenticated User A creates and views own subjects.
- **Test 3.1**: Authenticated User B queries subjects and receives 0 rows (User A subjects completely invisible).
- **Test 4.1**: Authenticated User B attempts update on User A subject -> 0 rows affected.
- **Test 5.1**: Authenticated User B attempts delete on User A subject -> 0 rows affected.
- **Test 6.1**: Authenticated User B attempts insert with `user_id = User A` -> RLS `WITH CHECK` violation (`42501`).
- **Test 7.1**: Authenticated User A attempts to reassign `user_id` to User B on update -> RLS `WITH CHECK` violation (`42501`).
- **Test 8.1**: Authenticated User B creates own subject and sees only their own subject.

---

# ATTENDANCE MATHEMATICAL SPECIFICATION

All formulas reside centrally in `src/lib/attendanceCalculator.ts`.

### 1. Attendance Status Semantics
- **`present`**: Class conducted, student attended. (Increments `attended` and `conducted`).
- **`absent`**: Class conducted, student did not attend. (Increments `conducted` only).
- **`cancelled`**: Class was cancelled. (Neither `attended` nor `conducted` increments).
- **Not Marked**: Class scheduled in timetable, but no record logged yet. (Does not count toward conducted or attended).

### 2. Subject Attendance Percentage
- Formula: `attended / conducted * 100` (if `conducted === 0`, returns `null`).
- When `conducted === 0`, the UI displays an informative empty state ("No attendance recorded yet" or "No Data") rather than 0% or 100%.

### 3. Overall Aggregate Attendance
- Formula: `total_attended_all_subjects / total_conducted_all_subjects * 100` (if `total_conducted === 0`, returns `null`).
- *Note: Never calculated by averaging subject percentages.*

### 4. Safe Skip Allowance (S)
Maximum consecutive classes a student can miss right now without dropping below target T in (0, 100):
`S = Math.max(0, Math.floor((100 * attended - target * conducted) / target))`

### 5. Recovery Classes Required (R)
Minimum consecutive classes a student must attend to reach or exceed target T in (0, 100):
`R = Math.max(0, Math.ceil((target * conducted - 100 * attended) / (100 - target)))`

### 6. "Can I Skip Tomorrow?" Simulation
For a given subject with tomorrow's count of scheduled classes k:
`Projected % = (attended) / (conducted + k) * 100`
The student can safely skip all scheduled classes for that subject tomorrow if and only if:
`Projected % >= subject_target`

---

# SCREEN INVENTORY

| Screen | Route | Key Features |
|---|---|---|
| **Login** | `/login` | Google SSO, email/password, guest preview mode, env configuration alert |
| **Dashboard** | `/` | Bento overview, aggregate gauge, safe skip projection bar, today's schedule, clean onboarding hero |
| **Today's Attendance** | `/today` | Rapid Present/Absent/Cancelled marking, "Mark All Remaining Present", live delta preview, date picker |
| **Subjects** | `/subjects` | Curriculum roster, risk status tags, add/edit/delete subject modal, empty state with CTA |
| **Subject Details** | `/subjects/:id` | Deep dive analytics, attendance ring, safe skips & recovery cards, historical log with direct status change |
| **Timetable** | `/timetable` | 6-day Mon-Sat matrix, time slot visual grid, slot editor modal, JSON/CSV file importer, pre-requisite guidance |
| **Calendar** | `/calendar` | Full month attendance heat view, multi-status day badges, date-selected bottom drawer inspector |
| **What-If Calculator** | `/what-if` | Interactive slider simulation, attend vs. skip trajectory projection, subject-specific target analysis |
| **Notifications** | `/notifications` | Telemetry center, unmarked class alerts, low attendance warnings, one-tap resolution |
| **Settings** | `/settings` | Profile card with initials/avatar, global attendance target stepper, dynamic policy range bar, subject overrides |
| **Can I Skip Tomorrow** | Modal / Drawer | Tomorrow schedule preview, per-subject skip verdict, projected attendance percentages |
