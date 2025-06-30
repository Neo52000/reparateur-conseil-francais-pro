import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export interface DemoConversation {
  id: string;
  repairer_id: string;
  repairer_name: string;
  repairer_business: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  status: 'active' | 'closed';
  source: 'demo';
}

export interface DemoMessage {
  id: string;
  sender_type: 'client' | 'repairer';
  message: string;
  created_at: string;
  conversation_id: string;
  source: 'demo';
}

export interface DemoReview {
  id: string;
  client_id: string;
  repairer_id: string;
  quote_id?: string;
  overall_rating: number;
  criteria_ratings: Record<string, number>;
  comment?: string;
  pros?: string;
  cons?: string;
  would_recommend?: boolean;
  status: 'pending' | 'approved' | 'rejected' | 'hidden';
  moderation_notes?: string;
  helpful_count: number;
  created_at: string;
  updated_at: string;
  source: 'demo';
}

export interface DemoQuote {
  id: string;
  device_brand: string;
  device_model: string;
  repair_type: string;
  repairer_id: string;
  status: string;
  source: 'demo';
}

export interface DemoAppointment {
  id: string;
  repairer: string;
  date: string;
  time: string;
  service: string;
  status: string;
  source: 'demo';
}

export interface DemoStats {
  totalRepairs: number;
  totalSpent: number;
  loyaltyPoints: number;
  avgRating: number;
}

/**
 * Service pour gérer les données de démonstration du dashboard client
 */
export class ClientDemoDataService {
  /**
   * Obtenir des conversations de démonstration
   */
  static getDemoConversations(): DemoConversation[] {
    return [
      {
        id: 'demo-conv-1',
        repairer_id: 'demo-rep-1',
        repairer_name: 'TechRepair Pro',
        repairer_business: 'Réparation iPhone spécialisée',
        last_message: 'Votre iPhone est prêt à être récupéré !',
        last_message_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // Il y a 2h
        unread_count: 1,
        status: 'active',
        source: 'demo'
      },
      {
        id: 'demo-conv-2',
        repairer_id: 'demo-rep-2',
        repairer_name: 'Mobile Expert',
        repairer_business: 'Diagnostic et réparation tous mobiles',
        last_message: 'Le diagnostic de votre Samsung est terminé',
        last_message_time: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // Hier
        unread_count: 0,
        status: 'active',
        source: 'demo'
      },
      {
        id: 'demo-conv-3',
        repairer_id: 'demo-rep-3',
        repairer_name: 'Quick Fix',
        repairer_business: 'Réparation express',
        last_message: 'Merci pour votre confiance !',
        last_message_time: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // Il y a 2 jours
        unread_count: 0,
        status: 'closed',
        source: 'demo'
      }
    ];
  }

  /**
   * Obtenir des messages de démonstration pour une conversation
   */
  static getDemoMessages(conversationId: string): DemoMessage[] {
    const baseTime = new Date(Date.now() - 2 * 60 * 60 * 1000);
    
    return [
      {
        id: 'demo-msg-1',
        sender_type: 'client',
        message: 'Bonjour, j\'aimerais avoir un devis pour réparer l\'écran de mon iPhone 13',
        created_at: new Date(baseTime.getTime() - 90 * 60 * 1000).toISOString(), // Il y a 90min
        conversation_id: conversationId,
        source: 'demo'
      },
      {
        id: 'demo-msg-2',
        sender_type: 'repairer',
        message: 'Bonjour ! Je peux vous faire un devis de 89€ pour la réparation de l\'écran. La réparation prend environ 1h.',
        created_at: new Date(baseTime.getTime() - 75 * 60 * 1000).toISOString(), // Il y a 75min
        conversation_id: conversationId,
        source: 'demo'
      },
      {
        id: 'demo-msg-3',
        sender_type: 'client',
        message: 'Parfait ! Pouvez-vous me confirmer la disponibilité pour demain ?',
        created_at: new Date(baseTime.getTime() - 60 * 60 * 1000).toISOString(), // Il y a 60min
        conversation_id: conversationId,
        source: 'demo'
      },
      {
        id: 'demo-msg-4',
        sender_type: 'repairer',
        message: 'Votre iPhone est prêt à être récupéré !',
        created_at: baseTime.toISOString(),
        conversation_id: conversationId,
        source: 'demo'
      }
    ];
  }

