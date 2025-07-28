import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase credentials');
}

const supabase = createClient(supabaseUrl, supabaseKey);

export const uploadFile = async (bucket, filePath, file, options = {}) => {
  try {
    console.log('Supabase upload attempt:', {
      bucket,
      filePath,
      fileSize: file.length,
      contentType: options.contentType
    });

    // Validate inputs
    if (!bucket || !filePath || !file) {
      throw new Error('Missing required parameters for file upload');
    }

    const { data, error } = await supabase.storage
      .from(bucket)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        ...options
      });

    if (error) {
      console.error('Supabase upload error:', error);
      throw new Error(`Supabase upload failed: ${error.message}`);
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(bucket)
      .getPublicUrl(filePath);

    console.log('File uploaded successfully:', {
      bucket,
      filePath,
      publicUrl
    });

    return { data, publicUrl };
  } catch (error) {
    console.error('Error uploading file to Supabase:', error);
    throw error;
  }
};

export const deleteFile = async (bucket, filePath) => {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .remove([filePath]);

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

export default supabase; 