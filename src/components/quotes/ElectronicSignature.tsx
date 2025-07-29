import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { PenTool, FileCheck, Download, Send, User, Calendar, MapPin, Phone, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';

interface SignatureData {
  signatureDataUrl: string;
  signedAt: string;
  ipAddress: string;
  userAgent: string;
  clientName: string;
  clientEmail: string;
  clientPhone?: string;
  clientAddress?: string;
}

interface ElectronicSignatureProps {
  quoteId: string;
  quoteData: any;
  onSignatureComplete?: (signatureData: SignatureData) => void;
}

const ElectronicSignature: React.FC<ElectronicSignatureProps> = ({ 
  quoteId, 
  quoteData, 
  onSignatureComplete 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureExists, setSignatureExists] = useState(false);
  const [clientInfo, setClientInfo] = useState({
    name: '',
    email: '',
    phone: '',
    address: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [signatureData, setSignatureData] = useState<SignatureData | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    setSignatureExists(true);
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.beginPath();
        ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
      }
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
        ctx.stroke();
      }
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setSignatureExists(false);
      }
    }
  };

  const getDeviceInfo = async () => {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return {
        ipAddress: data.ip,
        userAgent: navigator.userAgent
      };
    } catch (error) {
      return {
        ipAddress: 'Unknown',
        userAgent: navigator.userAgent
      };
    }
  };

  const submitSignature = async () => {
    if (!signatureExists || !clientInfo.name || !clientInfo.email) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez signer et remplir vos informations",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const canvas = canvasRef.current;
      if (!canvas) throw new Error("Canvas not found");

      const signatureDataUrl = canvas.toDataURL('image/png');
      const deviceInfo = await getDeviceInfo();
      
      const signature: SignatureData = {
        signatureDataUrl,
        signedAt: new Date().toISOString(),
        ipAddress: deviceInfo.ipAddress,
        userAgent: deviceInfo.userAgent,
        clientName: clientInfo.name,
        clientEmail: clientInfo.email,
        clientPhone: clientInfo.phone,
        clientAddress: clientInfo.address
      };

      // Sauvegarder la signature dans Supabase
      const { error: signatureError } = await supabase
        .from('electronic_signatures')
        .insert({
          quote_id: quoteId,
          signature_data_url: signatureDataUrl,
          client_name: clientInfo.name,
          client_email: clientInfo.email,
          client_phone: clientInfo.phone,
          client_address: clientInfo.address,
          signed_at: signature.signedAt,
          ip_address: signature.ipAddress,
          user_agent: signature.userAgent,
          verification_hash: btoa(signatureDataUrl + signature.signedAt)
        });

      if (signatureError) throw signatureError;

      // Mettre à jour le statut du devis
      const { error: quoteError } = await supabase
        .from('quotes_with_timeline')
        .update({ 
          status: 'client_signed',
          client_signature_date: signature.signedAt,
          updated_at: new Date().toISOString()
        })
        .eq('id', quoteId);

      if (quoteError) throw quoteError;

      setSignatureData(signature);
      onSignatureComplete?.(signature);

      toast({
        title: "Signature enregistrée",
        description: "Votre signature électronique a été sauvegardée avec succès",
      });

    } catch (error) {
      console.error('Error submitting signature:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer la signature",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const generatePDF = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-signed-quote-pdf', {
        body: {
          quoteId,
          signatureData
        }
      });

      if (error) throw error;

      // Télécharger le PDF
      const blob = new Blob([data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `devis-signe-${quoteId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "PDF généré",
        description: "Le devis signé a été téléchargé",
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast({
        title: "Erreur",
        description: "Impossible de générer le PDF",
        variant: "destructive"
      });
    }
  };

  if (signatureData) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <FileCheck className="h-5 w-5" />
              Devis signé électroniquement
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <FileCheck className="h-5 w-5 text-green-600" />
                <span className="font-medium text-green-800">Signature valide</span>
              </div>
              <div className="text-sm text-green-700">
                Signé par {signatureData.clientName} le{' '}
                {new Date(signatureData.signedAt).toLocaleString('fr-FR')}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Informations du client
                </h4>
                <div className="space-y-2 text-sm">
                  <div>Nom: {signatureData.clientName}</div>
                  <div>Email: {signatureData.clientEmail}</div>
                  {signatureData.clientPhone && <div>Téléphone: {signatureData.clientPhone}</div>}
                  {signatureData.clientAddress && <div>Adresse: {signatureData.clientAddress}</div>}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Informations de sécurité</h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>IP: {signatureData.ipAddress}</div>
                  <div>Date: {new Date(signatureData.signedAt).toLocaleString('fr-FR')}</div>
                  <Badge variant="outline" className="text-xs">
                    Signature vérifiée
                  </Badge>
                </div>
              </div>
            </div>

            <div className="border rounded-lg p-4">
              <h4 className="font-medium mb-2">Signature électronique</h4>
              <img 
                src={signatureData.signatureDataUrl} 
                alt="Signature" 
                className="border rounded max-w-full h-auto"
              />
            </div>

            <div className="flex gap-3">
              <Button onClick={generatePDF} className="flex-1">
                <Download className="mr-2 h-4 w-4" />
                Télécharger le PDF signé
              </Button>
              <Button variant="outline" onClick={() => window.print()}>
                <FileCheck className="mr-2 h-4 w-4" />
                Imprimer
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <PenTool className="h-5 w-5 text-primary" />
          Signature Électronique
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="quote" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="quote">Devis</TabsTrigger>
            <TabsTrigger value="client">Informations</TabsTrigger>
            <TabsTrigger value="signature">Signature</TabsTrigger>
          </TabsList>

          <TabsContent value="quote" className="space-y-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-semibold mb-3">Récapitulatif du devis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-600">Appareil</div>
                  <div className="font-medium">{quoteData?.device_brand} {quoteData?.device_model}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Réparation</div>
                  <div className="font-medium">{quoteData?.repair_type}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Prix</div>
                  <div className="font-bold text-lg text-primary">{quoteData?.estimated_price}€</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600">Garantie</div>
                  <div className="font-medium">{quoteData?.warranty_period_days || 180} jours</div>
                </div>
              </div>
              {quoteData?.issue_description && (
                <div className="mt-3">
                  <div className="text-sm text-gray-600">Description</div>
                  <div className="text-sm">{quoteData.issue_description}</div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="client" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="clientName">Nom complet *</Label>
                <Input
                  id="clientName"
                  value={clientInfo.name}
                  onChange={(e) => setClientInfo({...clientInfo, name: e.target.value})}
                  placeholder="Votre nom complet"
                />
              </div>
              <div>
                <Label htmlFor="clientEmail">Email *</Label>
                <Input
                  id="clientEmail"
                  type="email"
                  value={clientInfo.email}
                  onChange={(e) => setClientInfo({...clientInfo, email: e.target.value})}
                  placeholder="votre@email.com"
                />
              </div>
              <div>
                <Label htmlFor="clientPhone">Téléphone</Label>
                <Input
                  id="clientPhone"
                  value={clientInfo.phone}
                  onChange={(e) => setClientInfo({...clientInfo, phone: e.target.value})}
                  placeholder="06 12 34 56 78"
                />
              </div>
              <div>
                <Label htmlFor="clientAddress">Adresse</Label>
                <Input
                  id="clientAddress"
                  value={clientInfo.address}
                  onChange={(e) => setClientInfo({...clientInfo, address: e.target.value})}
                  placeholder="Votre adresse complète"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="signature" className="space-y-4">
            <div>
              <Label>Signature électronique *</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-2 mt-2">
                <canvas
                  ref={canvasRef}
                  width={500}
                  height={200}
                  className="w-full h-48 border rounded cursor-crosshair"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                />
              </div>
              <div className="flex justify-between mt-2">
                <p className="text-xs text-gray-500">
                  Signez dans le cadre ci-dessus
                </p>
                <Button variant="outline" size="sm" onClick={clearSignature}>
                  Effacer
                </Button>
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Déclaration de signature électronique</p>
                <p>
                  En signant électroniquement ce document, je certifie avoir lu et accepté 
                  les conditions du devis. Ma signature a la même valeur juridique qu'une 
                  signature manuscrite selon la réglementation eIDAS.
                </p>
              </div>
            </div>

            <Button 
              onClick={submitSignature} 
              disabled={isSubmitting || !signatureExists || !clientInfo.name || !clientInfo.email}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <PenTool className="mr-2 h-4 w-4 animate-pulse" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <FileCheck className="mr-2 h-4 w-4" />
                  Valider la signature électronique
                </>
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default ElectronicSignature;