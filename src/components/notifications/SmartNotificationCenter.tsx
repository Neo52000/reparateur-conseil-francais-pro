import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bell, X, AlertCircle, Info, CheckCircle, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNotifications } from '@/hooks/useNotifications';
import { enhancedToast } from '@/components/ui/enhanced-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface NotificationItem {
  id: string;
  type: 'urgent' | 'important' | 'info';
  category: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionLabel?: string;
  onAction?: () => void;
}

export const SmartNotificationCenter: React.FC<{ userId?: string }> = ({ userId }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const { notifications: rawNotifications, loading } = useNotifications(userId);

  const notifications: NotificationItem[] = rawNotifications.map(n => ({
    id: n.id,
    type: n.data?.priority === 'high' ? 'urgent' : n.data?.priority === 'medium' ? 'important' : 'info',
    category: n.type,
    title: n.title,
    message: n.message,
    timestamp: n.created_at,
    read: n.is_read,
  }));

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications;

  const groupedNotifications = filteredNotifications.reduce((acc, notif) => {
    if (!acc[notif.category]) {
      acc[notif.category] = [];
    }
    acc[notif.category].push(notif);
    return acc;
  }, {} as Record<string, NotificationItem[]>);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getTypeConfig = (type: NotificationItem['type']) => {
    switch (type) {
      case 'urgent':
        return {
          icon: AlertCircle,
          bg: 'bg-destructive/10',
          border: 'border-l-destructive',
          badge: 'destructive' as const,
        };
      case 'important':
        return {
          icon: Info,
          bg: 'bg-status-warning-light/50',
          border: 'border-l-status-warning',
          badge: 'default' as const,
        };
      default:
        return {
          icon: CheckCircle,
          bg: 'bg-status-info-light/50',
          border: 'border-l-status-info',
          badge: 'secondary' as const,
        };
    }
  };

  const markAsRead = async (id: string) => {
    // TODO: Implement mark as read
    enhancedToast.success({ title: 'Notification marquée comme lue' });
  };

  const markAllAsRead = async () => {
    // TODO: Implement mark all as read
    enhancedToast.success({ title: 'Toutes les notifications marquées comme lues' });
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="relative"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1"
          >
            <Badge variant="destructive" className="h-5 w-5 p-0 flex items-center justify-center text-xs">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          </motion.div>
        )}
      </Button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 top-full mt-2 w-96 z-50"
          >
            <Card className="shadow-2xl border-2">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">Notifications</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                      Tout marquer lu
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsOpen(false)}
                      className="h-8 w-8 p-0"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="all">
                      Toutes ({notifications.length})
                    </TabsTrigger>
                    <TabsTrigger value="unread">
                      Non lues ({unreadCount})
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
              </CardHeader>

              <CardContent className="max-h-[500px] overflow-y-auto p-0">
                {loading ? (
                  <div className="p-8 text-center text-muted-foreground">
                    Chargement...
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Bell className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p>Aucune notification</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {Object.entries(groupedNotifications).map(([category, items]) => (
                      <div key={category}>
                        <div className="px-4 py-2 bg-muted/30">
                          <p className="text-xs font-semibold text-muted-foreground uppercase">
                            {category} ({items.length})
                          </p>
                        </div>
                        {items.map((notif) => {
                          const config = getTypeConfig(notif.type);
                          const Icon = config.icon;

                          return (
                            <motion.div
                              key={notif.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              className={`p-4 border-l-4 ${config.border} ${config.bg} ${
                                !notif.read ? 'bg-opacity-100' : 'bg-opacity-50'
                              } hover:bg-opacity-70 transition-all cursor-pointer`}
                              onClick={() => !notif.read && markAsRead(notif.id)}
                            >
                              <div className="flex items-start gap-3">
                                <Icon className="h-5 w-5 flex-shrink-0 mt-0.5" />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-2 mb-1">
                                    <p className={`font-medium text-sm ${!notif.read ? 'text-foreground' : 'text-muted-foreground'}`}>
                                      {notif.title}
                                    </p>
                                    {!notif.read && (
                                      <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {notif.message}
                                  </p>
                                  <div className="flex items-center justify-between mt-2">
                                    <span className="text-xs text-muted-foreground">
                                      {format(new Date(notif.timestamp), 'PPp', { locale: fr })}
                                    </span>
                                    {notif.actionLabel && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 text-xs"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          notif.onAction?.();
                                        }}
                                      >
                                        {notif.actionLabel}
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
