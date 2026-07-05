# QA Audit Report: RMC ERP System

## Summary of Findings
An exhaustive end-to-end QA audit was conducted on the RMC ERP system across Authentication, Customers, Drivers, Vehicles, Inventory, Orders, Trips, and UI components. Multiple severe defects have been identified, particularly concerning data integrity (negative values), missing validation, unhandled exceptions resulting in 500 errors, cross-site scripting (XSS), missing authorization middleware, and UI timeout issues.

**Test Coverage Summary:**
- **Total Modules Tested:** 9 (Auth, Customers, Drivers, Vehicles, Inventory, Mix Designs, Orders, Trips, UI)
- **Total Bugs Found:** 12
- **Critical Bugs:** 3
- **High Bugs:** 4
- **Medium Bugs:** 3
- **Low Bugs:** 2

---

## 🐞 Discovered Issues

### Issue 1: Authentication endpoint allows SQL Injection-like payloads in numeric fields
**Title:** Auth registration throws 500 Server Error due to unhandled non-integer payload in `role_id`
**Severity:** High
**Priority:** P1
**Environment:** API / Backend
**Preconditions:** None
**Steps to Reproduce:**
1. Send a POST request to `/api/auth/register`
2. Provide a payload with an injection-like string for the integer field: `{"email":"sql@test.com","password":"123","name":"Test User 2","role_id":"1 OR 1=1"}`
**Expected Result:** The server returns a `400 Bad Request` with a clear validation message stating `role_id` must be an integer.
**Actual Result:** The server attempts to parse the payload directly into the SQL query and crashes, throwing a 500 Server Error with database schema exposure: `invalid input syntax for type integer: "1 OR 1=1"`.

---

### Issue 2: Cross-Site Scripting (XSS) vulnerability in Order Delivery Address
**Title:** Order Creation allows malicious HTML/JS payloads in `delivery_address`
**Severity:** Critical
**Priority:** P0
**Environment:** API / Backend / Frontend
**Preconditions:** Authenticated as a user with Order Write permissions.
**Steps to Reproduce:**
1. Log in to the application or obtain an auth token.
2. Send a POST request to `/api/orders` with `delivery_address` set to `<script>alert(1)</script>`.
3. View the Order List.
**Expected Result:** The input should be sanitized or rejected.
**Actual Result:** The payload is successfully inserted into the database without sanitization. It poses an immediate stored XSS risk when rendered in the UI or admin dashboard.

---

### Issue 3: Negative quantity allowed in Orders and Inventory Movements
**Title:** System allows processing of negative quantities for Orders and Stock Movements
**Severity:** Critical
**Priority:** P0
**Environment:** API / Backend / Business Logic
**Preconditions:** Authenticated as a user.
**Steps to Reproduce:**
1. Send a POST request to `/api/orders` with `quantity: -50`.
2. Send a POST request to `/api/inventory/movements` with `change_qty: -5000000000`.
**Expected Result:** Business logic should reject negative quantities or quantities exceeding realistic bounds.
**Actual Result:** The backend successfully accepts and persists negative quantities, potentially breaking billing calculations, inventory levels, and dispatch logic.

---

### Issue 4: Missing validation for Duplicate Customers
**Title:** Customer Creation allows duplicate entries with the same GST/Contact Details
**Severity:** Medium
**Priority:** P2
**Environment:** API / Backend
**Preconditions:** Authenticated user.
**Steps to Reproduce:**
1. Send a POST request to `/api/customers` with name "Test Customer" and GST "GST12345".
2. Send the exact same POST request again.
**Expected Result:** The system should reject the second request, citing a duplicate entry.
**Actual Result:** A duplicate customer is created successfully.

---

### Issue 5: Missing validation for Duplicate Driver Licenses
**Title:** Driver Creation allows multiple drivers to share the same License Number
**Severity:** High
**Priority:** P1
**Environment:** API / Backend
**Preconditions:** Authenticated user.
**Steps to Reproduce:**
1. Send a POST request to `/api/drivers` with `license_number: "LIC-1234"`.
2. Send the exact same request again.
**Expected Result:** A driver's license number must be unique; the second request should fail.
**Actual Result:** Multiple drivers are successfully created with identical license numbers.

---

### Issue 6: Improper Email validation in Customer Creation
**Title:** Customer Creation accepts invalid email formats
**Severity:** Low
**Priority:** P3
**Environment:** API / Backend
**Preconditions:** Authenticated user.
**Steps to Reproduce:**
1. Send a POST request to `/api/customers` with `email: "invalid-email"`.
**Expected Result:** The system should return a `400 Bad Request` citing invalid email format.
**Actual Result:** The customer is created with the malformed email address.

