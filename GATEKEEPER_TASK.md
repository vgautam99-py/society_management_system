# 🛡️ Task: Real-Time Gatekeeper Protocol & Cryptographic Pre-Authorization

## 🎯 Project Objective
Build a secure, time-bounded, real-time visitor approval and pre-authorization protocol for the Society Management System (SMS). This system handles visitor verification, live resident approval over WebSockets, transactional fallback email notifications, and database privacy compliance.

---

## 🛠️ Step-by-Step Implementation Tasks

### 🔒 Task 1: Cryptographic time-bounded Passcodes (Invitations)
*   **Backend Schema & Hashing:**
    *   Modify `server/model/visitors.model.js` to include:
        *   `passcodeHash`: String (stored salted hash of the 6-digit code)
        *   `passcodeValidFrom`: Date (start time of guest invite window)
        *   `passcodeValidTo`: Date (end time of guest invite window)
        *   `isSingleUseUsed`: Boolean (default: `false`)
    *   Create a controller `generatePreAuthPasscode` in `visitors.controller.js` to receive a guest name, purpose, flatId, and the validity date/time window from a resident.
    *   Generate a random, secure 6-digit passcode (e.g. `482910`). Hash it using `bcrypt` or the native `crypto` module, save the hash and details, and return the plaintext 6-digit passcode to the resident (do *not* store the plaintext code).
*   **Frontend Dashboard (Resident View):**
    *   Build a visual form in `client/src/pages/Visitors.jsx` for residents to create invitations.
    *   Include inputs for: Guest Name, Purpose, Date, and Time Window (e.g. 2:00 PM to 6:00 PM).
    *   Display the generated 6-digit passcode in a beautiful, copyable badge.
*   **Guard Verification:**
    *   Create a controller `verifyPasscode` in `visitors.controller.js`.
    *   When the guard inputs a passcode, query active visitor records for that flat, check if the passcode hash matches, ensure `isSingleUseUsed` is `false`, and compare the server's current time against `passcodeValidFrom` and `passcodeValidTo` (making sure to handle server UTC vs resident IST timezone offsets).
    *   Mark `isSingleUseUsed` as `true` and update `status` to `'accepted'` on success.

---

### ⚡ Task 2: Live WebSocket Gatekeeper Approval Flow
*   **Backend Registration & Real-Time Emitters:**
    *   Fix the crash bug in `visitors.controller.js` (remove the undefined `email` variable from `Visitor.create`).
    *   Implement proper `res.status().json(...)` responses so HTTP requests do not hang.
    *   When the Guard registers a walk-in visitor, query the `User` model to find the resident assigned to that `flatId`.
    *   Check `userConnectionDetails` (socket map in `app.js`) to see if the resident is actively connected.
    *   If connected, emit a WebSocket event `'visitor_approval_request'` directly to the resident's socket ID with details: `{ visitorId, name, type, purpose }`.
*   **Frontend Guard & Resident Interfaces:**
    *   **Guard UI (`Visitors.jsx`):** A registration form where the guard enters a guest's name, phone, type (delivery, plumber, guest), and flat number. Show a loading spinner: *"Waiting for resident approval..."*.
    *   **Resident Dashboard (`Dashboard.jsx` / `App.jsx`):** Implement a socket listener for `'visitor_approval_request'`. When received, display a real-time modal popup with the guest's details and two actions: **Approve** or **Reject**.
    *   Upon clicking, emit `'visitor_approval_response'` back to the server. The server updates the database status, records the check-in time (`checkIn: new Date()`), and emits an event back to the Guard's UI to open the gate.

---

### 📧 Task 3: Inactive Resident Fallback (Signed Email Links)
*   **Fallback Trigger:**
    *   In the walk-in registration flow, if the resident's socket is **not active** in `userConnectionDetails`, or if the resident does not respond to the socket modal within **60 seconds**, trigger the fallback.
