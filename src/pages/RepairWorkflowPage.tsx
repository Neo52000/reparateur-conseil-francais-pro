
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CompleteWorkflow from '@/components/workflow/CompleteWorkflow';
import DisputeManagement from '@/components/dispute/DisputeManagement';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const RepairWorkflowPage = () => {
  const { quoteId } = useParams<{ quoteId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('workflow');

  if (!quoteId) {
    return <div>Devis non trouvé</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
              <h1 className="text-xl font-semibold text-gray-900">
                Suivi de réparation
              </h1>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="workflow">Workflow</TabsTrigger>
            <TabsTrigger value="dispute">Litiges</TabsTrigger>
          </TabsList>

          <TabsContent value="workflow">
            <CompleteWorkflow quoteId={quoteId} />
          </TabsContent>

          <TabsContent value="dispute">
            <DisputeManagement
              quoteId={quoteId}
              paymentIntentId="pi_example"
              status="active"
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default RepairWorkflowPage;
