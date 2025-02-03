'use client';

import { useEffect, useState, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';
import { setupStorage } from '@/utils/setupStorage';
import { supabase } from '@/utils/supabase';

interface UploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
}

export default function InvoicesPage() {
  const { user } = useUser();
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadState, setUploadState] = useState<UploadState>({
    isUploading: false,
    progress: 0,
    error: null
  });

  useEffect(() => {
    async function init() {
      if (user) {
        try {
          setIsLoading(true);
          const success = await setupStorage(user.id);
          if (!success) {
            setError('Failed to initialize storage');
          }
        } catch (err) {
          console.error('Storage initialization error:', err);
          setError('Storage initialization failed');
        } finally {
          setIsLoading(false);
        }
      }
    }
    init();
  }, [user]);

  const uploadInvoice = useCallback(async (file: File) => {
    if (!user) return;
    if (!file) return;

    try {
      setUploadState({ isUploading: true, progress: 0, error: null });

      // Validate file type
      if (file.type !== 'application/pdf') {
        throw new Error('Only PDF files are allowed');
      }

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size must be less than 10MB');
      }

      const filePath = `${user.id}/${file.name}`;

      const { data, error } = await supabase.storage
        .from('invoices')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) throw error;

      // Create invoice record
      const { error: dbError } = await supabase
        .from('invoices')
        .insert([{
          user_id: user.id,
          file_path: filePath,
          file_name: file.name,
          status: 'draft',
          amount: 0, // Will be updated later
          client_name: 'Draft', // Will be updated later
          invoice_number: `INV-${Date.now()}` // Generate a temporary number
        }]);

      if (dbError) throw dbError;

      setUploadState({ isUploading: false, progress: 100, error: null });
    } catch (err: any) {
      console.error('Upload failed:', err);
      setUploadState({
        isUploading: false,
        progress: 0,
        error: err.message || 'Upload failed'
      });
    }
  }, [user]);

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      uploadInvoice(file);
    }
  }, [uploadInvoice]);

  if (!user) return null;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Invoices</h1>
      
      {isLoading ? (
        <p className="text-gray-500">Setting up storage...</p>
      ) : error ? (
        <div className="bg-red-50 text-red-600 p-4 rounded mb-4">
          {error}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Upload Section */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
            <h2 className="text-lg font-semibold mb-4">Upload Invoice</h2>
            <div className="space-y-4">
              <input
                type="file"
                accept="application/pdf"
                onChange={handleFileChange}
                disabled={uploadState.isUploading}
                className="block w-full text-sm text-gray-500 dark:text-gray-400
                         file:mr-4 file:py-2 file:px-4
                         file:rounded-md file:border-0
                         file:text-sm file:font-semibold
                         file:bg-blue-50 file:text-blue-700
                         hover:file:bg-blue-100
                         dark:file:bg-blue-900 dark:file:text-blue-200"
              />
              
              {uploadState.isUploading && (
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                    style={{ width: `${uploadState.progress}%` }}
                  />
                </div>
              )}

              {uploadState.error && (
                <div className="text-red-500 text-sm">
                  {uploadState.error}
                </div>
              )}
            </div>
          </div>

          {/* Invoices List will go here */}
        </div>
      )}
    </div>
  );
} 