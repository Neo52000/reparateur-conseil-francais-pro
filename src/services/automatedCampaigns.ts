
import { supabase } from '@/integrations/supabase/client';
import { AutomatedCampaign, CampaignVariant } from '@/types/advancedAdvertising';
import { AdvancedTargetingService } from './advancedTargeting';

export class AutomatedCampaignService {
  // Gestion des campagnes automatisées - Maintenant avec vraies données Supabase
  static async createAutomatedCampaign(campaign: Omit<AutomatedCampaign, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('automated_campaigns')
        .insert([campaign])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating automated campaign:', error);
      throw error;
    }
  }

  static async getAutomatedCampaigns() {
    try {
      const { data, error } = await supabase
        .from('automated_campaigns')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching automated campaigns:', error);
      return [];
    }
  }

  static async updateAutomatedCampaign(id: string, updates: Partial<AutomatedCampaign>) {
    try {
      const { data, error } = await supabase
        .from('automated_campaigns')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating automated campaign:', error);
      throw error;
    }
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
          await this.updateAutomatedCampaign(campaign.id, {
            last_executed: now.toISOString(),
            next_execution: this.calculateNextExecution(campaign, now).toISOString()
          });
          
          console.log(`Executed automated campaign ${campaign.id}`);
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
    console.log('Executing acquisition campaign:', campaign.id);
    
    // Logique d'acquisition - cibler les nouveaux utilisateurs
    if (campaign.rules.targeting_optimization) {
      const segments = await AdvancedTargetingService.getTargetingSegments();
      const newUserSegments = segments.filter(s => 
        s.criteria.behavior_patterns?.includes('new_user')
      );
      
      for (const segment of newUserSegments) {
        await this.optimizeCampaignForSegment(campaign.campaign_id, segment.id);
      }
    }
  }

  private static async executeReactivationCampaign(campaign: any) {
    console.log('Executing reactivation campaign:', campaign.id);
    
    // Logique de réactivation - cibler les utilisateurs inactifs
    const inactiveUsers = await this.getInactiveUsers(30); // 30 jours d'inactivité
    
    for (const userId of inactiveUsers) {
      await AdvancedTargetingService.trackUserInteraction(
        userId,
        'reactivation_campaign',
        'campaign',
        campaign.id,
        { campaign_type: 'reactivation' }
      );
    }
  }

  private static async executeLoyaltyCampaign(campaign: any) {
    console.log('Executing loyalty campaign:', campaign.id);
    
    // Logique de fidélisation - cibler les utilisateurs actifs
    const loyalUsers = await this.getLoyalUsers();
    
    for (const userId of loyalUsers) {
      await AdvancedTargetingService.trackUserInteraction(
        userId,
        'loyalty_campaign',
        'campaign',
        campaign.id,
        { campaign_type: 'loyalty' }
      );
    }
  }

  private static async executeContextualCampaign(campaign: any) {
    console.log('Executing contextual campaign:', campaign.id);
    
    // Logique contextuelle - basée sur l'activité récente
    const recentActivity = await this.getRecentUserActivity(7); // 7 derniers jours
    
    for (const activity of recentActivity) {
      if (this.matchesContextualTriggers(activity, campaign.triggers)) {
        await AdvancedTargetingService.trackUserInteraction(
          activity.user_id,
          'contextual_campaign',
          'campaign',
          campaign.id,
          { 
            campaign_type: 'contextual',
            trigger_activity: activity.event_type
          }
        );
      }
    }
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
      nextExecution.setDate(nextExecution.getDate() + 1);
    }
    
    return nextExecution;
  }

  // Gestion des variantes A/B - Maintenant avec vraies données Supabase
  static async createCampaignVariant(variant: Omit<CampaignVariant, 'id' | 'created_at'>) {
    try {
      const { data, error } = await supabase
        .from('campaign_variants')
        .insert([variant])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating campaign variant:', error);
      throw error;
    }
  }

  static async getCampaignVariants(campaignId: string) {
    try {
      const { data, error } = await supabase
        .from('campaign_variants')
        .select('*')
        .eq('campaign_id', campaignId)
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching campaign variants:', error);
      return [];
    }
  }

  static async updateVariantPerformance(variantId: string, metrics: Partial<CampaignVariant['performance_metrics']>) {
    try {
      const { data, error } = await supabase
        .from('campaign_variants')
        .update({ performance_metrics: metrics })
        .eq('id', variantId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating variant performance:', error);
      throw error;
    }
  }

  // Fonctions utilitaires
  private static async getInactiveUsers(daysSinceLastActivity: number): Promise<string[]> {
    try {
      const cutoffDate = new Date(Date.now() - daysSinceLastActivity * 24 * 60 * 60 * 1000);
      
      const { data, error } = await supabase
        .from('user_behavior_events')
        .select('user_id')
        .lt('created_at', cutoffDate.toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Retourner les IDs utilisateurs unique
      const uniqueUserIds = [...new Set(data?.map(event => event.user_id).filter(Boolean) || [])];
      return uniqueUserIds;
    } catch (error) {
      console.error('Error fetching inactive users:', error);
      return [];
    }
  }

  private static async getLoyalUsers(): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('user_behavior_events')
        .select('user_id')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Compter les activités par utilisateur et retourner les plus actifs
      const userActivityCount = {};
      data?.forEach(event => {
        if (event.user_id) {
          userActivityCount[event.user_id] = (userActivityCount[event.user_id] || 0) + 1;
        }
      });

      // Retourner les utilisateurs avec plus de 10 activités
      return Object.keys(userActivityCount).filter(userId => 
        userActivityCount[userId] > 10
      );
    } catch (error) {
      console.error('Error fetching loyal users:', error);
      return [];
    }
  }

  private static async getRecentUserActivity(days: number): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('user_behavior_events')
        .select('*')
        .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching recent user activity:', error);
      return [];
    }
  }

  private static matchesContextualTriggers(activity: any, triggers: any): boolean {
    if (!triggers.events || !Array.isArray(triggers.events)) {
      return false;
    }
    
    return triggers.events.includes(activity.event_type);
  }

  private static async optimizeCampaignForSegment(campaignId: string, segmentId: string) {
    try {
      // Enregistrer une métrique de performance pour ce segment
      const { error } = await supabase
        .from('campaign_performance_metrics')
        .insert([{
          campaign_id: campaignId,
          segment_id: segmentId,
          impressions: 1,
          clicks: 0,
          conversions: 0,
          cost: 0,
          revenue: 0
        }]);

      if (error) {
        console.error('Error optimizing campaign for segment:', error);
      }
    } catch (error) {
      console.error('Error optimizing campaign for segment:', error);
    }
  }
}
