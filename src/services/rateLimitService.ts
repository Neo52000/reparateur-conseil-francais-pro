import { supabase } from '@/integrations/supabase/client';

export interface RateLimitResult {
  allowed: boolean;
  blocked: boolean;
  remaining_requests?: number;
  blocked_until?: string;
  reset_at?: string;
}

export class RateLimitService {
  /**
   * Vérifie si une requête est autorisée selon le rate limiting
   * @param endpoint - Nom de l'endpoint (ex: '/api/repairers')
   * @param maxRequests - Nombre maximum de requêtes autorisées (défaut: 100)
   * @param windowMinutes - Fenêtre de temps en minutes (défaut: 15)
   */
  static async checkRateLimit(
    endpoint: string,
    maxRequests: number = 100,
    windowMinutes: number = 15
  ): Promise<RateLimitResult> {
    try {
      // Récupérer l'IP du client (côté serveur uniquement)
      // Côté client, on utilise un identifiant de session ou l'user ID
      const userId = (await supabase.auth.getUser()).data.user?.id;
      
      // Simuler une IP pour le développement local
      const ipAddress = '127.0.0.1';

      // Note: Utilisation de .rpc() avec type any car check_rate_limit n'est pas encore dans les types générés
      const { data, error } = await (supabase as any).rpc('check_rate_limit', {
        endpoint_name: endpoint,
        ip: ipAddress,
        user_uuid: userId || null,
        max_requests: maxRequests,
        window_minutes: windowMinutes
      });

      if (error) {
        console.error('Rate limit check error:', error);
        // En cas d'erreur, autoriser la requête par défaut (fail-open)
        return {
          allowed: true,
          blocked: false,
          remaining_requests: maxRequests
        };
      }

      return data as RateLimitResult;
    } catch (error) {
      console.error('Rate limit service error:', error);
      // Fail-open en cas d'erreur
      return {
        allowed: true,
        blocked: false,
        remaining_requests: maxRequests
      };
    }
  }

  /**
   * Middleware pour vérifier le rate limit avant une requête
   * Utiliser avec React Query ou dans un service API
   */
  static async withRateLimit<T>(
    endpoint: string,
    requestFn: () => Promise<T>,
    options?: {
      maxRequests?: number;
      windowMinutes?: number;
      onBlocked?: (result: RateLimitResult) => void;
    }
  ): Promise<T> {
    const result = await this.checkRateLimit(
      endpoint,
      options?.maxRequests,
      options?.windowMinutes
    );

    if (!result.allowed || result.blocked) {
      const blockedUntil = result.blocked_until 
        ? new Date(result.blocked_until).toLocaleString('fr-FR')
        : 'indéfini';

      const error = new Error(
        `Trop de requêtes. Veuillez réessayer après ${blockedUntil}`
      );
      (error as any).rateLimit = result;

      if (options?.onBlocked) {
        options.onBlocked(result);
      }

      throw error;
    }

    return requestFn();
  }

  /**
   * Obtenir les statistiques de rate limiting pour l'utilisateur courant
   */
  static async getRateLimitStats(): Promise<{
    totalRequests: number;
    blockedRequests: number;
    endpoints: Record<string, number>;
  }> {
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) {
        return {
          totalRequests: 0,
          blockedRequests: 0,
          endpoints: {}
        };
      }

      // Note: api_rate_limits n'est pas encore dans les types générés
      const { data, error } = await (supabase as any)
        .from('api_rate_limits')
        .select('endpoint, request_count, blocked_until')
        .eq('user_id', userId)
        .gte('window_start', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      if (error) throw error;

      const stats = data?.reduce((acc: any, item: any) => {
        acc.totalRequests += item.request_count;
        if (item.blocked_until) {
          acc.blockedRequests += item.request_count;
        }
        acc.endpoints[item.endpoint] = (acc.endpoints[item.endpoint] || 0) + item.request_count;
        return acc;
      }, {
        totalRequests: 0,
        blockedRequests: 0,
        endpoints: {} as Record<string, number>
      });

      return stats || { totalRequests: 0, blockedRequests: 0, endpoints: {} };
    } catch (error) {
      console.error('Error fetching rate limit stats:', error);
      return {
        totalRequests: 0,
        blockedRequests: 0,
        endpoints: {}
      };
    }
  }
}

// Hook React pour utiliser le rate limiting
export const useRateLimit = (endpoint: string, options?: {
  maxRequests?: number;
  windowMinutes?: number;
}) => {
  const checkLimit = async () => {
    return RateLimitService.checkRateLimit(
      endpoint,
      options?.maxRequests,
      options?.windowMinutes
    );
  };

  return { checkLimit };
};
