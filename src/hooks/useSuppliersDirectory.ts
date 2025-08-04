import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useRepairerSubscriptions } from './useRepairerSubscriptions';
import { useAuth } from './useAuth';

export interface Supplier {
  id: string;
  name: string;
  description?: string;
  brands_sold: string[];
  product_types: string[];
  website?: string;
  phone?: string;
  email?: string;
  address: any;
  rating: number;
  review_count: number;
  specialties: string[];
  certifications: string[];
  logo_url?: string;
  featured_image_url?: string;
  payment_terms?: string;
  minimum_order?: number;
  delivery_info: any;
  is_verified: boolean;
  is_featured: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

export interface SupplierReview {
  id: string;
  supplier_id: string;
  repairer_id: string;
  rating: number;
  title: string;
  content: string;
  pros: any;
  cons: any;
  verified_purchase: boolean;
  status: string;
  created_at: string;
  updated_at: string;
}

export const useSuppliersDirectory = () => {
  const { user } = useAuth();
  const { getSubscriptionTier } = useRepairerSubscriptions();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const hasAccess = () => {
    if (!user) return false;
    // Check if user is admin first
    if (user.user_metadata?.role === 'admin') return true;
    // Then check subscription tier
    const tier = getSubscriptionTier(user.id);
    return tier === 'premium' || tier === 'enterprise';
  };

  const fetchSuppliers = async (filters?: {
    search?: string;
    brands?: string[];
    productTypes?: string[];
    verified?: boolean;
  }) => {
    if (!hasAccess()) {
      setError('Accès réservé aux réparateurs avec abonnement payant');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      let query = supabase
        .from('suppliers_directory')
        .select('*')
        .eq('status', 'active')
        .order('is_featured', { ascending: false })
        .order('rating', { ascending: false });

      if (filters?.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }

      if (filters?.brands && filters.brands.length > 0) {
        query = query.overlaps('brands_sold', filters.brands);
      }

      if (filters?.productTypes && filters.productTypes.length > 0) {
        query = query.overlaps('product_types', filters.productTypes);
      }

      if (filters?.verified) {
        query = query.eq('is_verified', true);
      }

      const { data, error } = await query;

      if (error) throw error;
      setSuppliers(data || []);
    } catch (err) {
      console.error('Error fetching suppliers:', err);
      setError('Erreur lors du chargement des fournisseurs');
    } finally {
      setLoading(false);
    }
  };

  const fetchSupplierById = async (id: string): Promise<Supplier | null> => {
    if (!hasAccess()) return null;

    try {
      const { data, error } = await supabase
        .from('suppliers_directory')
        .select('*')
        .eq('id', id)
        .eq('status', 'active')
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error fetching supplier:', err);
      return null;
    }
  };

  const fetchSupplierReviews = async (supplierId: string): Promise<SupplierReview[]> => {
    if (!hasAccess()) return [];

    try {
      const { data, error } = await supabase
        .from('suppliers_directory_reviews')
        .select('*')
        .eq('supplier_id', supplierId)
        .eq('status', 'published')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching reviews:', err);
      return [];
    }
  };

  const createReview = async (review: {
    supplier_id: string;
    rating: number;
    title: string;
    content: string;
    pros?: string[];
    cons?: string[];
    verified_purchase?: boolean;
  }) => {
    if (!hasAccess() || !user) {
      throw new Error('Accès non autorisé');
    }

    const { data, error } = await supabase
      .from('suppliers_directory_reviews')
      .insert({
        ...review,
        repairer_id: user.id,
        pros: review.pros || [],
        cons: review.cons || [],
        verified_purchase: review.verified_purchase || false,
      });

    if (error) throw error;
    return data;
  };

  useEffect(() => {
    fetchSuppliers();
  }, [user]);

  return {
    suppliers,
    loading,
    error,
    hasAccess: hasAccess(),
    fetchSuppliers,
    fetchSupplierById,
    fetchSupplierReviews,
    createReview,
  };
};