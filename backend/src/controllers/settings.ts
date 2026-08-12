import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { supabaseAdmin } from '../config/supabase.js';

export const getNotificationPreferences = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { data, error } = await supabaseAdmin
      .from('notification_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch preferences: ' + error.message });
    }

    if (!data) {
      // Return default configuration if not found
      return res.json({
        user_id: userId,
        push_enabled: true,
        email_enabled: true,
        calendar_sync_enabled: true,
        reminder_offsets: [1440]
      });
    }

    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateNotificationPreferences = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const preferencesData = req.body;

    const { data, error } = await supabaseAdmin
      .from('notification_preferences')
      .upsert({
        user_id: userId,
        ...preferencesData,
        updated_at: new Date().toISOString()
      }, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to update preferences: ' + error.message });
    }

    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const subscribePush = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { endpoint, keys } = req.body;

    const { data, error } = await supabaseAdmin
      .from('push_subscriptions')
      .upsert({
        user_id: userId,
        endpoint,
        p256dh: keys.p256dh,
        auth: keys.auth
      }, { onConflict: 'endpoint' })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to register push subscription: ' + error.message });
    }

    res.status(201).json({ success: true, data });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export default { getNotificationPreferences, updateNotificationPreferences, subscribePush };
