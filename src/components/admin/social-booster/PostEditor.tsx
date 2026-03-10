
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { socialBoosterService } from '@/services/social/socialBoosterService';
import { toast } from '@/hooks/use-toast';
import { Loader2, Copy, ExternalLink, Check, RefreshCw } from 'lucide-react';
import type { SocialPost, SocialPlatform } from '@/types/socialBooster';

interface Props {
  campaignId: string | null;
}

const platformConfig: Record<SocialPlatform, { label: string; icon: string; color: string; publishUrl: string }> = {
  facebook: { label: 'Facebook', icon: '📘', color: 'bg-blue-50 border-blue-200', publishUrl: 'https://www.facebook.com/' },
  instagram: { label: 'Instagram', icon: '📸', color: 'bg-pink-50 border-pink-200', publishUrl: 'https://www.instagram.com/' },
  x: { label: 'X (Twitter)', icon: '𝕏', color: 'bg-gray-50 border-gray-300', publishUrl: 'https://x.com/compose/post' },
  linkedin: { label: 'LinkedIn', icon: '💼', color: 'bg-blue-50 border-blue-300', publishUrl: 'https://www.linkedin.com/feed/' },
};

const PostEditor: React.FC<Props> = ({ campaignId }) => {
  const queryClient = useQueryClient();
  const [editingContent, setEditingContent] = useState<Record<string, string>>({});

  const { data: campaign, isLoading } = useQuery({
    queryKey: ['social-campaign', campaignId],
    queryFn: () => campaignId ? socialBoosterService.getCampaign(campaignId) : null,
    enabled: !!campaignId,
  });

  const updateMutation = useMutation({
    mutationFn: ({ postId, content }: { postId: string; content: string }) =>
      socialBoosterService.updatePost(postId, { content }),
    onSuccess: () => {
      toast({ title: 'Post mis à jour' });
      queryClient.invalidateQueries({ queryKey: ['social-campaign', campaignId] });
    },
  });

  const approveMutation = useMutation({
    mutationFn: (postId: string) => socialBoosterService.updatePost(postId, { status: 'approved' }),
    onSuccess: () => {
      toast({ title: 'Post approuvé ✅' });
      queryClient.invalidateQueries({ queryKey: ['social-campaign', campaignId] });
    },
  });

  const copyToClipboard = async (text: string, platform: string) => {
    await navigator.clipboard.writeText(text);
    toast({ title: `Copié !`, description: `Contenu ${platform} copié dans le presse-papier` });
    // Log the manual publish action
    if (campaignId) {
      const post = campaign?.social_posts?.find(p => p.platform === platform);
      if (post) {
        await socialBoosterService.logAction(post.id, campaignId, 'manual_copy', 'success');
      }
    }
  };

  if (!campaignId) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <p>Sélectionnez une campagne depuis l'onglet "Campagnes" pour éditer les posts.</p>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-12 flex justify-center">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  if (!campaign || !campaign.social_posts?.length) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          <p>Aucun post généré pour cette campagne. Générez d'abord les publications.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {campaign.blog_post?.title}
          </CardTitle>
          {campaign.repairer && (
            <p className="text-sm text-muted-foreground">
              Réparateur associé : <strong>{campaign.repairer.business_name}</strong> ({campaign.repairer.city})
              {campaign.match_reason && <span className="italic ml-2">— {campaign.match_reason}</span>}
            </p>
          )}
        </CardHeader>
      </Card>

      {campaign.social_posts.map((post: SocialPost) => {
        const config = platformConfig[post.platform];
        const currentContent = editingContent[post.id] ?? post.content;

        return (
          <Card key={post.id} className={`border-2 ${config.color}`}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">{config.icon}</span>
                  <CardTitle className="text-base">{config.label}</CardTitle>
                </div>
                <Badge variant={post.status === 'approved' ? 'default' : 'outline'}>
                  {post.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={currentContent}
                onChange={(e) => setEditingContent({ ...editingContent, [post.id]: e.target.value })}
                className="min-h-[150px] resize-y"
              />
              {post.hashtags && post.hashtags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {post.hashtags.map((tag, i) => (
                    <Badge key={i} variant="secondary" className="text-xs">{tag}</Badge>
                  ))}
                </div>
              )}
              {post.cta_url && (
                <p className="text-xs text-muted-foreground truncate">
                  CTA: {post.cta_text} → {post.cta_url}
                </p>
              )}
              <div className="flex items-center gap-2 flex-wrap">
                {editingContent[post.id] !== undefined && editingContent[post.id] !== post.content && (
                  <Button
                    size="sm"
                    onClick={() => updateMutation.mutate({ postId: post.id, content: currentContent })}
                    disabled={updateMutation.isPending}
                  >
                    <RefreshCw className="h-3 w-3 mr-1" /> Sauvegarder
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => copyToClipboard(currentContent, config.label)}>
                  <Copy className="h-3 w-3 mr-1" /> Copier
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(config.publishUrl, '_blank')}
                >
                  <ExternalLink className="h-3 w-3 mr-1" /> Publier sur {config.label}
                </Button>
                {post.status !== 'approved' && (
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => approveMutation.mutate(post.id)}
                    disabled={approveMutation.isPending}
                  >
                    <Check className="h-3 w-3 mr-1" /> Approuver
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default PostEditor;
