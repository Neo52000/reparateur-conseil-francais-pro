import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  Activity, User, FileText, ShoppingCart, AlertCircle, 
  CheckCircle, Clock, ExternalLink 
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface ActivityItem {
  id: string;
  type: 'user' | 'quote' | 'order' | 'alert' | 'success';
  title: string;
  description: string;
  timestamp: Date;
  user?: {
    name: string;
    avatar?: string;
  };
  metadata?: {
    amount?: string;
    status?: string;
    priority?: 'low' | 'medium' | 'high';
  };
  actionUrl?: string;
}

const mockActivities: ActivityItem[] = [
  {
    id: '1',
    type: 'user',
    title: 'Nouveau réparateur inscrit',
    description: 'Jean Martin a créé son compte et attend validation',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    user: { name: 'Jean Martin' },
    actionUrl: '/admin?tab=repairers&id=123'
  },
  {
    id: '2',
    type: 'quote',
    title: 'Devis soumis',
    description: 'Réparation écran iPhone 14 Pro - En attente de validation',
    timestamp: new Date(Date.now() - 12 * 60 * 1000),
    metadata: { amount: '189€', status: 'pending' },
    actionUrl: '/admin?tab=quotes&id=456'
  },
  {
    id: '3',
    type: 'success',
    title: 'Commande complétée',
    description: 'Réparation batterie Samsung Galaxy terminée avec succès',
    timestamp: new Date(Date.now() - 45 * 60 * 1000),
    metadata: { amount: '79€', status: 'completed' },
    actionUrl: '/admin?tab=quotes&id=789'
  },
  {
    id: '4',
    type: 'alert',
    title: 'Stock faible',
    description: 'Écrans iPhone 13 - Seulement 3 unités restantes',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    metadata: { priority: 'high' },
    actionUrl: '/admin?tab=catalog&category=screens'
  },
  {
    id: '5',
    type: 'order',
    title: 'Nouvelle commande',
    description: 'Commande de pièces détachées par TechRepair Paris',
    timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
    metadata: { amount: '245€' },
    actionUrl: '/admin?tab=orders&id=101'
  }
];

const getActivityIcon = (type: ActivityItem['type']) => {
  switch (type) {
    case 'user': return User;
    case 'quote': return FileText;
    case 'order': return ShoppingCart;
    case 'alert': return AlertCircle;
    case 'success': return CheckCircle;
    default: return Activity;
  }
};

const getActivityColor = (type: ActivityItem['type']) => {
  switch (type) {
    case 'user': return 'text-admin-blue';
    case 'quote': return 'text-admin-orange';
    case 'order': return 'text-admin-purple';
    case 'alert': return 'text-admin-red';
    case 'success': return 'text-admin-green';
    default: return 'text-muted-foreground';
  }
};

const getBadgeVariant = (status?: string, priority?: string) => {
  if (priority === 'high') return 'destructive';
  if (status === 'completed') return 'default';
  if (status === 'pending') return 'secondary';
  return 'outline';
};

const RecentActivity: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="w-5 h-5 text-admin-blue" />
          Activité récente
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {mockActivities.map((activity) => {
          const Icon = getActivityIcon(activity.type);
          const iconColor = getActivityColor(activity.type);
          
          return (
            <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors group">
              <div className={`p-2 rounded-full bg-muted ${iconColor}`}>
                <Icon className="w-3 h-3" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium truncate">{activity.title}</h4>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {activity.description}
                    </p>
                    
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(activity.timestamp, { 
                          addSuffix: true, 
                          locale: fr 
                        })}
                      </div>
                      
                      {activity.metadata?.amount && (
                        <Badge variant="outline" className="text-xs">
                          {activity.metadata.amount}
                        </Badge>
                      )}
                      
                      {activity.metadata?.status && (
                        <Badge 
                          variant={getBadgeVariant(activity.metadata.status, activity.metadata.priority)}
                          className="text-xs"
                        >
                          {activity.metadata.status === 'pending' ? 'En attente' : 
                           activity.metadata.status === 'completed' ? 'Terminé' : 
                           activity.metadata.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  {activity.actionUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0"
                      asChild
                    >
                      <a href={activity.actionUrl}>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        
        <div className="pt-2">
          <Button variant="ghost" size="sm" className="w-full text-xs" asChild>
            <a href="/admin?tab=activity">
              Voir toute l'activité
              <ExternalLink className="w-3 h-3 ml-2" />
            </a>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentActivity;