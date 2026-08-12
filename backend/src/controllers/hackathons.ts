import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { supabaseAdmin, ensureBucketExists } from '../config/supabase.js';
import { syncEventForTeam, deleteEventForTeam } from '../services/calendar.js';
import multer from 'multer';

// Poster upload configurations
export const posterUpload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB maximum size
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid poster image format. Only JPEG, PNG, and WEBP are accepted.'));
    }
  }
});

export const getHackathons = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { search, status, mode, participation_type, domain, technology, result } = req.query;

    // Fetch teammate hackathon IDs
    const { data: memberRecords } = await supabaseAdmin
      .from('team_members')
      .select('hackathon_id')
      .eq('user_id', userId);
      
    const memberHackathonIds = memberRecords?.map(m => m.hackathon_id) || [];

    let query = supabaseAdmin
      .from('hackathons')
      .select('*, achievements(result)')
      .order('created_at', { ascending: false });

    if (memberHackathonIds.length > 0) {
      query = query.or(`user_id.eq.${userId},id.in.(${memberHackathonIds.map(id => `"${id}"`).join(',')})`);
    } else {
      query = query.eq('user_id', userId);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,organizer.ilike.%${search}%`);
    }
    if (status) {
      query = query.eq('status', status);
    }
    if (mode) {
      query = query.eq('mode', mode);
    }
    if (participation_type) {
      query = query.eq('participation_type', participation_type);
    }
    if (domain) {
      query = query.ilike('domain', `%${domain}%`);
    }
    if (technology) {
      query = query.ilike('technology', `%${technology}%`);
    }

    const { data, error } = await query;
    if (error) {
      return res.status(500).json({ error: 'Failed to fetch hackathons: ' + error.message });
    }

    let filteredData = data || [];
    
    // Filter by result (which is stored in the nested achievements table relation)
    if (result) {
      filteredData = filteredData.filter((h: any) => h.achievements?.result === result);
    }

    res.json(filteredData);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const getHackathonById = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { data: hackathon, error } = await supabaseAdmin
      .from('hackathons')
      .select('*, achievements(*), hackathon_rounds(*), team_members(*)')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch hackathon details: ' + error.message });
    }

    if (!hackathon) {
      return res.status(404).json({ error: 'Hackathon not found.' });
    }

    // Verify owner OR teammate
    const isOwner = hackathon.user_id === userId;
    const isTeammate = hackathon.team_members?.some((m: any) => m.user_id === userId);

    if (!isOwner && !isTeammate) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    // Sort rounds by round_number for display
    if (hackathon.hackathon_rounds) {
      hackathon.hackathon_rounds.sort((a: any, b: any) => a.round_number - b.round_number);
    }

    res.json(hackathon);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createHackathon = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const hackathonData = req.body;

    const { data: hackathon, error } = await supabaseAdmin
      .from('hackathons')
      .insert({
        ...hackathonData,
        user_id: userId,
        status: hackathonData.status || 'upcoming'
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to create hackathon: ' + error.message });
    }

    // Google Calendar Sync
    if (hackathon) {
      // Registration Deadline Sync
      if (hackathon.registration_deadline) {
        const deadline = new Date(hackathon.registration_deadline);
        const end = new Date(deadline.getTime() + 60 * 60 * 1000); // +1 hour duration
        await syncEventForTeam(hackathon.id, null, 'registration_deadline', {
          summary: `[Trackathon] ${hackathon.name} - Registration Deadline`,
          description: `Deadline to register for the hackathon organized by ${hackathon.organizer}.\nLink: ${hackathon.registration_link || 'N/A'}`,
          startDate: deadline,
          endDate: end,
        });
      }
      
      // Start Event Sync
      if (hackathon.start_date) {
        const start = new Date(hackathon.start_date);
        const end = hackathon.end_date ? new Date(hackathon.end_date) : new Date(start.getTime() + 2 * 60 * 60 * 1000); // default +2 hours
        await syncEventForTeam(hackathon.id, null, 'hackathon_start', {
          summary: `[Trackathon] ${hackathon.name} - Start`,
          description: `Hackathon event start organized by ${hackathon.organizer}.\nVenue/Location: ${hackathon.location || 'N/A'}`,
          startDate: start,
          endDate: end,
        });
      }
    }

    res.status(201).json(hackathon);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateHackathon = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const hackathonData = req.body;

    // Verify ownership
    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from('hackathons')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchErr || !existing) {
      return res.status(404).json({ error: 'Hackathon not found or access denied.' });
    }

    const { data: hackathon, error } = await supabaseAdmin
      .from('hackathons')
      .update({
        ...hackathonData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to update hackathon: ' + error.message });
    }

    // Sync updates to Google Calendar
    if (hackathon) {
      // 1. Sync Registration Deadline
      if (hackathon.registration_deadline) {
        const deadline = new Date(hackathon.registration_deadline);
        await syncEventForTeam(hackathon.id, null, 'registration_deadline', {
          summary: `[Trackathon] ${hackathon.name} - Registration Deadline`,
          description: `Deadline to register for the hackathon organized by ${hackathon.organizer}.\nLink: ${hackathon.registration_link || 'N/A'}`,
          startDate: deadline,
          endDate: new Date(deadline.getTime() + 60 * 60 * 1000),
        });
      } else {
        await deleteEventForTeam(hackathon.id, null, 'registration_deadline');
      }
 
      // 2. Sync Start & End Events
      if (hackathon.start_date) {
        const start = new Date(hackathon.start_date);
        const end = hackathon.end_date ? new Date(hackathon.end_date) : new Date(start.getTime() + 2 * 60 * 60 * 1000);
        await syncEventForTeam(hackathon.id, null, 'hackathon_start', {
          summary: `[Trackathon] ${hackathon.name} - Start`,
          description: `Hackathon event start organized by ${hackathon.organizer}.\nVenue/Location: ${hackathon.location || 'N/A'}`,
          startDate: start,
          endDate: end,
        });
      } else {
        await deleteEventForTeam(hackathon.id, null, 'hackathon_start');
      }
    }

    res.json(hackathon);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteHackathon = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Verify ownership
    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from('hackathons')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchErr || !existing) {
      return res.status(404).json({ error: 'Hackathon not found or access denied.' });
    }

    // Delete synced Google Calendar Events first
    await deleteEventForTeam(id, null);

    const { error: deleteErr } = await supabaseAdmin
      .from('hackathons')
      .delete()
      .eq('id', id);

    if (deleteErr) {
      return res.status(500).json({ error: 'Failed to delete hackathon: ' + deleteErr.message });
    }

    res.json({ success: true, message: 'Hackathon successfully deleted.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const uploadPoster = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Verify ownership
    const { data: hackathon, error: fetchErr } = await supabaseAdmin
      .from('hackathons')
      .select('id')
      .eq('id', id)
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchErr || !hackathon) {
      return res.status(404).json({ error: 'Hackathon not found or access denied.' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No poster file uploaded.' });
    }

    const file = req.file;
    const fileExtension = file.originalname.split('.').pop() || 'png';
    const filePath = `posters/${id}-${Date.now()}.${fileExtension}`;

    // Ensure storage bucket exists
    await ensureBucketExists('posters');

    // Upload to Storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from('posters')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true
      });

    if (uploadError) {
      return res.status(500).json({ error: 'Supabase storage poster upload failed: ' + uploadError.message });
    }

    // Get public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('posters')
      .getPublicUrl(filePath);

    // Save URL reference in database
    const { error: dbError } = await supabaseAdmin
      .from('hackathons')
      .update({
        poster_url: publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', id);

    if (dbError) {
      return res.status(500).json({ error: 'Failed to update poster database entry: ' + dbError.message });
    }

    res.json({ success: true, poster_url: publicUrl });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export default {
  getHackathons,
  getHackathonById,
  createHackathon,
  updateHackathon,
  deleteHackathon,
  uploadPoster,
  posterUpload
};