  /**
   * Obtenir des avis de démonstration
   */
  static getDemoReviews(): DemoReview[] {
    const now = new Date();
    
    return [
      {
        id: 'demo-review-1',
        client_id: 'demo-client-1',
        repairer_id: 'demo-rep-1',
        quote_id: 'demo-quote-1',
        overall_rating: 5,
        criteria_ratings: {
          'quality': 5,
          'speed': 4,
          'price': 5,
          'communication': 5
        },
        comment: 'Excellent service ! Mon iPhone fonctionne parfaitement après la réparation. Je recommande vivement.',
        pros: 'Rapide, professionnel, prix correct',
        cons: null,
        would_recommend: true,
        status: 'approved',
        helpful_count: 3,
        created_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        source: 'demo'
      },
      {
        id: 'demo-review-2',
        client_id: 'demo-client-1',
        repairer_id: 'demo-rep-2',
        quote_id: 'demo-quote-2',
        overall_rating: 4,
        criteria_ratings: {
          'quality': 4,
          'speed': 3,
          'price': 4,
          'communication': 4
        },
        comment: 'Bonne réparation dans l\'ensemble. Un peu d\'attente mais résultat satisfaisant.',
        pros: 'Travail de qualité',
        cons: 'Délai un peu long',
        would_recommend: true,
        status: 'pending',
        helpful_count: 0,
        created_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        updated_at: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        source: 'demo'
      }
    ];
  }

  /**
   * Obtenir des devis de démonstration disponibles pour les avis
   */
  static getDemoAvailableQuotes(): DemoQuote[] {
    return [
      {
        id: 'demo-quote-3',
        device_brand: 'Samsung',
        device_model: 'Galaxy S23',
        repair_type: 'Remplacement batterie',
        repairer_id: 'demo-rep-3',
        status: 'completed',
        source: 'demo'
      },
      {
        id: 'demo-quote-4',
        device_brand: 'Xiaomi',
        device_model: 'Mi 11',
        repair_type: 'Réparation connecteur charge',
        repairer_id: 'demo-rep-1',
        status: 'completed',
        source: 'demo'
      }
    ];
  }

  /**
   * Obtenir des rendez-vous de démonstration
   */
  static getDemoAppointments(): DemoAppointment[] {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dayAfter = new Date();
    dayAfter.setDate(dayAfter.getDate() + 3);
    
    return [
      {
        id: 'demo-appt-1',
        repairer: 'TechRepair Paris',
        date: format(tomorrow, 'yyyy-MM-dd'),
        time: '14:30',
        service: 'Réparation écran iPhone 13',
        status: 'Confirmé',
        source: 'demo'
      },
      {
        id: 'demo-appt-2',
        repairer: 'Mobile Expert',
        date: format(dayAfter, 'yyyy-MM-dd'),
        time: '10:00',
        service: 'Diagnostic Samsung Galaxy',
        status: 'En attente',
        source: 'demo'
      }
    ];
  }

  /**
   * Obtenir des statistiques de démonstration
   */
  static getDemoStats(): DemoStats {
    return {
      totalRepairs: 12,
      totalSpent: 850,
      loyaltyPoints: 150,
      avgRating: 4.5
    };
  }

  /**
   * Combiner les données réelles avec les données de démo
   */
  static combineWithDemoData<T extends { source?: string }>(
    realData: T[],
    demoData: T[],
    demoModeEnabled: boolean
  ): T[] {
    // Filtrer les anciennes données démo des données réelles
    const realNonDemoData = realData.filter(item => item.source !== 'demo');
    
    if (demoModeEnabled) {
      return [...realNonDemoData, ...demoData];
    } else {
      return realNonDemoData;
    }
  }

  /**
   * Vérifier si une donnée est une donnée de démonstration
   */
  static isDemoData(item: { source?: string }): boolean {
    return item.source === 'demo';
  }
}
