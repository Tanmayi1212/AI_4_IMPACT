import { NextResponse } from 'next/server';

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_REQUESTS = 8;
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;
const uploadRateLimitStore = globalThis.__uploadRateLimitStore || new Map();

if (!globalThis.__uploadRateLimitStore) {
  globalThis.__uploadRateLimitStore = uploadRateLimitStore;
}

function getClientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for') || '';
  const firstIp = forwarded.split(',')[0].trim();
  return firstIp || 'unknown';
}

function hitRateLimit(key) {
  const now = Date.now();
  const current = uploadRateLimitStore.get(key);

  if (!current || now - current.start >= RATE_LIMIT_WINDOW_MS) {
    uploadRateLimitStore.set(key, { count: 1, start: now });
    return false;
  }

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  current.count += 1;
  uploadRateLimitStore.set(key, current);
  return false;
}

export async function POST(request) {
  try {
    const clientIp = getClientIp(request);
    if (hitRateLimit(`upload:${clientIp}`)) {
      return NextResponse.json(
        { success: false, error: 'Too many upload attempts. Please retry in a minute.' },
        { status: 429 }
      );
    }

    const imgbbApiKey = process.env.IMGBB_API_KEY;
    if (!imgbbApiKey) {
      return NextResponse.json(
        { success: false, error: 'Upload service is not configured' },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("image");

    if (!file) {
      return NextResponse.json({ success: false, error: "No image file provided" }, { status: 400 });
    }

    if (!file.type?.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'Only image uploads are allowed' },
        { status: 400 }
      );
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json(
        { success: false, error: 'Image is too large. Max allowed size is 5MB.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64String = buffer.toString('base64');

    const bodyParams = new URLSearchParams();
    bodyParams.append("image", base64String);

    const imgbbReq = await fetch(
      `https://api.imgbb.com/1/upload?key=${imgbbApiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded"
        },
        body: bodyParams.toString()
      }
    );

    const imgbbRes = await imgbbReq.json();

    if (imgbbRes.success) {
      return NextResponse.json({ success: true, url: imgbbRes.data.url });
    }

    return NextResponse.json(
      { success: false, error: "Upload failed" },
      { status: 400 }
    );

  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Image upload failed. Please retry.' },
      { status: 500 }
    );
  }
}