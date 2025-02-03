import { supabase } from './supabase';

export async function setupStorage(userId: string | null) {
  try {
    if (!userId) {
      console.error('No user ID available');
      return false;
    }

    // Create bucket if it doesn't exist
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('Failed to list buckets:', bucketsError);
      return false;
    }

    const invoicesBucket = buckets.find(b => b.name === 'invoices');
    if (!invoicesBucket) {
      console.log('Creating invoices bucket...');
      const { error: createError } = await supabase.storage.createBucket('invoices', {
        public: false,
        allowedMimeTypes: ['application/pdf'],
        fileSizeLimit: 10485760 // 10MB
      });

      if (createError) {
        console.error('Failed to create bucket:', createError);
        return false;
      }
    }

    // Create user folder
    const userPath = `${userId}/`;
    const { error: uploadError } = await supabase.storage
      .from('invoices')
      .upload(`${userPath}.keep`, new Blob([''], { type: 'text/plain' }));

    if (uploadError && !uploadError.message.includes('already exists')) {
      console.error('Failed to create user folder:', uploadError);
      return false;
    }

    // Test file list
    const { data: files, error: listError } = await supabase.storage
      .from('invoices')
      .list(userPath);

    if (listError) {
      console.error('Failed to list files:', listError);
      return false;
    }

    console.log('Storage setup complete');
    return true;
  } catch (error) {
    console.error('Storage setup error:', error);
    return false;
  }
} 