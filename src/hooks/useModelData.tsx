import { useState, useEffect } from 'react';
import { ModelService, ModelData } from '@/services/modelService';
import { QRCodeUtils } from '@/utils/qrCodeUtils';

export interface UseModelDataResult {
  modelData: ModelData | null;
  loading: boolean;
  error: string | null;
  retry: () => void;
}

/**
 * Hook to fetch model data by content ID
 */
export function useModelData(contentId: string | null): UseModelDataResult {
  const [modelData, setModelData] = useState<ModelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    if (!contentId) {
      setError('No model ID provided');
      setLoading(false);
      return;
    }

    if (!QRCodeUtils.isValidUUID(contentId)) {
      setError('Invalid model ID format');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const data = await ModelService.getPublicModel(contentId);
      
      if (!data) {
        setError('Model not found or not publicly accessible');
        setModelData(null);
      } else if (!ModelService.validateModelData(data)) {
        setError('Invalid model data structure');
        setModelData(null);
      } else {
        setModelData(data);
      }
    } catch (err) {
      console.error('Error fetching model data:', err);
      setError('Failed to load model data');
      setModelData(null);
    } finally {
      setLoading(false);
    }
  };

  const retry = () => {
    fetchData();
  };

  useEffect(() => {
    fetchData();
  }, [contentId]);

  return {
    modelData,
    loading,
    error,
    retry,
  };
}