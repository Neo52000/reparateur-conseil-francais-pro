
import { supabase } from '@/integrations/supabase/client';
import { AutomatedCampaign, CampaignVariant } from '@/types/advancedAdvertising';
import { AdvancedTargetingService } from './advancedTargeting';

export class AutomatedCampaignService {
  // Gestion des campagnes automatisées
  static async createAutomatedCampaign(campaign: Omit<AutomatedCampaign, 'id' | 'created_at' | 'updated_at'>) {
    const { data, error } = await supabase
      .from('automated_campaigns')
      .insert([campaign])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getAutomatedCampaigns() {
    const { data, error } = await supabase
      .from('automated_campaigns')
      .select(`
        *,
        ad_campaigns (
          name, status, budget_total, budget_spent
        )
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  // Exécution des campagnes automatisées
  static async executeAutomatedCampaigns() {
    const campaigns = await this.getAutomatedCampaigns();
    const now = new Date();

    for (const campaign of campaigns) {
      try {
        if (this.shouldExecuteCampaign(campaign, now)) {
          await this.executeCampaign(campaign);
          
          // Mettre à jour les timestamps d'exécution
          await supabase
            .from('automated_campaigns')
            .update({
              last_executed: now.toISOString(),
              next_execution: this.calculateNextExecution(campaign, now).toISOString()
            })
            .eq('id', campaign.id);
        }
      } catch (error) {
        console.error(`Error executing automated campaign ${campaign.id}:`, error);
      }
    }
  }

  private static shouldExecuteCampaign(campaign: any, now: Date): boolean {
    // Vérifier si c'est le moment d'exécuter la campagne
    if (campaign.next_execution && new Date(campaign.next_execution) > now) {
      return false;
    }

    // Vérifier les conditions de déclenchement
    if (campaign.triggers.schedule) {
      return this.checkScheduleTrigger(campaign.triggers.schedule, now);
    }

    return true;
  }

  private static checkScheduleTrigger(schedule: any, now: Date): boolean {
    const currentHour = now.getHours();
    const currentDay = now.getDay();
    const currentMinute = now.getMinutes();

    if (schedule.time) {
      const [hour, minute] = schedule.time.split(':').map(Number);
      if (currentHour !== hour || Math.abs(currentMinute - minute) > 5) {
        return false;
      }
    }

    if (schedule.days && schedule.days.length > 0) {
      if (!schedule.days.includes(currentDay.toString())) {
        return false;
      }
    }

    return true;
  }

  private static async executeCampaign(campaign: any) {
    switch (campaign.campaign_type) {
      case 'acquisition':
        await this.executeAcquisitionCampaign(campaign);
        break;
      case 'reactivation':
        await this.executeReactivationCampaign(campaign);
        break;
      case 'loyalty':
        await this.executeLoyaltyCampaign(campaign);
        break;
      case 'contextual':
        await this.executeContextualCampaign(campaign);
        break;
    }
  }

  private static async executeAcquisitionCampaign(campaign: any) {
    // Logique pour les campagnes d'acquisition
    console.log('Executing acquisition campaign:', campaign.id);
    
    // Identifier les nouveaux utilisateurs ou visiteurs
    const { data: newUsers } = await supabase
      .from('profiles')
      .select('id, created_at')
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    if (newUsers && newUsers.length > 0) {
      // Ajuster le budget ou le ciblage pour les nouveaux utilisateurs
      await this.adjustCampaignForNewUsers(campaign.campaign_id, newUsers);
    }
  }

  private static async executeReactivationCampaign(campaign: any) {
    // Logique pour les campagnes de réactivation
    console.log('Executing reactivation campaign:', campaign.id);
    
    // Identifier les utilisateurs inactifs
    const { data: inactiveUsers } = await supabase
      .from('user_behavior_events')
      .select('user_id, created_at')
      .lt('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: false });

    if (inactiveUsers) {
      // Créer des segments de réactivation personnalisés
      await this.createReactivationSegments(campaign.campaign_id, inactiveUsers);
    }
  }

  private static async executeLoyaltyCampaign(campaign: any) {
    // Logique pour les campagnes de fidélisation
    console.log('Executing loyalty campaign:', campaign.id);
    
    // Identifier les clients fidèles
    const { data: loyalUsers } = await supabase
      .from('user_interaction_history')
      .select('user_id, COUNT(*) as interaction_count')
      .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
      .group('user_id')
      .having('COUNT(*)', 'gte', 10);

    if (loyalUsers) {
      // Ajuster les offres pour les clients fidèles
      await this.adjustLoyaltyOffers(campaign.campaign_id, loyalUsers);
    }
  }

  private static async executeContextualCampaign(campaign: any) {
    // Logique pour les campagnes contextuelles
    console.log('Executing contextual campaign:', campaign.id);
    
    // Analyser le contexte actuel (tendances, événements)
    const context = await this.analyzeCurrentContext();
    
    // Ajuster la campagne selon le contexte
    await this.adjustCampaignForContext(campaign.campaign_id, context);
  }

  private static calculateNextExecution(campaign: any, lastExecution: Date): Date {
    const nextExecution = new Date(lastExecution);
    
    if (campaign.triggers.schedule?.frequency === 'daily') {
      nextExecution.setDate(nextExecution.getDate() + 1);
    } else if (campaign.triggers.schedule?.frequency === 'weekly') {
      nextExecution.setDate(nextExecution.getDate() + 7);
    } else if (campaign.triggers.schedule?.frequency === 'hourly') {
      nextExecution.setHours(nextExecution.getHours() + 1);
    } else {
      // Par défaut, tous les jours
      nextExecution.setDate(nextExecution.getDate() + 1);
    }
    
    return nextExecution;
  }

  // Méthodes utilitaires pour l'exécution des campagnes
  private static async adjustCampaignForNewUsers(campaignId: string, newUsers: any[]) {
    // Implémentation de l'ajustement pour nouveaux utilisateurs
    console.log(`Adjusting campaign ${campaignId} for ${newUsers.length} new users`);
  }

  private static async createReactivationSegments(campaignId: string, inactiveUsers: any[]) {
    // Implémentation de la création de segments de réactivation
    console.log(`Creating reactivation segments for campaign ${campaignId}`);
  }

  private static async adjustLoyaltyOffers(campaignId: string, loyalUsers: any[]) {
    // Implémentation de l'ajustement des offres de fidélité
    console.log(`Adjusting loyalty offers for campaign ${campaignId}`);
  }

  private static async analyzeCurrentContext() {
    // Implémentation de l'analyse du contexte actuel
    return {
      trending_devices: ['iPhone 15', 'Samsung S24'],
      peak_hours: [12, 18, 20],
      seasonal_trends: ['back_to_school', 'holiday_season']
    };
  }

  private static async adjustCampaignForContext(campaignId: string, context: any) {
    // Implémentation de l'ajustement contextuel
    console.log(`Adjusting campaign ${campaignId} for context:`, context);
  }

  // Gestion des variantes A/B
  static async createCampaignVariant(variant: Omit<CampaignVariant, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('campaign_variants')
      .insert([variant])
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async getCampaignVariants(campaignId: string) {
    const { data, error } = await supabase
      .from('campaign_variants')
      .select('*')
      .eq('campaign_id', campaignId)
      .eq('is_active', true)
      .order('created_at');

    if (error) throw error;
    return data as CampaignVariant[];
  }

  static async updateVariantPerformance(variantId: string, metrics: Partial<CampaignVariant['performance_metrics']>) {
    const { data, error } = await supabase
      .from('campaign_variants')
      .update({ 
        performance_metrics: metrics 
      })
      .eq('id', variantId)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}
