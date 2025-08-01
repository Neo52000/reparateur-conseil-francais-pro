import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, Users, FileText, Settings, Zap, Globe, 
  MessageSquare, BarChart3, Shield, Clock 
} from 'lucide-react';

interface QuickAction {
  title: string;
  description: string;
  icon: React.ElementType;
  href: string;
  color: 'blue' | 'green' | 'purple' | 'orange';
  isNew?: boolean;
  shortcut?: string;
}

const quickActions: QuickAction[] = [
  {
    title: 'Ajouter un réparateur',
    description: 'Créer un nouveau profil réparateur',
    icon: Users,
    href: '/admin?tab=repairers&action=add',
    color: 'blue',
    shortcut: 'Ctrl+N'
  },
  {
    title: 'Nouveau devis',
    description: 'Créer une demande de devis',
    icon: FileText,
    href: '/admin?tab=quotes&action=add',
    color: 'green',
    isNew: true
  },
  {
    title: 'Campagne IA',
    description: 'Lancer une campagne publicitaire',
    icon: Zap,
    href: '/admin?tab=advertising-ai',
    color: 'purple',
    shortcut: 'Ctrl+A'
  },
  {
    title: 'Page de destination',
    description: 'Créer une landing page',
    icon: Globe,
    href: '/admin?tab=landing-pages&action=add',
    color: 'orange'
  }
];

const colorClasses = {
  blue: 'bg-admin-blue-light border-admin-blue/20 hover:border-admin-blue/40',
  green: 'bg-admin-green-light border-admin-green/20 hover:border-admin-green/40',
  purple: 'bg-admin-purple-light border-admin-purple/20 hover:border-admin-purple/40',
  orange: 'bg-admin-orange-light border-admin-orange/20 hover:border-admin-orange/40'
};

const iconClasses = {
  blue: 'text-admin-blue',
  green: 'text-admin-green',
  purple: 'text-admin-purple',
  orange: 'text-admin-orange'
};

const QuickActions: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-admin-purple" />
          Actions rapides
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Button
              key={index}
              variant="ghost"
              className={`w-full justify-start h-auto p-3 ${colorClasses[action.color]} border-l-4 hover-lift transition-all duration-200`}
              asChild
            >
              <a href={action.href}>
                <div className="flex items-start gap-3 w-full">
                  <Icon className={`w-5 h-5 mt-0.5 ${iconClasses[action.color]}`} />
                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{action.title}</span>
                      {action.isNew && (
                        <Badge variant="destructive" className="h-4 px-1 text-[10px]">NEW</Badge>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {action.description}
                    </p>
                    {action.shortcut && (
                      <div className="mt-2">
                        <Badge variant="outline" className="h-5 px-1.5 text-[10px] font-mono">
                          {action.shortcut}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </a>
            </Button>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default QuickActions;