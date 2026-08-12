import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { supabaseAdmin } from '../config/supabase.js';
import { sendEmail } from '../config/mailer.js';
import { syncAllHackathonEventsForUser } from '../services/calendar.js';

export const getTeamMembers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id: hackathonId } = req.params;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Fetch hackathon details
    const { data: hackathon, error: fetchErr } = await supabaseAdmin
      .from('hackathons')
      .select('id, user_id')
      .eq('id', hackathonId)
      .maybeSingle();

    if (fetchErr || !hackathon) {
      return res.status(404).json({ error: 'Hackathon not found.' });
    }

    const isOwner = hackathon.user_id === userId;
    let isTeammate = false;

    if (!isOwner) {
      const { data: memberRecord } = await supabaseAdmin
        .from('team_members')
        .select('id')
        .eq('hackathon_id', hackathonId)
        .eq('user_id', userId)
        .maybeSingle();
      if (memberRecord) {
        isTeammate = true;
      }
    }

    if (!isOwner && !isTeammate) {
      return res.status(403).json({ error: 'Access denied: you are not a member of this team.' });
    }

    const { data: members, error } = await supabaseAdmin
      .from('team_members')
      .select('*')
      .eq('hackathon_id', hackathonId);

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch team members: ' + error.message });
    }

    res.json(members);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateTeamMembers = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id: hackathonId } = req.params;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { members } = req.body;

    // Verify ownership of the hackathon
    const { data: hackathon, error: fetchErr } = await supabaseAdmin
      .from('hackathons')
      .select('id')
      .eq('id', hackathonId)
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchErr || !hackathon) {
      return res.status(404).json({ error: 'Hackathon not found or access denied.' });
    }

    // Delete existing team members to replace them
    const { error: deleteErr } = await supabaseAdmin
      .from('team_members')
      .delete()
      .eq('hackathon_id', hackathonId);

    if (deleteErr) {
      return res.status(500).json({ error: 'Failed to purge old team records: ' + deleteErr.message });
    }

    if (members && members.length > 0) {
      const dbInserts = members.map((m: any) => ({
        hackathon_id: hackathonId,
        name: m.name,
        email: m.email || null,
        college: m.college || null,
        department: m.department || null,
        role: m.role || null
      }));

      const { data: newMembers, error: insertErr } = await supabaseAdmin
        .from('team_members')
        .insert(dbInserts)
        .select();

      if (insertErr) {
        return res.status(500).json({ error: 'Failed to insert team members: ' + insertErr.message });
      }

      return res.json(newMembers);
    }

    res.json([]);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getHackathonJoinInfo = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    
    const { data: hackathon, error } = await supabaseAdmin
      .from('hackathons')
      .select('id, name, organizer, team_name, team_size, participation_type')
      .eq('id', id)
      .maybeSingle();

    if (error || !hackathon) {
      return res.status(404).json({ error: 'Hackathon not found' });
    }

    if (hackathon.participation_type !== 'team') {
      return res.status(400).json({ error: 'This hackathon is not configured for teams.' });
    }

    res.json(hackathon);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const joinTeam = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { role } = req.body;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    if (!role) return res.status(400).json({ error: 'Role is required to join a team.' });

    // 1. Fetch Hackathon details
    const { data: hackathon, error: fetchErr } = await supabaseAdmin
      .from('hackathons')
      .select('id, user_id, team_size, participation_type')
      .eq('id', id)
      .maybeSingle();

    if (fetchErr || !hackathon) {
      return res.status(404).json({ error: 'Hackathon not found.' });
    }

    if (hackathon.participation_type !== 'team') {
      return res.status(400).json({ error: 'Cannot join an individual hackathon.' });
    }

    // 2. Check if user is the lead/owner
    if (hackathon.user_id === userId) {
      return res.status(400).json({ error: 'You are the team lead of this hackathon.' });
    }

    // 3. Check if user is already on the team
    const { data: existingMember } = await supabaseAdmin
      .from('team_members')
      .select('id')
      .eq('hackathon_id', id)
      .eq('user_id', userId)
      .maybeSingle();

    if (existingMember) {
      return res.status(400).json({ error: 'You have already joined this team.' });
    }

    // 4. Check if team size limit is reached
    const { data: members, error: membersErr } = await supabaseAdmin
      .from('team_members')
      .select('id')
      .eq('hackathon_id', id);

    if (membersErr) {
      return res.status(500).json({ error: 'Failed to verify team size: ' + membersErr.message });
    }

    const currentSize = (members?.length || 0) + 1; // +1 for the lead/owner
    const maxSize = hackathon.team_size || 1;

    if (currentSize >= maxSize) {
      return res.status(400).json({ error: 'Team is already full.' });
    }

    // 5. Fetch user profile and email to populate details
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('full_name, college, department')
      .eq('id', userId)
      .maybeSingle();

    const { data: userData } = await supabaseAdmin.auth.admin.getUserById(userId);
    const email = userData?.user?.email;

    const fullName = profile?.full_name || userData?.user?.user_metadata?.full_name || email?.split('@')[0] || 'Teammate';
    const college = profile?.college || null;
    const department = profile?.department || null;

    if (!profile) {
      // Auto-create a stub profile for smooth joining
      const { error: stubErr } = await supabaseAdmin.from('profiles').insert({
        id: userId,
        full_name: fullName,
        college: college,
        department: department
      });
      if (stubErr) {
        console.error('Failed to auto-create stub profile:', stubErr);
      }
    }

    // 6. Insert new team member record
    const { data: newMember, error: insertErr } = await supabaseAdmin
      .from('team_members')
      .insert({
        hackathon_id: id,
        user_id: userId,
        name: fullName,
        email: email || null,
        college: college,
        department: department,
        role: role
      })
      .select()
      .single();

    if (insertErr) {
      return res.status(500).json({ error: 'Failed to join team: ' + insertErr.message });
    }

    // Sync all existing hackathon calendar events to the new teammate
    await syncAllHackathonEventsForUser(userId, id).catch(err => console.error('Failed to sync events for joining user:', err));

    res.status(201).json(newMember);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const addTeamMemberManually = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id: hackathonId } = req.params;
    const { name, email, role, college, department } = req.body;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    if (!name) return res.status(400).json({ error: 'Name is required' });

    // 1. Verify ownership of the hackathon and get team size limit
    const { data: hackathon, error: fetchErr } = await supabaseAdmin
      .from('hackathons')
      .select('id, team_size, participation_type')
      .eq('id', hackathonId)
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchErr || !hackathon) {
      return res.status(404).json({ error: 'Hackathon not found or access denied.' });
    }

    if (hackathon.participation_type !== 'team') {
      return res.status(400).json({ error: 'This hackathon is not configured for teams.' });
    }

    // 2. Check if team size limit is reached
    const { data: members, error: membersErr } = await supabaseAdmin
      .from('team_members')
      .select('id')
      .eq('hackathon_id', hackathonId);

    if (membersErr) {
      return res.status(500).json({ error: 'Failed to verify team size: ' + membersErr.message });
    }

    const currentSize = (members?.length || 0) + 1; // +1 for lead/owner
    const maxSize = hackathon.team_size || 1;

    if (currentSize >= maxSize) {
      return res.status(400).json({ error: `Team size limit of ${maxSize} reached.` });
    }

    // 3. Find if user exists by email to pre-link user_id
    let registeredUserId: string | null = null;
    if (email) {
      const { data: usersData } = await supabaseAdmin.auth.admin.listUsers();
      if (usersData?.users) {
        const targetEmail = email.trim().toLowerCase();
        const foundUser = usersData.users.find(u => u.email?.toLowerCase() === targetEmail);
        if (foundUser) {
          registeredUserId = foundUser.id;
        }
      }
    }

    // 4. Insert teammate
    const { data: newMember, error: insertErr } = await supabaseAdmin
      .from('team_members')
      .insert({
        hackathon_id: hackathonId,
        user_id: registeredUserId,
        name: name.trim(),
        email: email ? email.trim() : null,
        college: college ? college.trim() : null,
        department: department ? department.trim() : null,
        role: role ? role.trim() : null
      })
      .select()
      .single();

    if (insertErr) {
      return res.status(500).json({ error: 'Failed to add team member: ' + insertErr.message });
    }

    if (registeredUserId) {
      // Sync existing calendar events to the newly added teammate
      await syncAllHackathonEventsForUser(registeredUserId, hackathonId).catch(err => console.error('Failed to sync events for manually added user:', err));
    }

    res.status(201).json(newMember);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const inviteTeamMemberByEmail = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id: hackathonId } = req.params;
    const { email } = req.body;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    if (!email) return res.status(400).json({ error: 'Email is required' });

    // 1. Verify ownership of the hackathon
    const { data: hackathon, error: fetchErr } = await supabaseAdmin
      .from('hackathons')
      .select('id, name, organizer, team_name')
      .eq('id', hackathonId)
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchErr || !hackathon) {
      return res.status(404).json({ error: 'Hackathon not found or access denied.' });
    }

    const { data: senderProfile } = await supabaseAdmin
      .from('profiles')
      .select('full_name')
      .eq('id', userId)
      .maybeSingle();

    const senderName = senderProfile?.full_name || 'Your team lead';
    const inviteUrl = `${process.env.FRONTEND_URL || 'https://trackathon-blush.vercel.app'}/hackathons/${hackathonId}/join`;

    // 2. Send Invitation Email
    const emailSubject = `Invitation to join team "${hackathon.team_name || 'Trackathon Team'}" for ${hackathon.name}`;
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px;">
        <h2 style="color: #4f46e5; margin-top: 0;">Trackathon Team Invitation</h2>
        <p>Hi,</p>
        <p><strong>${senderName}</strong> has invited you to join their team <strong>"${hackathon.team_name || 'Trackathon Team'}"</strong> for the upcoming hackathon <strong>${hackathon.name}</strong> (organized by ${hackathon.organizer}).</p>
        <div style="margin: 25px 0;">
          <a href="${inviteUrl}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Accept Invitation & Join Team</a>
        </div>
        <p style="font-size: 12px; color: #6b7280;">If you don't have a Trackathon account yet, you will be guided to create one before joining the team.</p>
        <hr style="border: 0; border-top: 1px solid #eaeaea;" />
        <p style="font-size: 11px; color: #9ca3af;">This email was generated automatically by Trackathon.</p>
      </div>
    `;

    await sendEmail(email.trim(), emailSubject, emailHtml);

    res.json({ message: 'Invitation email sent successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteTeamMember = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id: hackathonId, memberId } = req.params;

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // 1. Verify ownership of the hackathon
    const { data: hackathon, error: fetchErr } = await supabaseAdmin
      .from('hackathons')
      .select('id')
      .eq('id', hackathonId)
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchErr || !hackathon) {
      return res.status(404).json({ error: 'Hackathon not found or access denied.' });
    }

    // 2. Delete team member
    const { error: deleteErr } = await supabaseAdmin
      .from('team_members')
      .delete()
      .eq('id', memberId)
      .eq('hackathon_id', hackathonId);

    if (deleteErr) {
      return res.status(500).json({ error: 'Failed to delete team member: ' + deleteErr.message });
    }

    res.json({ message: 'Team member removed successfully.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export default { 
  getTeamMembers, 
  updateTeamMembers, 
  getHackathonJoinInfo, 
  joinTeam, 
  addTeamMemberManually, 
  inviteTeamMemberByEmail, 
  deleteTeamMember 
};
