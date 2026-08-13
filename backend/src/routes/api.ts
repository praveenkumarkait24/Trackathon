import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { validateBody } from '../middleware/validation.js';
import {
  profileSchema,
  hackathonSchema,
  roundSchema,
  teamMembersListSchema,
  achievementSchema,
  notificationPreferencesSchema,
  pushSubscriptionSchema,
} from '../utils/validators.js';

import authController from '../controllers/auth.js';
import profileController from '../controllers/profile.js';
import hackathonsController from '../controllers/hackathons.js';
import roundsController from '../controllers/rounds.js';
import teamController from '../controllers/team.js';
import achievementsController from '../controllers/achievements.js';
import settingsController from '../controllers/settings.js';

const router = Router();

// Public Google Calendar callback endpoint
router.get('/calendar/callback', authController.handleCallback);

// --- Protected Routes (Require Valid Supabase JWT Bearer Token) ---
router.use(requireAuth);

// Google Calendar OAuth Auth URL generation
router.get('/calendar/auth-url', authController.getAuthUrl);
router.post('/calendar/save-provider-token', authController.saveProviderToken);

// Profile Endpoints
router.get('/profile', profileController.getProfile);
router.put('/profile', validateBody(profileSchema), profileController.updateProfile);
router.post('/profile/avatar', profileController.avatarUpload.single('avatar'), profileController.uploadAvatar);

// Hackathon Endpoints
router.get('/hackathons', hackathonsController.getHackathons);
router.post('/hackathons', validateBody(hackathonSchema), hackathonsController.createHackathon);
router.get('/hackathons/:id', hackathonsController.getHackathonById);
router.put('/hackathons/:id', validateBody(hackathonSchema), hackathonsController.updateHackathon);
router.delete('/hackathons/:id', hackathonsController.deleteHackathon);
router.post('/hackathons/:id/poster', hackathonsController.posterUpload.single('poster'), hackathonsController.uploadPoster);

// Hackathon Round Endpoints (progression is checked in the controller)
router.get('/hackathons/:id/rounds', roundsController.getRounds);
router.post('/hackathons/:id/rounds', validateBody(roundSchema), roundsController.createRound);
router.put('/hackathons/:id/rounds/:roundId', validateBody(roundSchema), roundsController.updateRound);
router.delete('/hackathons/:id/rounds/:roundId', roundsController.deleteRound);

// Team Members Endpoints
router.get('/hackathons/:id/team', teamController.getTeamMembers);
router.post('/hackathons/:id/team', validateBody(teamMembersListSchema), teamController.updateTeamMembers);
router.get('/hackathons/:id/join-info', teamController.getHackathonJoinInfo);
router.post('/hackathons/:id/join', teamController.joinTeam);
router.post('/hackathons/:id/team/member', teamController.addTeamMemberManually);
router.post('/hackathons/:id/team/invite', teamController.inviteTeamMemberByEmail);
router.delete('/hackathons/:id/team/member/:memberId', teamController.deleteTeamMember);
router.delete('/hackathons/:id/team/member/by-email', teamController.deleteTeamMemberByEmail);

// Achievements & Proofs Endpoints
router.get('/hackathons/:id/achievements', achievementsController.getAchievement);
router.post('/hackathons/:id/achievements', validateBody(achievementSchema), achievementsController.saveAchievement);
router.post('/hackathons/:id/proofs', achievementsController.proofUpload.single('file'), achievementsController.uploadProof);

// User Notification Preferences and Push Registration Settings
router.get('/settings/notifications', settingsController.getNotificationPreferences);
router.put('/settings/notifications', validateBody(notificationPreferencesSchema), settingsController.updateNotificationPreferences);
router.post('/notifications/subscribe', validateBody(pushSubscriptionSchema), settingsController.subscribePush);

export default router;
