import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { code, redirectUri } = req.body;

    if (!code || !redirectUri) {
      return res.status(400).json({ error: 'Missing code or redirectUri' });
    }

    const clientId = process.env.VITE_GOOGLE_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
      console.error('Missing env vars');
      return res.status(500).json({ error: 'Server not configured' });
    }

    // Exchange code for token with Google
    const params = new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    });

    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: params.toString(),
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('Google error:', error);
      return res.status(400).json({ error: 'Token exchange failed', details: error });
    }

    const data = await tokenResponse.json();

    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json({
      success: true,
      access_token: data.access_token,
      refresh_token: data.refresh_token || null,
      expires_in: data.expires_in,
    });
  } catch (error) {
    console.error('Error:', error);
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(500).json({
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}
