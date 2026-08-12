import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { supabaseAdmin } from '../config/supabase.js';
import { syncEventForTeam, deleteEventForTeam } from '../services/calendar.js';

export const getRounds = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id: hackathonId } = req.params;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

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

    const { data: rounds, error } = await supabaseAdmin
      .from('hackathon_rounds')
      .select('*')
      .eq('hackathon_id', hackathonId)
      .order('round_number', { ascending: true });

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch rounds: ' + error.message });
    }

    res.json(rounds);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const createRound = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id: hackathonId } = req.params;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const roundData = req.body;
    const roundNumber = Number(roundData.round_number);

    // Verify ownership of the hackathon
    const { data: hackathon, error: fetchErr } = await supabaseAdmin
      .from('hackathons')
      .select('name')
      .eq('id', hackathonId)
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchErr || !hackathon) {
      return res.status(404).json({ error: 'Hackathon not found or access denied.' });
    }

    // Business Rule check for Round Progression
    if (roundNumber > 1) {
      const { data: prevRound, error: prevErr } = await supabaseAdmin
        .from('hackathon_rounds')
        .select('status')
        .eq('hackathon_id', hackathonId)
        .eq('round_number', roundNumber - 1)
        .maybeSingle();

      if (prevErr) {
        return res.status(500).json({ error: 'Database check failed: ' + prevErr.message });
      }

      if (!prevRound || !['completed', 'qualified'].includes(prevRound.status)) {
        return res.status(400).json({
          error: `Round progression violation: Cannot add Round ${roundNumber}. The previous Round ${roundNumber - 1} must exist and its status must be 'completed' or 'qualified' (current: ${prevRound ? prevRound.status : 'does not exist'}).`
        });
      }
    }

    const { data: round, error } = await supabaseAdmin
      .from('hackathon_rounds')
      .insert({
        ...roundData,
        hackathon_id: hackathonId,
        status: roundData.status || 'upcoming'
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to create round: ' + error.message });
    }

    // Sync to Google Calendar
    if (round && round.date) {
      const roundDate = new Date(round.date);
      // Create a default 1-hour window for the event
      const end = new Date(roundDate.getTime() + 60 * 60 * 1000);
      
      await syncEventForTeam(hackathonId, round.id, 'round_date', {
        summary: `[Trackathon] ${hackathon.name} - ${round.round_name}`,
        description: `Round details:\nDescription: ${round.description || 'N/A'}\nVenue/Meeting link: ${round.venue || round.meeting_link || 'N/A'}`,
        startDate: roundDate,
        endDate: end,
      });
    }

    res.status(201).json(round);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateRound = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id: hackathonId, roundId } = req.params;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const roundData = req.body;
    const newStatus = roundData.status;

    // Verify ownership of the hackathon & round
    const { data: hackathon, error: fetchErr } = await supabaseAdmin
      .from('hackathons')
      .select('name')
      .eq('id', hackathonId)
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchErr || !hackathon) {
      return res.status(404).json({ error: 'Hackathon not found or access denied.' });
    }

    const { data: currentRound, error: roundErr } = await supabaseAdmin
      .from('hackathon_rounds')
      .select('*')
      .eq('id', roundId)
      .eq('hackathon_id', hackathonId)
      .maybeSingle();

    if (roundErr || !currentRound) {
      return res.status(404).json({ error: 'Round not found.' });
    }

    const roundNumber = currentRound.round_number;

    // Prevent changing the status of a round to failure/incomplete if subsequent rounds exist
    if (newStatus && !['completed', 'qualified'].includes(newStatus)) {
      const { data: nextRounds, error: nextErr } = await supabaseAdmin
        .from('hackathon_rounds')
        .select('round_number')
        .eq('hackathon_id', hackathonId)
        .gt('round_number', roundNumber);

      if (nextErr) {
        return res.status(500).json({ error: 'Failed to verify subsequent rounds: ' + nextErr.message });
      }

      if (nextRounds && nextRounds.length > 0) {
        return res.status(400).json({
          error: `Round progression protection: Cannot change Round ${roundNumber} status to '${newStatus}' because subsequent rounds (Round ${nextRounds.map((r) => r.round_number).join(', ')}) already exist. Delete subsequent rounds first.`
        });
      }
    }

    const { data: updatedRound, error } = await supabaseAdmin
      .from('hackathon_rounds')
      .update({
        ...roundData,
        updated_at: new Date().toISOString()
      })
      .eq('id', roundId)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to update round: ' + error.message });
    }

    // Sync to Google Calendar
    if (updatedRound && updatedRound.date) {
      const roundDate = new Date(updatedRound.date);
      await syncEventForTeam(hackathonId, updatedRound.id, 'round_date', {
        summary: `[Trackathon] ${hackathon.name} - ${updatedRound.round_name}`,
        description: `Round details:\nDescription: ${updatedRound.description || 'N/A'}\nVenue/Meeting link: ${updatedRound.venue || updatedRound.meeting_link || 'N/A'}`,
        startDate: roundDate,
        endDate: new Date(roundDate.getTime() + 60 * 60 * 1000),
      });
    } else {
      await deleteEventForTeam(hackathonId, roundId, 'round_date');
    }

    res.json(updatedRound);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const deleteRound = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id: hackathonId, roundId } = req.params;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Verify ownership of the hackathon & round
    const { data: hackathon, error: fetchErr } = await supabaseAdmin
      .from('hackathons')
      .select('id')
      .eq('id', hackathonId)
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchErr || !hackathon) {
      return res.status(404).json({ error: 'Hackathon not found or access denied.' });
    }

    const { data: round, error: roundErr } = await supabaseAdmin
      .from('hackathon_rounds')
      .select('id, round_number')
      .eq('id', roundId)
      .eq('hackathon_id', hackathonId)
      .maybeSingle();

    if (roundErr || !round) {
      return res.status(404).json({ error: 'Round not found.' });
    }

    // Block deletion of a round if subsequent rounds exist
    const { data: nextRounds } = await supabaseAdmin
      .from('hackathon_rounds')
      .select('round_number')
      .eq('hackathon_id', hackathonId)
      .gt('round_number', round.round_number);

    if (nextRounds && nextRounds.length > 0) {
      return res.status(400).json({
        error: `Cannot delete Round ${round.round_number} because subsequent rounds already exist. Please delete subsequent rounds first.`
      });
    }

    // Delete synced calendar events first
    await deleteEventForTeam(hackathonId, roundId);

    const { error: deleteErr } = await supabaseAdmin
      .from('hackathon_rounds')
      .delete()
      .eq('id', roundId);

    if (deleteErr) {
      return res.status(500).json({ error: 'Failed to delete round: ' + deleteErr.message });
    }

    res.json({ success: true, message: 'Round successfully deleted.' });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export default { getRounds, createRound, updateRound, deleteRound };
