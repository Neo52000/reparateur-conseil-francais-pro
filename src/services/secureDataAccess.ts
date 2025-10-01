/**
 * Service de gestion sécurisée des accès aux données
 * Utilise automatiquement les vues sécurisées pour le public
 * et les tables complètes pour les propriétaires/admins
 */

import { supabase } from '@/integrations/supabase/client';

export class SecureDataAccess {
  /**
   * Détermine si l'utilisateur actuel a accès aux données complètes
   */
  private static async hasFullAccess(userId?: string): Promise<boolean> {
    if (!userId) return false;

    // Vérifier si l'utilisateur est admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .single();

    return profile?.role === 'admin';
  }

  /**
   * Retourne le nom de la table/vue approprié pour les réparateurs
   * Utilise 'repairers_safe' pour le public, 'repairers' pour admin/propriétaire
   */
  static async getRepairersTable(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return 'repairers_safe'; // Public : vue sécurisée
    }

    const hasAccess = await this.hasFullAccess(user.id);
    return hasAccess ? 'repairers' : 'repairers_safe';
  }

  /**
   * Retourne le nom de la table/vue approprié pour les profils de réparateurs
   */
  static async getRepairerProfilesTable(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return 'repairer_profiles_safe'; // Public : vue sécurisée
    }

    const hasAccess = await this.hasFullAccess(user.id);
    return hasAccess ? 'repairer_profiles' : 'repairer_profiles_safe';
  }

  /**
   * Crée une requête sécurisée pour les réparateurs
   * Utilise automatiquement la table/vue appropriée
   * @returns Query builder
   */
  static async createRepairersQuery() {
    const table = await this.getRepairersTable();
    // @ts-ignore - Vue créée dynamiquement, types seront regénérés
    return supabase.from(table);
  }

  /**
   * Crée une requête sécurisée pour les profils de réparateurs
   */
  static async createRepairerProfilesQuery() {
    const table = await this.getRepairerProfilesTable();
    // @ts-ignore - Vue créée dynamiquement, types seront regénérés
    return supabase.from(table);
  }
}
