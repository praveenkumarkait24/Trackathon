import { z } from 'zod';

const urlSchema = z.string().url().or(z.literal('')).nullable().optional();

export const profileSchema = z.object({
  full_name: z.string().min(1, 'Full name is required').max(100),
  college: z.string().max(150).optional().nullable(),
  department: z.string().max(100).optional().nullable(),
  academic_year: z.string().max(30).optional().nullable(),
  phone_number: z.string().max(20).optional().nullable(),
  github_profile: urlSchema,
  linkedin_profile: urlSchema,
  skills: z.array(z.string()).default([]),
});

export const hackathonSchema = z.object({
  name: z.string().min(1, 'Hackathon name is required').max(150),
  organizer: z.string().min(1, 'Organizer name is required').max(100),
  description: z.string().optional().nullable(),
  website_url: urlSchema,
  registration_link: urlSchema,
  registration_deadline: z.string().datetime({ precision: true }).or(z.string().pipe(z.coerce.date())).optional().nullable(),
  start_date: z.string().datetime({ precision: true }).or(z.string().pipe(z.coerce.date())).optional().nullable(),
  end_date: z.string().datetime({ precision: true }).or(z.string().pipe(z.coerce.date())).optional().nullable(),
  mode: z.enum(['online', 'offline', 'hybrid']),
  location: z.string().max(200).optional().nullable(),
  meeting_link: urlSchema,
  participation_type: z.enum(['individual', 'team']),
  team_name: z.string().max(100).optional().nullable(),
  team_size: z.number().int().min(1).optional().nullable(),
  domain: z.string().max(100).optional().nullable(),
  technology: z.string().max(100).optional().nullable(),
  prize_info: z.string().optional().nullable(),
  eligibility: z.string().optional().nullable(),
  rules_guidelines: z.string().optional().nullable(),
  status: z.enum(['upcoming', 'ongoing', 'completed', 'cancelled']).default('upcoming'),
}).refine((data) => {
  if (data.registration_deadline && data.start_date) {
    return new Date(data.registration_deadline) <= new Date(data.start_date);
  }
  return true;
}, {
  message: 'Registration deadline cannot occur after the event start date',
  path: ['registration_deadline'],
}).refine((data) => {
  if (data.start_date && data.end_date) {
    return new Date(data.start_date) <= new Date(data.end_date);
  }
  return true;
}, {
  message: 'Start date cannot occur after the end date',
  path: ['end_date'],
});

export const roundSchema = z.object({
  round_number: z.number().int().min(1, 'Round number must be at least 1'),
  round_name: z.string().min(1, 'Round name is required').max(100),
  description: z.string().optional().nullable(),
  date: z.string().datetime({ precision: true }).or(z.string().pipe(z.coerce.date())).optional().nullable(),
  start_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/, 'Invalid start time format (HH:MM)').optional().nullable(),
  end_time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)(:([0-5]\d))?$/, 'Invalid end time format (HH:MM)').optional().nullable(),
  venue: z.string().max(150).optional().nullable(),
  meeting_link: urlSchema,
  submission_link: urlSchema,
  instructions: z.string().optional().nullable(),
  status: z.enum(['upcoming', 'ongoing', 'completed', 'qualified', 'not_qualified', 'skipped', 'cancelled']).default('upcoming'),
});

export const teamMemberSchema = z.object({
  name: z.string().min(1, 'Teammate name is required').max(100),
  email: z.string().email('Invalid teammate email').or(z.literal('')).optional().nullable(),
  college: z.string().max(150).optional().nullable(),
  department: z.string().max(100).optional().nullable(),
  role: z.string().max(50).optional().nullable(),
});

export const teamMembersListSchema = z.object({
  members: z.array(teamMemberSchema)
});

export const achievementSchema = z.object({
  result: z.enum(['winner', 'runner_up', 'finalist', 'participant', 'no_result', 'other']),
  github_repo: urlSchema,
  project_url: urlSchema,
  demo_url: urlSchema,
  notes: z.string().optional().nullable(),
});

export const notificationPreferencesSchema = z.object({
  push_enabled: z.boolean(),
  email_enabled: z.boolean(),
  calendar_sync_enabled: z.boolean(),
  reminder_offsets: z.array(z.number().int().min(1)).default([1440]),
});

export const pushSubscriptionSchema = z.object({
  endpoint: z.string().url('Invalid push endpoint'),
  keys: z.object({
    p256dh: z.string().min(1, 'Keys p256dh is required'),
    auth: z.string().min(1, 'Keys auth is required'),
  }),
});
