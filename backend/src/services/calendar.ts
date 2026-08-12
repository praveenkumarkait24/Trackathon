import { google } from 'googleapis';
import { getGoogleOAuthClient } from '../config/google.js';
import { supabaseAdmin } from '../config/supabase.js';

interface EventData {
  summary: string;
  description: string;
  startDate: Date;
  endDate: Date;
}

export const getGoogleAuthClientForUser = async (userId: string) => {
  try {
    const { data: connection, error } = await supabaseAdmin
      .from('google_connections')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error || !connection) {
      return null;
    }

    const oauth2Client = getGoogleOAuthClient();
    oauth2Client.setCredentials({
      access_token: connection.access_token,
      refresh_token: connection.refresh_token,
      expiry_date: connection.expiry_date,
    });

    const isExpired = connection.expiry_date ? Number(connection.expiry_date) <= Date.now() + 60000 : true;

    if (isExpired && connection.refresh_token) {
      console.log(`Google Access Token expired for user ${userId}. Refreshing...`);
      const { credentials } = await oauth2Client.refreshAccessToken();
      
      const updatedExpiry = credentials.expiry_date || (Date.now() + 3600 * 1000);
      const updatedAccess = credentials.access_token || '';

      await supabaseAdmin
        .from('google_connections')
        .update({
          access_token: updatedAccess,
          expiry_date: updatedExpiry,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId);

      oauth2Client.setCredentials(credentials);
    }

    return oauth2Client;
  } catch (err) {
    console.error(`Error configuring Google Auth client for user ${userId}:`, err);
    return null;
  }
};

export const upsertGoogleCalendarEvent = async (
  userId: string,
  hackathonId: string,
  roundId: string | null,
  eventType: 'registration_deadline' | 'hackathon_start' | 'hackathon_end' | 'round_date' | 'round_submission',
  eventData: EventData
) => {
  try {
    // Check if calendar synchronization is enabled in settings
    const { data: prefs } = await supabaseAdmin
      .from('notification_preferences')
      .select('calendar_sync_enabled')
      .eq('user_id', userId)
      .maybeSingle();

    if (!prefs || !prefs.calendar_sync_enabled) {
      return;
    }

    const authClient = await getGoogleAuthClientForUser(userId);
    if (!authClient) {
      console.log(`Calendar sync skipped for user ${userId}: No active Google connection.`);
      return;
    }

    const calendar = google.calendar({ version: 'v3', auth: authClient });

    // Look up existing sync record
    const query = supabaseAdmin
      .from('calendar_events')
      .select('*')
      .eq('user_id', userId)
      .eq('hackathon_id', hackathonId)
      .eq('event_type', eventType);
      
    if (roundId) {
      query.eq('round_id', roundId);
    } else {
      query.is('round_id', null);
    }

    const { data: existingSync } = await query.maybeSingle();

    const gEvent = {
      summary: eventData.summary,
      description: eventData.description,
      start: {
        dateTime: eventData.startDate.toISOString(),
        timeZone: 'UTC',
      },
      end: {
        dateTime: eventData.endDate.toISOString(),
        timeZone: 'UTC',
      },
    };

    if (existingSync) {
      console.log(`Updating Google Calendar event: ${existingSync.google_event_id}`);
      try {
        await calendar.events.patch({
          calendarId: 'primary',
          eventId: existingSync.google_event_id,
          requestBody: gEvent,
        });
      } catch (err: any) {
        // If event not found on Google Calendar (manually deleted), create a new one
        if (err.code === 404 || err.code === 410) {
          const created = await calendar.events.insert({
            calendarId: 'primary',
            requestBody: gEvent,
          });
          if (created.data.id) {
            await supabaseAdmin
              .from('calendar_events')
              .update({
                google_event_id: created.data.id,
                updated_at: new Date().toISOString(),
              })
              .eq('id', existingSync.id);
          }
        } else {
          throw err;
        }
      }
    } else {
      console.log(`Creating Google Calendar event for user ${userId}, eventType: ${eventType}`);
      const created = await calendar.events.insert({
        calendarId: 'primary',
        requestBody: gEvent,
      });

      if (created.data.id) {
        await supabaseAdmin.from('calendar_events').insert({
          user_id: userId,
          hackathon_id: hackathonId,
          round_id: roundId,
          event_type: eventType,
          google_event_id: created.data.id,
        });
      }
    }
  } catch (err) {
    console.error(`Failed to upsert Google Calendar event for user ${userId}:`, err);
  }
};