---

### Issue 7: Unbounded Data Entry / Excessively Long Strings
**Title:** Order Creation allows excessively long strings causing potential database bloat
**Severity:** Medium
**Priority:** P2
**Environment:** API / Backend
**Preconditions:** Authenticated user.
**Steps to Reproduce:**
1. Send a POST request to `/api/orders` with `delivery_address` containing 10,000 characters.
**Expected Result:** The API should limit string length to a reasonable maximum (e.g., 255 or 500 characters).
**Actual Result:** The extremely long string is accepted and persisted, causing potential bloat or memory/performance issues when fetching the list of orders.

---

### Issue 8: Missing explicit constraints on Trip Creation
**Title:** Trip Creation allows missing Driver, Vehicle, and Order constraints
**Severity:** High
**Priority:** P1
**Environment:** API / Backend
**Preconditions:** Authenticated user.
**Steps to Reproduce:**
1. Send a POST request to `/api/trips` with empty body `{}`.
**Expected Result:** A standard `400 Bad Request` detailing all missing fields in a structured format.
**Actual Result:** Returns `Missing required fields: order_id, vehicle_id, driver_id, eta` but does not validate if these actually exist before attempting to insert them. Later tests reveal that invalid references result in a generic 500 error due to database foreign key violations rather than graceful API 400 validation errors.

---

### Issue 9: UI Crash/Timeout on Dashboard Load (Playwright Automation)
**Title:** Dashboard UI elements are failing to load within timeout threshold
**Severity:** Medium
**Priority:** P2
**Environment:** Frontend UI / Browser
**Preconditions:** Authenticated user executing UI interaction.
**Steps to Reproduce:**
1. Login to the application via Playwright.
2. Wait for the Dashboard to load `Total Orders` text.
**Expected Result:** The text should appear immediately after network requests resolve.
**Actual Result:** The Playwright test times out waiting for `Total Orders` to become visible, indicating either a significant performance delay, a DOM structure mismatch, or an unhandled exception preventing the render in automated environments.

---

### Issue 10: Inventory Movement missing payload throws 500 error
**Title:** Missing fields in Inventory Movement POST causes unhandled exception
**Severity:** Low
**Priority:** P3
**Environment:** API / Backend
**Preconditions:** Authenticated user.
**Steps to Reproduce:**
1. Send a POST request to `/api/inventory/movements` with `change_qty` as `"a lot"`.
**Expected Result:** The API returns `400 Bad Request`.
**Actual Result:** The API catches an error resulting in a generic `500 Server Error: Failed to record stock movement.`, indicating a failure to correctly handle type conversion exceptions.

---

### Issue 11: Duplicate Order Submissions are allowed
**Title:** Lack of idempotency on Order Creation allows duplicate orders
**Severity:** Critical
**Priority:** P0
**Environment:** API / Frontend
**Preconditions:** User submits an order twice in rapid succession.
**Steps to Reproduce:**
1. Submit POST `/api/orders` with the same payload twice within seconds.
**Expected Result:** The API uses idempotency keys or detects identical rapid submissions to prevent accidental duplicates.
**Actual Result:** Two identical orders are created and charged to the system.

---

### Issue 12: Missing validation for Negative Volume Delivered in Trips
**Title:** Trip Creation allows negative `volume_delivered`
**Severity:** High
**Priority:** P1
**Environment:** API / Backend
**Preconditions:** Authenticated user.
**Steps to Reproduce:**
1. Send a POST request to `/api/trips` with `volume_delivered: -10`.
**Expected Result:** The API returns `400 Bad Request`.
**Actual Result:** The API successfully persists a trip with a negative delivered volume, throwing off logistical reporting.

---

## 🛠 Suggestions for Improving Test Coverage
1. **API Validation Layer:** Implement a centralized validation layer (e.g., using Zod or Joi) to enforce types, boundaries (no negative numbers for quantities), and limits on all endpoints.
2. **Database Constraints:** Add unique constraints to the database for `license_number` on drivers and `gst_number` on customers to prevent duplicate entries at the schema level.
3. **Idempotency Keys:** Ensure critical endpoints like `/api/orders` implement idempotency keys to prevent accidental duplicate clicks on the UI.
4. **Error Handling Middleware:** Unify error handling to prevent DB schema errors from leaking into the 500 response bodies. Translate foreign key and type errors into graceful `400 Bad Request` messages.