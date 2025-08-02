import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  ShoppingCart, 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  FileText,
  MessageSquare,
  Bell
} from 'lucide-react';
import { useRecentActivities } from '@/hooks/useRecentActivities';

const RecentActivity: React.FC = () => {
  const { activities, loading } = useRecentActivities();

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registration':
        return <User className="h-4 w-4 text-blue-500" />;
      case 'order_placed':
        return <ShoppingCart className="h-4 w-4 text-green-500" />;
      case 'system_update':
        return <Settings className="h-4 w-4 text-purple-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'message':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'notification':
        return <Bell className="h-4 w-4 text-orange-500" />;
      case 'document':
        return <FileText className="h-4 w-4 text-gray-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getActivityBadgeColor = (type: string) => {
    switch (type) {
      case 'user_registration':
        return 'bg-blue-100 text-blue-800';
      case 'order_placed':
        return 'bg-green-100 text-green-800';
      case 'system_update':
        return 'bg-purple-100 text-purple-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'success':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    if (diffInHours < 24) return `Il y a ${diffInHours}h`;
    if (diffInDays < 7) return `Il y a ${diffInDays}j`;
    
    return date.toLocaleDateString('fr-FR');
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Activité récente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 animate-pulse">
                <div className="w-8 h-8 bg-muted rounded-full"></div>
                <div className="flex-1">
                  <div className="w-3/4 h-4 bg-muted rounded mb-1"></div>
                  <div className="w-1/2 h-3 bg-muted rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Activité récente
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <div className="text-center py-8">
              <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Aucune activité récente</p>
              <p className="text-sm text-muted-foreground mt-1">
                Les nouvelles activités apparaîtront ici
              </p>
            </div>
          ) : (
            activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                  {getActivityIcon(activity.activity_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-medium truncate">
                      {activity.title}
                    </h4>
                    <Badge 
                      variant="secondary" 
                      className={`text-xs ${getActivityBadgeColor(activity.activity_type)}`}
                    >
                      {activity.activity_type.replace('_', ' ')}
                    </Badge>
                  </div>
                  {activity.description && (
                    <p className="text-xs text-muted-foreground mb-1 line-clamp-2">
                      {activity.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{formatTimeAgo(activity.created_at)}</span>
                    {activity.metadata?.location && (
                      <>
                        <span>•</span>
                        <span>{activity.metadata.location}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        {activities.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <button className="text-sm text-primary hover:underline w-full text-center">
              Voir toutes les activités
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default RecentActivity;