export const deleteGoogleCalendarEvent = async (
  userId: string,
  hackathonId: string,
  roundId: string | null,
  eventType?: 'registration_deadline' | 'hackathon_start' | 'hackathon_end' | 'round_date' | 'round_submission'
) => {
  try {
    const authClient = await getGoogleAuthClientForUser(userId);
    if (!authClient) return;

    const calendar = google.calendar({ version: 'v3', auth: authClient });

    const query = supabaseAdmin
      .from('calendar_events')
      .select('*')
      .eq('user_id', userId)
      .eq('hackathon_id', hackathonId);

    if (roundId) {
      query.eq('round_id', roundId);
    }
    if (eventType) {
      query.eq('event_type', eventType);
    }

    const { data: syncs } = await query;
    if (!syncs || syncs.length === 0) return;

    for (const sync of syncs) {
      try {
        console.log(`Deleting Google Calendar event: ${sync.google_event_id}`);
        await calendar.events.delete({
          calendarId: 'primary',
          eventId: sync.google_event_id,
        });
      } catch (err: any) {
        if (err.code !== 404 && err.code !== 410) {
          console.error(`Google API calendar deletion failed for event ${sync.google_event_id}:`, err);
        }
      }

      await supabaseAdmin.from('calendar_events').delete().eq('id', sync.id);
    }
  } catch (err) {
    console.error(`Failed to delete Google Calendar event for user ${userId}:`, err);
  }
};

export const syncAllHackathonEventsForUser = async (userId: string, hackathonId: string) => {
  try {
    const { data: hackathon } = await supabaseAdmin
      .from('hackathons')
      .select('*')
      .eq('id', hackathonId)
      .maybeSingle();

    if (!hackathon) return;

    if (hackathon.registration_deadline) {
      const regDeadline = new Date(hackathon.registration_deadline);
      await upsertGoogleCalendarEvent(userId, hackathonId, null, 'registration_deadline', {
        summary: `[Deadline] Register for ${hackathon.name}`,
        description: `Registration deadline for ${hackathon.name} (Organized by ${hackathon.organizer}).\nWebsite: ${hackathon.website_url || 'N/A'}`,
        startDate: regDeadline,
        endDate: new Date(regDeadline.getTime() + 30 * 60 * 1000)
      });
    }

    if (hackathon.start_date && hackathon.end_date) {
      await upsertGoogleCalendarEvent(userId, hackathonId, null, 'hackathon_start', {
        summary: `[Start] ${hackathon.name}`,
        description: `Start of ${hackathon.name} (Organized by ${hackathon.organizer}).\nWebsite: ${hackathon.website_url || 'N/A'}`,
        startDate: new Date(hackathon.start_date),
        endDate: new Date(hackathon.end_date)
      });
    }

    const { data: rounds } = await supabaseAdmin
      .from('hackathon_rounds')
      .select('*')
      .eq('hackathon_id', hackathonId);

    if (rounds && rounds.length > 0) {
      for (const round of rounds) {
        if (round.date) {
          const roundDate = new Date(round.date);
          await upsertGoogleCalendarEvent(userId, hackathonId, round.id, 'round_date', {
            summary: `[Round ${round.round_number}] ${round.round_name} - ${hackathon.name}`,
            description: `${round.description || 'Event round'}\nVenue: ${round.venue || 'N/A'}`,
            startDate: roundDate,
            endDate: new Date(roundDate.getTime() + 60 * 60 * 1000)
          });
        }
      }
    }
  } catch (err) {
    console.error(`Failed to sync all hackathon events for user ${userId}:`, err);
  }
};

export const syncEventForTeam = async (
  hackathonId: string,
  roundId: string | null,
  eventType: 'registration_deadline' | 'hackathon_start' | 'hackathon_end' | 'round_date' | 'round_submission',
  eventData: EventData
) => {
  try {
    const { data: hackathon } = await supabaseAdmin
      .from('hackathons')
      .select('user_id')
      .eq('id', hackathonId)
      .maybeSingle();

    if (!hackathon) return;

    await upsertGoogleCalendarEvent(hackathon.user_id, hackathonId, roundId, eventType, eventData);

    const { data: teammates } = await supabaseAdmin
      .from('team_members')
      .select('user_id')
      .eq('hackathon_id', hackathonId)
      .neq('user_id', null);

    if (teammates && teammates.length > 0) {
      for (const mate of teammates) {
        if (mate.user_id) {
          await upsertGoogleCalendarEvent(mate.user_id, hackathonId, roundId, eventType, eventData);
        }
      }
    }
  } catch (err) {
    console.error(`Failed to sync event for team of hackathon ${hackathonId}:`, err);
  }
};

export const deleteEventForTeam = async (
  hackathonId: string,
  roundId: string | null,
  eventType?: 'registration_deadline' | 'hackathon_start' | 'hackathon_end' | 'round_date' | 'round_submission'
) => {
  try {
    const { data: hackathon } = await supabaseAdmin
      .from('hackathons')
      .select('user_id')
      .eq('id', hackathonId)
      .maybeSingle();

    if (!hackathon) return;

    await deleteGoogleCalendarEvent(hackathon.user_id, hackathonId, roundId, eventType);

    const { data: teammates } = await supabaseAdmin
      .from('team_members')
      .select('user_id')
      .eq('hackathon_id', hackathonId)
      .neq('user_id', null);

    if (teammates && teammates.length > 0) {
      for (const mate of teammates) {
        if (mate.user_id) {
          await deleteGoogleCalendarEvent(mate.user_id, hackathonId, roundId, eventType);
        }
      }
    }
  } catch (err) {
    console.error(`Failed to delete event for team of hackathon ${hackathonId}:`, err);
  }
};
