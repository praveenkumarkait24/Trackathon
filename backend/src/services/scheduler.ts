import { supabaseAdmin } from '../config/supabase.js';
import { sendEmail } from '../config/mailer.js';
import webpush from '../config/webpush.js';
import dotenv from 'dotenv';

dotenv.config();

// Helper to format reminder text (e.g. 1440 minutes -> "24 hours", 60 minutes -> "1 hour")
const formatOffset = (minutes: number): string => {
  if (minutes >= 1440) {
    const days = Math.round(minutes / 1440);
    return `${days} day${days > 1 ? 's' : ''}`;
  }
  if (minutes >= 60) {
    const hours = Math.round(minutes / 60);
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }
  return `${minutes} minute${minutes > 1 ? 's' : ''}`;
};

export const checkAndSendNotifications = async () => {
  console.log(`[Scheduler] Checking for upcoming events and reminders at ${new Date().toISOString()}`);
  
  try {
    // 1. Fetch all ongoing / upcoming hackathons
    const { data: hackathons, error: hackError } = await supabaseAdmin
      .from('hackathons')
      .select('*')
      .neq('status', 'completed')
      .neq('status', 'cancelled');

    if (hackError || !hackathons) {
      console.error('[Scheduler] Error fetching hackathons:', hackError);
      return;
    }

    for (const hack of hackathons) {
      // A. Check Registration Deadline
      if (hack.registration_deadline) {
        const deadline = new Date(hack.registration_deadline).getTime();
        await evaluateAndTrigger(
          [1440], // Default offset, resolved in evaluateAndTrigger if pref exists
          deadline,
          hack.id,
          null,
          'registration_deadline',
          `Registration Deadline for ${hack.name}`,
          `The registration deadline for **${hack.name}** is approaching! Make sure you submit your registration before it closes.`,
          `The registration deadline for ${hack.name} is in `,
          `/hackathons/${hack.id}`
        );
      }

      // B. Check Hackathon Start Date
      if (hack.start_date) {
        const startDate = new Date(hack.start_date).getTime();
        await evaluateAndTrigger(
          [1440],
          startDate,
          hack.id,
          null,
          'hackathon_start',
          `Hackathon Starting: ${hack.name}`,
          `Get ready! **${hack.name}** is starting soon. Check your team details and rounds schedule.`,
          `${hack.name} starts in `,
          `/hackathons/${hack.id}`
        );
      }
    }

    // 2. Fetch all rounds for ongoing/upcoming hackathons
    const { data: rounds, error: roundError } = await supabaseAdmin
      .from('hackathon_rounds')
      .select('*, hackathons!inner(status, name)')
      .neq('hackathons.status', 'completed')
      .neq('hackathons.status', 'cancelled')
      .neq('status', 'completed')
      .neq('status', 'qualified')
      .neq('status', 'not_qualified')
      .neq('status', 'cancelled')
      .neq('status', 'skipped');

    if (!roundError && rounds) {
      for (const round of rounds) {
        if (round.date) {
          const roundDate = new Date(round.date).getTime();
          await evaluateAndTrigger(
            [1440],
            roundDate,
            round.hackathon_id,
            round.id,
            'round_date',
            `Upcoming Round: ${round.round_name} (${round.hackathons.name})`,
            `Round **${round.round_name}** for **${round.hackathons.name}** is scheduled soon.\nVenue/Meeting Link: ${round.venue || round.meeting_link || 'N/A'}`,
            `Round ${round.round_name} for ${round.hackathons.name} is starting in `,
            `/hackathons/${round.hackathon_id}`
          );
        }
      }
    }
  } catch (error) {
    console.error('[Scheduler] Error running notification check:', error);
  }
};

