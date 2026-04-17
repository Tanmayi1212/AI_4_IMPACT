import { NextResponse } from "next/server";

// To make this fully operational you need a Service Account JSON.
// Set these in .env:
// GOOGLE_CLIENT_EMAIL=your-service-account-email@...
// GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
// GOOGLE_SHEET_ID=1abcXYZ_your_sheet_id

export async function POST(request) {
  try {
    const { teamId, teamName, problemStatementId, leadName, timestamp } = await request.json();

    const clientEmail = process.env.GOOGLE_CLIENT_EMAIL;
    const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    const sheetId = process.env.GOOGLE_SHEET_ID;

    if (!clientEmail || !privateKey || !sheetId) {
      console.warn("GSheet Sync: Credentials not found, skipping sync.");
      return NextResponse.json({ success: true, message: "Skipped (no config)" });
    }

    // Google OAuth via JWT
    const { google } = await import('googleapis');
    const auth = new google.auth.JWT(
      clientEmail,
      null,
      privateKey,
      ['https://www.googleapis.com/auth/spreadsheets']
    );

    const sheets = google.sheets({ version: 'v4', auth });
    
    // Problem selection sync writes into Sheet2.
    await sheets.spreadsheets.values.append({
      spreadsheetId: sheetId,
      range: 'Sheet2!A:E',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          timestamp,
          teamId,
          teamName,
          leadName,
          problemStatementId
        ]],
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("GSheet Sync Error:", error);
    return NextResponse.json({ success: false, error: "Failed to sync" }, { status: 500 });
  }
}
