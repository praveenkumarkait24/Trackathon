import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/auth.js';
import { supabaseAdmin, ensureBucketExists } from '../config/supabase.js';
import multer from 'multer';

// Profile picture multer configuration
export const avatarUpload = multer({
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB maximum size
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid image type. Only JPEG, PNG and WEBP formats are accepted.'));
    }
  }
});

export const getProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: Session missing' });
    }

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      return res.status(500).json({ error: 'Database fetch failed: ' + error.message });
    }

    if (!data) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: Session missing' });
    }

    const profileData = req.body;

    const { data, error } = await supabaseAdmin
      .from('profiles')
      .update({
        ...profileData,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      return res.status(500).json({ error: 'Database update failed: ' + error.message });
    }

    res.json(data);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export const uploadAvatar = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized: Session missing' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No image file uploaded' });
    }

    const file = req.file;
    const fileExtension = file.originalname.split('.').pop() || 'png';
    const filePath = `avatars/${userId}-${Date.now()}.${fileExtension}`;

    // Ensure storage bucket exists
    await ensureBucketExists('avatars');

    // Upload to Supabase Storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from('avatars')
      .upload(filePath, file.buffer, {
        contentType: file.mimetype,
        upsert: true
      });

    if (uploadError) {
      return res.status(500).json({ error: 'Supabase storage upload failed: ' + uploadError.message });
    }

    // Retrieve public URL
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('avatars')
      .getPublicUrl(filePath);

    // Save avatar reference in database
    const { error: dbError } = await supabaseAdmin
      .from('profiles')
      .update({
        avatar_url: publicUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (dbError) {
      return res.status(500).json({ error: 'Failed to update avatar profile path: ' + dbError.message });
    }

    res.json({ success: true, avatar_url: publicUrl });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
};

export default { getProfile, updateProfile, uploadAvatar, avatarUpload };
