# Project Tasks & Progress

## Memory Log
This file tracks the history of tasks performed in this session and planned future work.

## ✅ Completed Tasks
- **Members Search**: Implemented a client-side search/filter for the members list in the admin panel.
  - *File*: `app/admin/members/page.tsx`, `components/admin/MembersTable.tsx`
- **Database Backup**: Created and executed a script to backup the Firebase Realtime Database to a local JSON file.
  - *File*: `scripts/backup-db.ts`
  - *Status*: Backup verified.
- **PDF Import Feature (Initial)**: Created the UI and Server Action for importing calendar events from PDF.
  - *Files*: `app/admin/events/import/page.tsx`, `app/admin/events/import/actions.ts`
  - *Status*: Implemented, currently debugging.

## 🚧 In Progress
- **Debugging PDF Import**:
  - *Issue*: User reported a generic error.
  - *Fix*: Improved error propagation and switched to dynamic `require` for `pdf-parse` to resolve Next.js server-side bundling issues.
  - *Status*: Waiting for user validation.

## 📋 Future Tasks / Backlog
### 1. Correct PDF Import Logic
- **Objective**: Ensure the parser correctly handles the specific layout of the club's calendar PDF (dates, descriptions, split columns).
- **Steps**:
  - Validate the text extraction output.
  - Refine the Regex patterns in `app/admin/events/import/actions.ts`.
  - Add unit tests or dry-run mode to verify parsing without writing to DB.

### 2. Implement Firebase Storage
- **Objective**: Allow uploading images for Blog Posts and Member profiles.
- **Steps**:
  - Enable Firebase Storage in the Firebase Console.
  - Update `app/lib/firebase/client.ts` to export `getStorage()`.
  - Create an upload utility hook (e.g., `useStorageUpload`).
  - Update `MemberForm` and `BlogPostForm` to handle image selection and URL storage.

### 3. General Improvements
- **Security Check**: Verify Firebase Rules for the new Storage bucket.
- **Type Safety**: Improve TypeScript interfaces for the Events model.
