import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Brain, PenTool, FileCheck } from 'lucide-react';
import IntelligentQuoteGenerator from '@/components/quotes/IntelligentQuoteGenerator';
import ElectronicSignature from '@/components/quotes/ElectronicSignature';

interface QuoteManagementProps {
  repairerId?: string;
}

const QuoteManagement: React.FC<QuoteManagementProps> = ({ repairerId = 'demo-repairer' }) => {
  const [selectedQuote, setSelectedQuote] = React.useState<any>(null);

  const handleQuoteGenerated = (quote: any) => {
    setSelectedQuote(quote);
  };

  const handleSignatureComplete = (signatureData: any) => {
    console.log('Signature completed:', signatureData);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            Gestion Intelligente des Devis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-600 mb-4">
            Générez des devis précis grâce à l'IA et obtenez des signatures électroniques sécurisées.
          </p>
          
          <Tabs defaultValue="generator" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="generator" className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Générateur IA
              </TabsTrigger>
              <TabsTrigger value="signature" className="flex items-center gap-2">
                <PenTool className="h-4 w-4" />
                Signature Électronique
              </TabsTrigger>
            </TabsList>

            <TabsContent value="generator" className="mt-6">
              <IntelligentQuoteGenerator 
                repairerId={repairerId}
                onQuoteGenerated={handleQuoteGenerated}
              />
            </TabsContent>

            <TabsContent value="signature" className="mt-6">
              {selectedQuote ? (
                <ElectronicSignature
                  quoteId={selectedQuote.id}
                  quoteData={selectedQuote}
                  onSignatureComplete={handleSignatureComplete}
                />
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center py-8">
                      <FileCheck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Aucun devis sélectionné
                      </h3>
                      <p className="text-gray-500">
                        Générez d'abord un devis avec l'IA pour pouvoir le faire signer électroniquement.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuoteManagement;