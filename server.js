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
  'http://localhost:3000',
  'https://real-estate-two-sage.vercel.app',
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST'],
  })
);

app.use(express.json());

/* ==============================
   GOOGLE SHEETS CONFIG
============================== */

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID;
const SHEET_NAME = 'Contacts';

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
   ROUTES
============================== */

app.get('/api/health', (req, res) => {
  res.json({ status: 'Backend is running' });
});

app.post('/api/contact', async (req, res) => {
  try {
    const { fullName, phoneNumber, emailAddress, subject, message } = req.body;

    if (!fullName || !phoneNumber || !emailAddress || !subject || !message) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const values = [[
      fullName,
      phoneNumber,
      emailAddress,
      subject,
      message,
      new Date().toISOString()
    ]];

    await sheets.spreadsheets.values.append({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:F`,
      valueInputOption: 'USER_ENTERED',
      resource: { values },
    });

    res.status(201).json({
      success: true,
      message: 'Saved successfully'
    });

  } catch (error) {
    console.error("FULL ERROR:", error);

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default app;