const evaluateAndTrigger = async (
  offsets: number[],
  eventTimeMs: number,
  hackathonId: string,
  roundId: string | null,
  eventType: string,
  title: string,
  description: string,
  pushBodyPrefix: string,
  targetUrl: string
) => {
  const now = Date.now();
  if (now >= eventTimeMs) return; // Event is in the past

  // 1. Find the owner of the hackathon
  const { data: hackathon } = await supabaseAdmin
    .from('hackathons')
    .select('user_id')
    .eq('id', hackathonId)
    .maybeSingle();

  if (!hackathon) return;

  const ownerId = hackathon.user_id;

  // 2. Find teammates who have registered accounts
  const { data: teammates } = await supabaseAdmin
    .from('team_members')
    .select('user_id')
    .eq('hackathon_id', hackathonId)
    .not('user_id', 'is', null);

  const teammateIds = teammates?.map(t => t.user_id).filter(Boolean) || [];

  // Recipient user IDs (Owner + Teammates)
  const recipientIds = Array.from(new Set([ownerId, ...teammateIds]));

  for (const recipientId of recipientIds) {
    // 3. Get notification preferences for the recipient
    const { data: pref } = await supabaseAdmin
      .from('notification_preferences')
      .select('*')
      .eq('user_id', recipientId)
      .maybeSingle();

    // Default notifications to true if no preference row exists yet
    const emailEnabled = pref ? pref.email_enabled : true;
    const pushEnabled = pref ? pref.push_enabled : true;
    const activeOffsets = pref ? pref.reminder_offsets : offsets;

    if (!emailEnabled && !pushEnabled) continue; // Skip if all notifications disabled

    // Fetch user details for sending
    const { data: userData } = await supabaseAdmin.auth.admin.getUserById(recipientId);
    if (!userData || !userData.user || !userData.user.email) continue;

    const userEmail = userData.user.email;
    const userName = userData.user.user_metadata?.full_name || 'Student';

    for (const offset of activeOffsets) {
      const offsetMs = offset * 60 * 1000;
      const targetReminderTime = eventTimeMs - offsetMs;
      
      const isWithinWindow = now >= targetReminderTime && now < targetReminderTime + 15 * 60 * 1000;

      if (isWithinWindow) {
        // Check if reminder was already sent to this recipient
        const query = supabaseAdmin
          .from('sent_reminders')
          .select('id')
          .eq('user_id', recipientId)
          .eq('hackathon_id', hackathonId)
          .eq('event_type', eventType)
          .eq('offset_minutes', offset);
          
        if (roundId) {
          query.eq('round_id', roundId);
        } else {
          query.is('round_id', null);
        }

        const { data: alreadySent } = await query.maybeSingle();

        if (!alreadySent) {
          console.log(`[Scheduler] Triggering reminder for Recipient: ${recipientId}, Event: ${eventType}, Offset: ${offset} mins`);
          const timeRemaining = formatOffset(offset);

          // 1. Send Email Notification
          if (emailEnabled) {
            const emailSubject = `Trackathon: ${title} in ${timeRemaining}`;
            const emailHtml = `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
                <h2 style="color: #4f46e5; margin-top: 0;">Trackathon Reminder</h2>
                <p>Hi ${userName},</p>
                <p>${description}</p>
                <p style="font-size: 16px; font-weight: bold; color: #1e1b4b;">This event is starting in approximately ${timeRemaining}.</p>
                <div style="margin: 25px 0;">
                  <a href="${process.env.FRONTEND_URL || 'https://trackathon-blush.vercel.app'}${targetUrl}" style="background-color: #4f46e5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">View Details on Trackathon</a>
                </div>
                <hr style="border: 0; border-top: 1px solid #eaeaea;" />
                <p style="font-size: 12px; color: #6b7280;">You received this because email notifications are enabled in your settings. You can modify these configurations anytime.</p>
              </div>
            `;
            try {
              await sendEmail(userEmail, emailSubject, emailHtml);
            } catch (err) {
              console.error(`[Scheduler] Email sending failed to ${userEmail}:`, err);
            }
          }

          // 2. Send Browser Push Notification
          if (pushEnabled) {
            const { data: subscriptions } = await supabaseAdmin
              .from('push_subscriptions')
              .select('*')
              .eq('user_id', recipientId);

            if (subscriptions && subscriptions.length > 0) {
              const pushPayload = JSON.stringify({
                title,
                body: `${pushBodyPrefix}${timeRemaining}.`,
                url: targetUrl
              });

              for (const sub of subscriptions) {
                const pushSubscription = {
                  endpoint: sub.endpoint,
                  keys: {
                    p256dh: sub.p256dh,
                    auth: sub.auth
                  }
                };
                try {
                  await webpush.sendNotification(pushSubscription, pushPayload);
                } catch (err: any) {
                  if (err.statusCode === 404 || err.statusCode === 410) {
                    console.log(`[Scheduler] Purging stale push subscription: ${sub.id}`);
                    await supabaseAdmin.from('push_subscriptions').delete().eq('id', sub.id);
                  } else {
                    console.error('[Scheduler] Push notification send failure:', err);
                  }
                }
              }
            }
          }

          // 3. Mark reminder as sent
          await supabaseAdmin.from('sent_reminders').insert({
            user_id: recipientId,
            hackathon_id: hackathonId,
            round_id: roundId,
            event_type: eventType,
            offset_minutes: offset
          });
        }
      }
    }
  }
};

export default { checkAndSendNotifications };