*   **Secure Token & Email Generation:**
    *   Generate a secure, short-lived JWT token containing `{ visitorId, action: 'approve' }` and `{ visitorId, action: 'reject' }` signed with your `JWT_SECRET_STRING` and set to expire in exactly 5 minutes.
    *   Send a transactional email to the resident using your `server/lib/sendMail.js`.
    *   The email template must contain two interactive HTML buttons:
        *   **Approve Entry:** Links to `http://localhost:3000/api/v1/visitors/email-action?token=<JWT_TOKEN_APPROVE>`
        *   **Reject Entry:** Links to `http://localhost:3000/api/v1/visitors/email-action?token=<JWT_TOKEN_REJECT>`
*   **Action Endpoint:**
    *   Create a public route `/api/v1/visitors/email-action` in `visitors.routes.js`.
    *   Verify the token. If valid and not expired, update the visitor's database status to `'accepted'` or `'rejected'`, register the check-in time, and emit a socket event to the Guard's active UI to alert them of the outcome. Show a nice "Thank you, entry approved/denied" HTML page to the resident.

---

### 🧹 Task 4: GDPR/Privacy Compliant Anonymization
*   **Data Retention Policy:**
    *   Visitor logs contain PII (Personally Identifiable Information). You must automatically strip name and phone numbers from logs older than 30 days while keeping data metrics.
*   **MongoDB Automatic Purging:**
    *   Research and implement a Mongoose-based data cleanup mechanism.
    *   You can use a **MongoDB TTL index** on a dedicated expiration field, or write a scheduled worker script using `node-cron` that runs every night at midnight.
    *   The worker must run a query: `Visitor.updateMany({ checkIn: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }, { $unset: { name: "", phone: "" } })`.
    *   This ensures society logs remain searchable for overall statistics (e.g. visitor counts), but the private information of individual guests is securely wiped.

---

 Cloudinary Profile Photo Upload
Backend Upload Infrastructure
      Use the installed `cloudinary` and `multer` dependencies.
      Configure Cloudinary credentials in `.env`:
         `CLOUDINARY_CLOUD_NAME`
         `CLOUDINARY_API_KEY`
         `CLOUDINARY_API_SECRET`
       Create a file `server/lib/cloudinary.js` to initialize Cloudinary and expose an upload function.
      Write a multer upload middleware in `server/middleware/multer.js` to handle `multipart/form-data` file uploads.
User Controller Integration:
       Write an endpoint `PATCH /api/v1/users/:id/profile-photo` in `server/routes/user.routes.js`.
      In the controller, extract the file, upload it to Cloudinary under a directory named `'society_profile_photos'`, retrieve the secure URL, and update the `profilePhoto` field of the matching `User` in MongoDB.




*   **Frontend Profile Integration:**
    *   In the Resident and Admin Dashboards, add an interactive profile avatar with a hover state displaying an "Edit/Upload Photo" icon.
    *   Implement file drop/selection logic in `client/src/component/ManageUsers.jsx` (or a dedicated profile section).
    *   On file selection, trigger an asynchronous API call to upload the photo using `FormData` and update the Redux state (`userSlice` and local storage cookies) so the new avatar renders dynamically across the navbar and profile fields.

---

## 🏆 Verification Checklist (How to test your work)
1.  **Test 1 (Cryptography):** Generate an invitation on the resident dashboard. Check the MongoDB database using a database GUI or log. Ensure the raw 6-digit passcode is **not** stored anywhere in the database, only the bcrypt hash.
2.  **Test 2 (Time-bounding):** Generate an invite for tomorrow. Attempt to verify it today in the Guard panel and ensure the system denies entry with an `"Invite window has not started yet"` error.
3.  **Test 3 (Live socket):** Log in as a resident on one browser and a guard on another. Register a visitor and confirm that the resident receives a real-time modal popup, and clicking "Approve" instantly updates the guard's UI.
4.  **Test 4 (Out-of-band fallback):** Log out the resident (disconnecting the socket). Register a visitor, wait for the fallback, and verify that the resident receives an email, and clicking the email button registers the guest and updates the guard's interface.
5.  **Test 5 (Cloudinary Upload):** Go to the user profile, upload a JPEG/PNG photo. Check your Cloudinary console Media Library to ensure the image appears in the `society_profile_photos` folder, and verify that the app dynamically displays the uploaded image on the UI without page reload.

