import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('CRITICAL ERROR: Supabase environment variables are missing.');
}

// Admin client to run backend-privileged operations
export const supabaseAdmin = createClient(
  supabaseUrl || '',
  supabaseServiceKey || '',
  {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  }
);

// Helper to programmatically create storage buckets if they are missing
export const ensureBucketExists = async (bucketName: string) => {
  try {
    const { data: bucket, error: getError } = await supabaseAdmin.storage.getBucket(bucketName);
    if (getError || !bucket) {
      console.log(`Bucket "${bucketName}" not found. Initializing public bucket...`);
      const { error: createError } = await supabaseAdmin.storage.createBucket(bucketName, {
        public: true
      });
      if (createError) {
        console.error(`Failed to create bucket "${bucketName}":`, createError);
      } else {
        console.log(`Successfully created public bucket: "${bucketName}"`);
      }
    }
  } catch (err) {
    console.error(`Error checking storage bucket "${bucketName}":`, err);
  }
};
