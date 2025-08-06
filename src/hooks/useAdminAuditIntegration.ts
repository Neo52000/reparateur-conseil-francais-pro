
import { useAdminAudit } from '@/hooks/useAdminAudit';
import { useAuth } from '@/hooks/useAuth';
import { AdminAuditLogEntry } from '@/services/adminAuditService';

/**
 * Hook pour intégrer facilement l'audit dans les actions d'administration
 */
export const useAdminAuditIntegration = () => {
  const { logAction, logModification, logCriticalAction } = useAdminAudit();
  const { user } = useAuth();

  /**
   * Enregistre une action de gestion d'abonnement
   */
  const logSubscriptionAction = (
    action: AdminAuditLogEntry['action_type'],
    subscriptionId: string,
    details: Record<string, any>,
    severity: AdminAuditLogEntry['severity_level'] = 'info'
  ) => {
    logAction(action, 'subscription', subscriptionId, {
      ...details,
      admin_user_id: user?.id,
      timestamp: new Date().toISOString()
    }, severity);
  };

  /**
   * Enregistre une action de gestion de réparateur
   */
  const logRepairerAction = (
    action: AdminAuditLogEntry['action_type'],
    repairerId: string,
    details: Record<string, any>,
    severity: AdminAuditLogEntry['severity_level'] = 'info'
  ) => {
    logAction(action, 'repairer', repairerId, {
      ...details,
      admin_user_id: user?.id,
      timestamp: new Date().toISOString()
    }, severity);
  };

  /**
   * Enregistre une action de gestion de code promo
   */
  const logPromoCodeAction = (
    action: AdminAuditLogEntry['action_type'],
    promoCodeId: string,
    details: Record<string, any>,
    severity: AdminAuditLogEntry['severity_level'] = 'info'
  ) => {
    logAction(action, 'promo_code', promoCodeId, {
      ...details,
      admin_user_id: user?.id,
      timestamp: new Date().toISOString()
    }, severity);
  };

  /**
   * Enregistre une action de gestion de publicité
   */
  const logAdvertisingAction = (
    action: AdminAuditLogEntry['action_type'],
    bannerId: string,
    details: Record<string, any>,
    severity: AdminAuditLogEntry['severity_level'] = 'info'
  ) => {
    logAction(action, 'ad_banner', bannerId, {
      ...details,
      admin_user_id: user?.id,
      timestamp: new Date().toISOString()
    }, severity);
  };

  /**
   * Enregistre une action de scraping
   */
  const logScrapingAction = (
    action: AdminAuditLogEntry['action_type'],
    scrapingId: string,
    details: Record<string, any>,
    severity: AdminAuditLogEntry['severity_level'] = 'info'
  ) => {
    logAction(action, 'scraping', scrapingId, {
      ...details,
      admin_user_id: user?.id,
      timestamp: new Date().toISOString()
    }, severity);
  };

  /**
   * Enregistre une action de gestion de blog
   */
  const logBlogAction = (
    action: AdminAuditLogEntry['action_type'],
    postId: string,
    details: Record<string, any>,
    severity: AdminAuditLogEntry['severity_level'] = 'info'
  ) => {
    logAction(action, 'blog_post', postId, {
      ...details,
      admin_user_id: user?.id,
      timestamp: new Date().toISOString()
    }, severity);
  };

  /**
   * Enregistre une action de gestion de chatbot
   */
  const logChatbotAction = (
    action: AdminAuditLogEntry['action_type'],
    configId: string,
    details: Record<string, any>,
    severity: AdminAuditLogEntry['severity_level'] = 'info'
  ) => {
    logAction(action, 'chatbot', configId, {
      ...details,
      admin_user_id: user?.id,
      timestamp: new Date().toISOString()
    }, severity);
  };

  /**
   * Enregistre une action de gestion de demande client
   */
  const logClientInterestAction = (
    action: AdminAuditLogEntry['action_type'],
    interestId: string,
    details: Record<string, any>,
    severity: AdminAuditLogEntry['severity_level'] = 'info'
  ) => {
    logAction(action, 'client_interest', interestId, {
      ...details,
      admin_user_id: user?.id,
      timestamp: new Date().toISOString()
    }, severity);
  };

  /**
   * Enregistre une modification avec données avant/après
   */
  const logDataModification = (
    action: AdminAuditLogEntry['action_type'],
    resourceType: string,
    resourceId: string,
    beforeData: Record<string, any>,
    afterData: Record<string, any>,
    details?: Record<string, any>
  ) => {
    if (!user) return;
    
    logModification(action, resourceType, resourceId, beforeData, afterData, {
      ...details,
      admin_user_id: user.id,
      timestamp: new Date().toISOString()
    });
  };

  /**
   * Enregistre une action critique avec notification
   */
  const logCriticalAdminAction = (
    action: AdminAuditLogEntry['action_type'],
    resourceType: string,
    resourceId: string,
    details: Record<string, any>
  ) => {
    logCriticalAction(action, resourceType, resourceId, {
      ...details,
      admin_user_id: user?.id,
      timestamp: new Date().toISOString(),
      requires_attention: true
    });
  };

  return {
    logSubscriptionAction,
    logRepairerAction,
    logPromoCodeAction,
    logAdvertisingAction,
    logScrapingAction,
    logBlogAction,
    logChatbotAction,
    logClientInterestAction,
    logDataModification,
    logCriticalAdminAction
  };
};
