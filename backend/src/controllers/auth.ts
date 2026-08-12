import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { getGoogleOAuthClient } from '../config/google.js';
import { supabaseAdmin } from '../config/supabase.js';

export const getAuthUrl = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: Missing user session' });
    }

    const oauth2Client = getGoogleOAuthClient();
    const url = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: ['https://www.googleapis.com/auth/calendar.events'],
      state: userId, // pass userId in state to identify on callback
      prompt: 'consent', // force consent to receive refresh token
    });

    res.json({ url });
  } catch (error: any) {
    console.error('Error generating Google Calendar Auth URL:', error);
    res.status(500).json({ error: error.message || 'Failed to generate calendar authentication URL' });
  }
};

export const handleCallback = async (req: any, res: Response) => {
  try {
    const { code, state: userId } = req.query;

    if (!code || !userId) {
      return res.status(400).send('Authorization code or user identifier is missing.');
    }

    const oauth2Client = getGoogleOAuthClient();
    const { tokens } = await oauth2Client.getToken(code as string);

    if (!tokens.access_token) {
      return res.status(400).send('Google did not return an access token.');
    }

    const connectionData: any = {
      user_id: userId as string,
      access_token: tokens.access_token,
      expiry_date: tokens.expiry_date,
      updated_at: new Date().toISOString(),
    };

    // Google only sends the refresh_token during the FIRST consent prompt.
    if (tokens.refresh_token) {
      connectionData.refresh_token = tokens.refresh_token;
    }

    // Upsert token record using the admin client
    const { error } = await supabaseAdmin
      .from('google_connections')
      .upsert(connectionData, { onConflict: 'user_id' });

    if (error) {
      console.error('Database connection error saving Google credentials:', error);
      return res.status(500).send('Internal database error: ' + error.message);
    }

    const frontendUrl = process.env.FRONTEND_URL || 'https://trackathon-blush.vercel.app';
    res.redirect(`${frontendUrl}/settings?google_connected=success`);
  } catch (error: any) {
    console.error('Google OAuth redirect callback handling failed:', error);
    res.status(500).send('Internal validation failed during authentication: ' + error.message);
  }
};
export default { getAuthUrl, handleCallback };
