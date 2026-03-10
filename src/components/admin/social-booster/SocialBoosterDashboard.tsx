
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Share2, FileText, Edit3, ScrollText } from 'lucide-react';
import ArticlesDetectedList from './ArticlesDetectedList';
import CampaignsList from './CampaignsList';
import PostEditor from './PostEditor';
import SocialBoosterLogs from './SocialBoosterLogs';

const SocialBoosterDashboard: React.FC = () => {
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Share2 className="h-8 w-8 text-primary" />
          Blog Booster Social
        </h1>
        <p className="text-muted-foreground mt-1">
          Transformez vos articles de blog en publications sociales multi-réseaux
        </p>
      </div>

      <Tabs defaultValue="articles" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="articles" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Articles détectés
          </TabsTrigger>
          <TabsTrigger value="campaigns" className="flex items-center gap-2">
            <Share2 className="h-4 w-4" />
            Campagnes
          </TabsTrigger>
          <TabsTrigger value="editor" className="flex items-center gap-2">
            <Edit3 className="h-4 w-4" />
            Éditeur
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <ScrollText className="h-4 w-4" />
            Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="articles">
          <ArticlesDetectedList onSelectCampaign={setSelectedCampaignId} />
        </TabsContent>

        <TabsContent value="campaigns">
          <CampaignsList onSelectCampaign={setSelectedCampaignId} />
        </TabsContent>

        <TabsContent value="editor">
          <PostEditor campaignId={selectedCampaignId} />
        </TabsContent>

        <TabsContent value="logs">
          <SocialBoosterLogs />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SocialBoosterDashboard;
