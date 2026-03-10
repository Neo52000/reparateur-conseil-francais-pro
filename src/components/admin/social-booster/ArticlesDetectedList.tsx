
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Scan, Sparkles, Loader2 } from 'lucide-react';
import { socialBoosterService } from '@/services/social/socialBoosterService';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import type { SocialCampaign } from '@/types/socialBooster';

interface Props {
  onSelectCampaign: (id: string) => void;
}

const ArticlesDetectedList: React.FC<Props> = ({ onSelectCampaign }) => {
  const queryClient = useQueryClient();

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['social-campaigns', 'detected'],
    queryFn: () => socialBoosterService.getCampaigns('detected'),
  });

  const scanMutation = useMutation({
    mutationFn: () => socialBoosterService.scanArticles(),
    onSuccess: (data) => {
      toast({ title: 'Scan terminé', description: `${data.new_campaigns} nouvel(s) article(s) détecté(s)` });
      queryClient.invalidateQueries({ queryKey: ['social-campaigns'] });
    },
    onError: (e: Error) => {
      toast({ title: 'Erreur scan', description: e.message, variant: 'destructive' });
    },
  });

  const generateMutation = useMutation({
    mutationFn: (campaignId: string) => socialBoosterService.generatePosts(campaignId),
    onSuccess: (data) => {
      toast({ title: 'Génération terminée', description: `${data.posts_generated} posts générés` });
      queryClient.invalidateQueries({ queryKey: ['social-campaigns'] });
    },
    onError: (e: Error) => {
      toast({ title: 'Erreur génération', description: e.message, variant: 'destructive' });
    },
  });

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Articles à traiter</CardTitle>
        <Button onClick={() => scanMutation.mutate()} disabled={scanMutation.isPending}>
          {scanMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Scan className="h-4 w-4 mr-2" />}
          Scanner les articles
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>Aucun article en attente. Cliquez sur "Scanner" pour détecter les nouveaux articles.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {campaigns.map((campaign: SocialCampaign) => (
              <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex-1">
                  <h4 className="font-medium text-foreground">{campaign.blog_post?.title || 'Article sans titre'}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {campaign.blog_post?.excerpt?.substring(0, 120)}...
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline">{campaign.status}</Badge>
                    {campaign.blog_post?.category && (
                      <Badge variant="secondary">{(campaign.blog_post.category as any)?.name}</Badge>
                    )}
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => generateMutation.mutate(campaign.id)}
                  disabled={generateMutation.isPending}
                >
                  {generateMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-1" />
                  )}
                  Générer
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ArticlesDetectedList;
