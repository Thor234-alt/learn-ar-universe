import { supabase } from '@/integrations/supabase/client';
import { Tables } from '@/integrations/supabase/types';

export interface ModelData {
  id: string;
  title: string;
  description?: string;
  sub_info?: string;
  content_data: {
    rootModelUrl: string;
    urls?: string[];
    folderPrefix?: string;
    rootModelFilename?: string;
  };
  qr_code_url?: string;
  access_count: number;
  is_active: boolean;
  public_access: boolean;
}

type ModuleContentRow = Tables<'module_content'>;

export class ModelService {
  /**
   * Fetch model data by QR code ID or content ID
   */
  static async getModelByQRCode(qrCodeId: string): Promise<ModelData | null> {
    try {
      const { data, error } = await supabase
        .from('module_content')
        .select('*')
        .eq('id', qrCodeId)
        .eq('content_type', '3d_model')
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error fetching model by QR code:', error);
        return null;
      }

      return this.transformToModelData(data);
    } catch (error) {
      console.error('Error in getModelByQRCode:', error);
      return null;
    }
  }

  /**
   * Fetch model data by content ID with public access check
   */
  static async getPublicModel(contentId: string): Promise<ModelData | null> {
    try {
      const { data, error } = await supabase
        .from('module_content')
        .select('*')
        .eq('id', contentId)
        .eq('content_type', '3d_model')
        .eq('is_active', true)
        .eq('public_access', true)
        .single();

      if (error) {
        console.error('Error fetching public model:', error);
        return null;
      }

      // Increment access count
      await this.incrementAccessCount(contentId);

      return this.transformToModelData(data);
    } catch (error) {
      console.error('Error in getPublicModel:', error);
      return null;
    }
  }

  /**
   * Get GLB file URL from Supabase storage
   */
  static getModelUrl(modelData: ModelData): string {
    if (modelData.content_data.rootModelUrl) {
      return modelData.content_data.rootModelUrl;
    }
    
    // Fallback to constructing URL if needed
    if (modelData.content_data.folderPrefix && modelData.content_data.rootModelFilename) {
      return `https://enbywesecfbtxxpmvhck.supabase.co/storage/v1/object/public/3d_models/${modelData.content_data.folderPrefix}/${modelData.content_data.rootModelFilename}`;
    }
    
    throw new Error('Model URL not found in content data');
  }

  /**
   * Increment model access count
   */
  static async incrementAccessCount(contentId: string): Promise<void> {
    try {
      // Get current count and increment
      const { data: currentData } = await supabase
        .from('module_content')
        .select('access_count')
        .eq('id', contentId)
        .single();

      const newCount = (currentData?.access_count || 0) + 1;

      const { error } = await supabase
        .from('module_content')
        .update({ access_count: newCount })
        .eq('id', contentId);

      if (error) {
        console.error('Error incrementing access count:', error);
      }
    } catch (error) {
      console.error('Error in incrementAccessCount:', error);
    }
  }

  /**
   * Get all public 3D models for browsing
   */
  static async getPublicModels(): Promise<ModelData[]> {
    try {
      const { data, error } = await supabase
        .from('module_content')
        .select('*')
        .eq('content_type', '3d_model')
        .eq('is_active', true)
        .eq('public_access', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching public models:', error);
        return [];
      }

      return data.map(item => this.transformToModelData(item));
    } catch (error) {
      console.error('Error in getPublicModels:', error);
      return [];
    }
  }

  /**
   * Transform database row to ModelData interface
   */
  static transformToModelData(data: ModuleContentRow): ModelData {
    return {
      id: data.id,
      title: data.title,
      description: data.description || undefined,
      sub_info: data.sub_info || undefined,
      content_data: data.content_data as any, // Type assertion for Json -> our interface
      qr_code_url: data.qr_code_url || undefined,
      access_count: data.access_count || 0,
      is_active: data.is_active,
      public_access: data.public_access || false,
    };
  }

  /**
   * Validate model data structure
   */
  static validateModelData(data: any): data is ModelData {
    return (
      data &&
      typeof data.id === 'string' &&
      typeof data.title === 'string' &&
      data.content_data &&
      (data.content_data.rootModelUrl || 
       (data.content_data.folderPrefix && data.content_data.rootModelFilename))
    );
  }
}