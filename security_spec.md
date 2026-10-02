# Security Specification & Test Protocol

## 1. Data Invariants
1. **Admissions Integrity**: Admission records must contain valid student names, contact numbers, valid grade strings, and valid statuses (`pending`, `approved`, `rejected`).
2. **Batch Management**: Coaching batches must have non-negative fees, non-negative capacity, and valid status (`active`, `upcoming`, `completed`).
3. **Study Notes**: Digital notes must have positive or zero prices and enforce boolean flags for `isFreeSample` and `watermarkEnabled`.
4. **Mock Tests & Results**: Mock test questions cannot exceed volumetric safety limits. Test results must have non-negative score and valid percentage (0-100).
5. **Inquiries & Blogs**: Public visitors may submit inquiries and view approved public content (notes preview, blogs, batches), while admin operations are guarded.

## 2. The "Dirty Dozen" Payloads
1. **Payload 1 (Admissions Spoofing)**: Injection of oversized string (>1MB) into `studentName`.
2. **Payload 2 (Invalid Admission Status)**: Submitting `status: 'super_admin_approved'` bypassing enum.
3. **Payload 3 (Negative Batch Fees)**: Creating batch with `fees: -50000`.
4. **Payload 4 (Massive Batch Capacity)**: Injecting `capacity: 999999999`.
5. **Payload 5 (Ghost Field on Note)**: Injecting `isAdmin: true` into study note doc.
6. **Payload 6 (Oversized Note Description)**: Injecting 200KB description into note.
7. **Payload 7 (Invalid Video Type)**: Setting `videoType: 'dangerous_exec'`.
8. **Payload 8 (Mock Test Passing Marks Violation)**: Setting `passingMarks: -10`.
9. **Payload 9 (Test Result Percentage Poisoning)**: Setting `percentage: 1500`.
10. **Payload 10 (Blog Malformed Payload)**: Missing `title` or `content` on article creation.
11. **Payload 11 (Inquiry Status Elevation)**: Public user setting inquiry status directly to `resolved`.
12. **Payload 12 (Path Poisoning Attack)**: Injecting path traversal characters into document ID.

## 3. Test Runner Specification
`firestore.rules.test.ts` validates that all unauthenticated malicious payloads and malformed documents are rejected with `PERMISSION_DENIED`.
