# 🏗️ Real Estate Contact Form Backend API

This backend service handles contact form submissions and stores them in a Google Sheet using the Google Sheets API.

---

# 📌 Base URL

```
https://backendrealestate-nine.vercel.app
```

---

# ✅ Health Check Endpoint

### GET `/api/health`

Used to verify if backend is running.

### Response
```json
{
  "status": "Backend is running"
}
```

---

# 📩 Contact Form Endpoint

### POST `/api/contact`

This endpoint saves form submissions to Google Sheets.

---

## 🔹 Required Request Headers

```http
Content-Type: application/json
```

---

## 🔹 Required Request Body (IMPORTANT)

Frontend MUST send exactly these fields:

```json
{
  "fullName": "Riya Sharma",
  "phoneNumber": "+919999999999",
  "emailAddress": "riya@example.com",
  "subject": "buy",
  "message": "I am interested in buying a property."
}
```

### ⚠️ Field Names Are Case-Sensitive

The backend expects:

- `fullName`
- `phoneNumber`
- `emailAddress`
- `subject`
- `message`

If any field is missing or empty, the request will fail.

---

## ✅ Success Response (201)

```json
{
  "success": true,
  "message": "Saved successfully"
}
```

---

## ❌ Validation Error (400)

If any field is missing:

```json
{
  "error": "All fields are required"
}
```

---

## ❌ Server Error (500)

If something fails internally:

```json
{
  "success": false,
  "error": "Error message here"
}
```

---

# 🧠 Frontend Integration Example (React)

Use this exact structure when submitting:

```javascript
const handleSubmit = async () => {
  const response = await fetch("https://backendrealestate-nine.vercel.app/api/contact", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      fullName: formData.name,
      phoneNumber: formData.phone,
      emailAddress: formData.email,
      subject: formData.subject,
      message: formData.message
    })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Submission failed");
  }

  alert("Message sent successfully!");
};
```

---

# 🌐 CORS Policy

Currently configured to allow all origins:

```javascript
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));
```

This allows frontend apps hosted anywhere to connect.

---

# 📊 Google Sheets Integration

- Spreadsheet ID is stored in environment variable:
  ```
  GOOGLE_SHEET_ID
  ```

- Sheet Tab Name:
  ```
  Contact Submissions - Amit Construction
  ```

- Data is appended in range:
  ```
  'Contact Submissions - Amit Construction'!A:F
  ```

---

# 🔐 Required Environment Variables (Backend)

```
GOOGLE_PROJECT_ID
GOOGLE_PRIVATE_KEY_ID
GOOGLE_PRIVATE_KEY
GOOGLE_CLIENT_EMAIL
GOOGLE_CLIENT_ID
GOOGLE_SHEET_ID
PORT
```

---

# 📎 Notes for Frontend Developers

1. Always check `response.ok` before showing success message.
2. Field names must match exactly.
3. Use production backend URL (not localhost).
4. Content-Type must be `application/json`.

---

# 🚀 Deployment

Backend is deployed on:

Vercel Serverless Functions

---

# 📬 Summary

| Feature | Status |
|----------|--------|
| Google Sheets Write | ✅ Working |
| CORS Enabled | ✅ Open |
| Validation | ✅ Required Fields |
| Production URL | ✅ Live |

---

For integration issues, check browser Network tab for:
- Status Code
- Response Body
- CORS errors

