import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { google } from 'googleapis';

dotenv.config();

const app = express();

/* ==============================
   CORS CONFIGURATION
============================== */

const allowedOrigins = [
  "https://www.amitbuildingsolutions.in",
  "https://amitbuildingsolutions.in"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  }
}));
app.use(express.json());

/* ==============================
   GOOGLE SHEETS CONFIG
============================== */

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const SHEET_NAME = 'Contact Submissions - Amit Construction';

const auth = new google.auth.GoogleAuth({
  credentials: {
    type: 'service_account',
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n'),
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_CLIENT_ID,
  },
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

/* ==============================
   VALIDATION REGEX
============================== */

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneRegex = /^[6-9]\d{9}$/; // Indian 10-digit mobile

/* ==============================
   ROUTES
============================== */

app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running' });
});

app.post('/api/contact', async (req, res) => {
  try {
    const { fullName, phoneNumber, emailAddress, subject, message } = req.body;

    /* ========= Required Fields ========= */
    if (!fullName || !phoneNumber || !emailAddress || !subject || !message) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
    }

    /* ========= Full Name Validation ========= */
    if (fullName.trim().length < 3) {
      return res.status(400).json({
        success: false,
        error: 'Full name must be at least 3 characters'
      });
    }

    /* ========= Email Validation ========= */
    if (!emailRegex.test(emailAddress)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      });
    }

    /* ========= Phone Validation ========= */
    if (!phoneRegex.test(phoneNumber)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid phone number (must be 10 digits and start with 6-9)'
      });
    }

    /* ========= Message Validation ========= */
    if (message.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Message must be at least 10 characters'
      });
    }

    /* ========= Append to Google Sheet ========= */

    const values = [[
      fullName.trim(),
      phoneNumber,
      emailAddress.trim(),
      subject,
      message.trim(),
      new Date().toISOString().split('T')[0]
    ]];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `'${SHEET_NAME}'!A:F`,
      valueInputOption: 'USER_ENTERED',
      resource: { values },
    });

    return res.status(201).json({
      success: true,
      message: 'Saved successfully'
    });

  } catch (error) {
    console.error("FULL ERROR:", error);

    return res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default app;
