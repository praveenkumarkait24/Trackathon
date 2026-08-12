import webpush from 'web-push';
import dotenv from 'dotenv';

dotenv.config();

const vapidSubject = process.env.VAPID_SUBJECT;
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

if (vapidSubject && vapidPublicKey && vapidPrivateKey) {
  webpush.setVapidDetails(vapidSubject, vapidPublicKey, vapidPrivateKey);
} else {
  console.warn('WARNING: VAPID details for Web Push notifications are incomplete. Push notifications will fail.');
}

export default webpush;
