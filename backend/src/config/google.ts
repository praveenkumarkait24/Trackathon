import { google } from 'googleapis';
import dotenv from 'dotenv';

dotenv.config();

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
const googleRedirectUri = process.env.GOOGLE_REDIRECT_URI;

export const getGoogleOAuthClient = () => {
  if (!googleClientId || !googleClientSecret || !googleRedirectUri) {
    throw new Error('Google OAuth environment variables are missing.');
  }

  return new google.auth.OAuth2(
    googleClientId,
    googleClientSecret,
    googleRedirectUri
  );
};
