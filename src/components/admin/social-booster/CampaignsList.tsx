
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useQuery } from '@tanstack/react-query';
import { socialBoosterService } from '@/services/social/socialBoosterService';
import { Loader2, Eye, Users } from 'lucide-react';
import type { SocialCampaign, CampaignStatus } from '@/types/socialBooster';

interface Props {
  onSelectCampaign: (id: string) => void;
}

const statusColors: Record<string, string> = {
  detected: 'bg-blue-100 text-blue-800',
  generated: 'bg-green-100 text-green-800',
  draft: 'bg-yellow-100 text-yellow-800',
  approved: 'bg-emerald-100 text-emerald-800',
  published: 'bg-purple-100 text-purple-800',
  failed: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
};

const CampaignsList: React.FC<Props> = ({ onSelectCampaign }) => {
  const [statusFilter, setStatusFilter] = useState('all');

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['social-campaigns', statusFilter],
    queryFn: () => socialBoosterService.getCampaigns(statusFilter),
  });

  const platformIcons: Record<string, string> = {
    facebook: '📘',
    instagram: '📸',
    x: '𝕏',
    linkedin: '💼',
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Campagnes sociales</CardTitle>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrer par statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="detected">Détectés</SelectItem>
            <SelectItem value="generated">Générés</SelectItem>
            <SelectItem value="draft">Brouillon</SelectItem>
            <SelectItem value="approved">Approuvés</SelectItem>
            <SelectItem value="published">Publiés</SelectItem>
            <SelectItem value="failed">Échoués</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : campaigns.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">Aucune campagne trouvée</p>
        ) : (
          <div className="space-y-3">
            {campaigns.map((campaign: SocialCampaign) => (
              <div key={campaign.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{campaign.blog_post?.title}</h4>
                    <div className="flex items-center gap-2 mt-2 flex-wrap">
                      <Badge className={statusColors[campaign.status] || 'bg-gray-100 text-gray-800'}>
                        {campaign.status}
                      </Badge>
                      {campaign.social_posts?.map(p => (
                        <span key={p.platform} title={p.platform} className="text-lg">
                          {platformIcons[p.platform] || p.platform}
                        </span>
                      ))}
                    </div>
                    {campaign.repairer && (
                      <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span>{campaign.repairer.business_name} ({campaign.repairer.city})</span>
                        {campaign.match_score && <span className="text-xs">— score: {campaign.match_score}</span>}
                      </div>
                    )}
                    {campaign.match_reason && (
                      <p className="text-xs text-muted-foreground mt-1 italic">{campaign.match_reason}</p>
                    )}
                  </div>
                  <Button size="sm" variant="outline" onClick={() => onSelectCampaign(campaign.id)}>
                    <Eye className="h-4 w-4 mr-1" /> Voir
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CampaignsList;
