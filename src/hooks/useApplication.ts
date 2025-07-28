import { useState } from 'react';
import { supabase } from '../services/supabaseClient'; // Adjust import path as needed

interface ApplicationStatus {
  tracking_id: string;
  status: string;
  created_at: string;
  // Add other fields as needed based on your database schema
  [key: string]: any;
}

export const useApplication = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [applicationStatus, setApplicationStatus] = useState<ApplicationStatus | null>(null);

  const track = async (trackingId: string, tableName: string) => {
    setLoading(true);
    setError(null);
    setApplicationStatus(null);

    try {
      // Query the specified table for the tracking ID
      const { data, error: queryError } = await supabase
        .from(tableName)
        .select('*')
        .eq('tracking_id', trackingId)
        .single();

      if (queryError) {
        if (queryError.code === 'PGRST116') {
          // No rows returned
          setError(`No application found with tracking ID "${trackingId}" in the selected service type. Please check your tracking ID and ensure you've selected the correct service type.`);
        } else {
          setError(`Error searching for application: ${queryError.message}`);
        }
        return;
      }

      if (!data) {
        setError(`No application found with tracking ID "${trackingId}" in the selected service type.`);
        return;
      }

      setApplicationStatus(data);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Tracking error:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    applicationStatus,
    track,
  };
};
