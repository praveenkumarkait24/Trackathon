import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { supabaseAdmin } from '../config/supabase.js';
import multer from 'multer';

export const proofUpload = multer({
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB maximum size
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, WEBP images or PDF files are accepted.'));
    }
  }
});

export const getAchievement = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id: hackathonId } = req.params;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Verify ownership
    const { data: hackathon, error: fetchErr } = await supabaseAdmin
      .from('hackathons')
      .select('id')
      .eq('id', hackathonId)
      .eq('user_id', userId)
      .maybeSingle();

    if (fetchErr || !hackathon) {
      return res.status(404).json({ error: 'Hackathon not found or access denied.' });
    }

    const { data: achievement, error } = await supabaseAdmin
      .from('achievements')
      .select('*')
      .eq('hackathon_id', hackathonId)
      .maybeSingle();

    if (error) {
      return res.status(500).json({ error: 'Failed to fetch achievement: ' + error.message });
    }

    res.json(achievement);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const saveAchievement = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id: hackathonId } = req.params;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const achievementData = req.body;

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

    // Force hackathon status to 'completed' if achievement is registered
    const { error: statusErr } = await supabaseAdmin
      .from('hackathons')
      .update({ status: 'completed', updated_at: new Date().toISOString() })
      .eq('id', hackathonId);

    if (statusErr) {
      console.warn('Warning: Failed to update hackathon status to completed:', statusErr.message);
    }

    const { data: achievement, error } = await supabaseAdmin
      .from('achievements')
      .upsert({
        ...achievementData,
        hackathon_id: hackathonId,
        user_id: userId,
        updated_at: new Date().toISOString()
      }, { onConflict: 'hackathon_id' })
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Failed to record achievement: ' + error.message });
    }

    res.json(achievement);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const uploadProof = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { id: hackathonId } = req.params;
    const { type } = req.query; // 'certificate' or 'proof'

    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    if (type !== 'certificate' && type !== 'proof') {
      return res.status(400).json({ error: "Invalid upload type. Must be 'certificate' or 'proof'." });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

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

    const file = req.file;
    const fileExtension = file.originalname.split('.').pop() || 'png';
    const bucketName = type === 'certificate' ? 'certificates' : 'proofs';
    const filePath = `${hackathonId}-${Date.now()}.${fileExtension}`;

    // Upload to Storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true
      });

    if (uploadError) {
      return res.status(500).json({ error: `Supabase Storage upload to ${bucketName} failed: ` + uploadError.message });
    }

    // Retrieve URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from(bucketName)
      .getPublicUrl(filePath);

    // Save in achievements
    const dbUpdate: any = {
      updated_at: new Date().toISOString()
    };
    if (type === 'certificate') {
      dbUpdate.certificate_url = publicUrl;
    } else {
      dbUpdate.proof_url = publicUrl;
    }

    const { data: achievement, error: dbError } = await supabaseAdmin
      .from('achievements')
      .upsert({
        hackathon_id: hackathonId,
        user_id: userId,
        ...dbUpdate
      }, { onConflict: 'hackathon_id' })
      .select()
      .single();

    if (dbError) {
      return res.status(500).json({ error: 'Failed to update achievement storage link: ' + dbError.message });
    }

    res.json({ success: true, url: publicUrl, achievement });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export default { getAchievement, saveAchievement, uploadProof, proofUpload };
