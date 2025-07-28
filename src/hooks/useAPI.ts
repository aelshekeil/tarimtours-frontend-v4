import { useState, useEffect } from 'react';
import supabaseAPI from '../services/supabaseAPI';

// Generic API Data Fetching Hook
export const useAPI = (endpoint: string) => {
  const [data, setData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // @ts-ignore
        const response = await supabaseAPI.get(endpoint);
        setData(response);
      } catch (err) {
        setError(err as Error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint]);

  return { data, loading, error };
};

// Form Submission Hook
export const useFormSubmission = (endpoint: string) => {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [response, setResponse] = useState<any | null>(null);

  const submit = async (formData: any) => {
    setSubmitting(true);
    try {
      // @ts-ignore
      const result = await supabaseAPI.post(endpoint, formData);
      setResponse(result);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setSubmitting(false);
    }
  };

  return { submit, submitting, error, response };
};
