# BRAIN.md — Attendly Project Memory

You are working on **Attendly**, a real, multi-user, deployable personal college attendance management web application.

This file is the project's persistent memory. It must be kept up to date throughout development.

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

# DATABASE SCHEMA & RLS AUDIT

All database tables are defined in `supabase/schema.sql`:

### 1. `profiles`
- **Columns**: `id (UUID PK -> auth.users.id ON DELETE CASCADE)`, `name (TEXT)`, `email (TEXT)`, `avatar_url (TEXT)`, `target_percentage (NUMERIC, DEFAULT 80.0)`, `semester (TEXT)`, `department (TEXT)`, `created_at`, `updated_at`
- **RLS**: Enabled.
  - `SELECT`: `auth.uid() = id`
  - `INSERT`: `auth.uid() = id`
  - `UPDATE`: `auth.uid() = id`

### 2. `subjects`
- **Columns**: `id (UUID PK)`, `user_id (UUID FK -> auth.users.id ON DELETE CASCADE)`, `name (TEXT)`, `code (TEXT)`, `target_percentage (NUMERIC NULLABLE)`, `credits (NUMERIC)`, `faculty (TEXT)`, `room (TEXT)`, `color (TEXT)`, `created_at`, `updated_at`
- **RLS**: Enabled.
  - `SELECT`: `auth.uid() = user_id`
  - `INSERT`: `auth.uid() = user_id`
  - `UPDATE`: `auth.uid() = user_id`
  - `DELETE`: `auth.uid() = user_id`

### 3. `timetable_entries`
- **Columns**: `id (UUID PK)`, `user_id (UUID FK -> auth.users.id ON DELETE CASCADE)`, `subject_id (UUID FK -> subjects.id ON DELETE CASCADE)`, `day_of_week (INT 1-6 Mon-Sat)`, `start_time (TIME)`, `end_time (TIME)`, `class_type (TEXT: Lecture, Lab, Tutorial, Other)`, `room (TEXT)`, `created_at`, `updated_at`
- **RLS**: Enabled.
  - `SELECT`: `auth.uid() = user_id`
  - `INSERT`: `auth.uid() = user_id`
  - `UPDATE`: `auth.uid() = user_id`
  - `DELETE`: `auth.uid() = user_id`

### 4. `attendance_records`
- **Columns**: `id (UUID PK)`, `user_id (UUID FK -> auth.users.id ON DELETE CASCADE)`, `subject_id (UUID FK -> subjects.id ON DELETE CASCADE)`, `timetable_entry_id (UUID FK -> timetable_entries.id ON DELETE SET NULL)`, `date (DATE)`, `status (TEXT: present, absent, cancelled)`, `notes (TEXT)`, `created_at`, `updated_at`
- **Unique Constraint**: `(user_id, subject_id, date, COALESCE(timetable_entry_id, '00000000-0000-0000-0000-000000000000'))` to prevent duplicate logs.
- **RLS**: Enabled.
  - `SELECT`: `auth.uid() = user_id`
  - `INSERT`: `auth.uid() = user_id`
  - `UPDATE`: `auth.uid() = user_id`
  - `DELETE`: `auth.uid() = user_id`

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
