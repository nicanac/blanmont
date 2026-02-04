# Future Plans & Implementation Guide

## 1. Correct PDF Import Feature
**Goal**: Robustly parse the club's PDF calendar to create Event entries in Firebase.

### Current Status
- Basic extraction is implemented.
- Error handling has been patched.
- *Issue*: `pdf-parse` returns a raw string. Complex layouts (columns) may merge text lines incorrectly.

### Implementation Strategy
1.  **Extraction Verification**:
    - Log the raw text output of a successful parse to understand the structure.
    - Check if "Date" and "Description" are on the same line or separated by newlines.
2.  **Logic Refinement**:
    - If columns are an issue (e.g., Date | Location | Distance), we may need a heuristic based on x-coordinates (if the parser supports it) or strict Regex patterns.
    - *Alternative*: If `pdf-parse` is insufficient, consider `pdf2json` which provides coordinate data to separate columns.
3.  **Validation Step**:
    - Instead of directly inserting into DB, return a "Preview" list to the UI.
    - Allow the admin to edit/confirm the events before the final "Save".

## 2. Firebase Storage Implementation
**Goal**: Enable image uploads for Member profiles and Blog posts.

### Architecture Update
- **Storage Bucket**: Use standard Firebase Storage bucket.
- **Path Structure**:
  - `/members/{uid}/avatar.jpg`
  - `/blog/{slug}/{filename}` or `/uploads/{date}-{filename}`

### Implementation Steps

#### A. Configuration
1.  **Client Init**:
    - Update `app/lib/firebase/client.ts`:
      ```typescript
      import { getStorage } from "firebase/storage";
      // ... after app init
      export const storage = getStorage(app);
      ```
2.  **Security Rules**:
    - Add rules to `firebase.json` or Console:
      ```
      match /b/{bucket}/o {
        match /members/{userId}/{allPaths=**} {
          allow read;
          allow write: if request.auth.uid == userId || request.auth.token.admin == true;
        }
        match /blog/{allPaths=**} {
          allow read;
          allow write: if request.auth.token.admin == true;
        }
      }
      ```

#### B. Component Logic
1.  **Upload Hook (`useImageUpload`)**:
    - Inputs: `File`, `path`.
    - Logic: `uploadBytesResumable`, track progress `%`, return `downloadURL`.
2.  **UI Updates**:
    - **Members**: Add `<input type="file" />` to the Member Edit form. On change -> resize (optional) -> upload -> save URL to `photoUrl` field.
    - **Blog**: Integrate into the post editor. Either a simple "Cover Image" field or a drag-and-drop zone.

### 3. Timeline
- [ ] **Phase 1**: Fix PDF Parse (Next Session)
- [ ] **Phase 2**: Storage Config & Member Uploads
- [ ] **Phase 3**: Blog Image Uploads
