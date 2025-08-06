import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Play,
  Square,
  Clock,
  DollarSign,
  Receipt,
  TrendingUp,
  Users,
  Calculator,
  Printer,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface POSSession {
  id: string;
  sessionNumber: string;
  startTime: Date;
  endTime?: Date;
  openingCash: number;
  closingCash?: number;
  expectedCash?: number;
  variance?: number;
  transactionCount: number;
  totalSales: number;
  totalTax: number;
  cashSales: number;
  cardSales: number;
  status: 'active' | 'closed' | 'suspended';
  cashierName: string;
  notes?: string;
}

interface POSSessionManagerProps {
  repairer_id: string;
  onSessionChange?: (session: POSSession | null) => void;
}

const POSSessionManager: React.FC<POSSessionManagerProps> = ({ 
  repairer_id, 
  onSessionChange 
}) => {
  const [currentSession, setCurrentSession] = useState<POSSession | null>(null);
  const [isStartDialogOpen, setIsStartDialogOpen] = useState(false);
  const [isCloseDialogOpen, setIsCloseDialogOpen] = useState(false);
  const [openingCash, setOpeningCash] = useState<string>('100.00');
  const [closingCash, setClosingCash] = useState<string>('');
  const [sessionNotes, setSessionNotes] = useState<string>('');

  // Simulation des données de session
  const mockSessionData = {
    transactionCount: 12,
    totalSales: 847.50,
    totalTax: 169.50,
    cashSales: 320.00,
    cardSales: 527.50
  };

  const startSession = () => {
    const newSession: POSSession = {
      id: `session_${Date.now()}`,
      sessionNumber: `S${format(new Date(), 'yyyyMMdd')}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`,
      startTime: new Date(),
      openingCash: parseFloat(openingCash),
      transactionCount: 0,
      totalSales: 0,
      totalTax: 0,
      cashSales: 0,
      cardSales: 0,
      status: 'active',
      cashierName: 'Jean Martin' // En réalité, récupéré depuis l'utilisateur connecté
    };

    setCurrentSession(newSession);
    onSessionChange?.(newSession);
    setIsStartDialogOpen(false);
  };

  const closeSession = () => {
    if (!currentSession) return;

    const closingCashAmount = parseFloat(closingCash);
    const expectedCashAmount = currentSession.openingCash + mockSessionData.cashSales;
    const variance = closingCashAmount - expectedCashAmount;

    const closedSession: POSSession = {
      ...currentSession,
      ...mockSessionData,
      endTime: new Date(),
      closingCash: closingCashAmount,
      expectedCash: expectedCashAmount,
      variance: variance,
      status: 'closed',
      notes: sessionNotes
    };

    setCurrentSession(null);
    onSessionChange?.(null);
    setIsCloseDialogOpen(false);
    setClosingCash('');
    setSessionNotes('');
    
    // En réalité, sauvegarder la session fermée
    console.log('Session closed:', closedSession);
  };

  const getSessionDuration = () => {
    if (!currentSession) return '00:00';
    const now = new Date();
    const diff = now.getTime() - currentSession.startTime.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* État de la session */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="w-5 h-5" />
            Session de Caisse
          </CardTitle>
        </CardHeader>
        <CardContent>
          {currentSession ? (
            <div className="space-y-4">
              {/* Informations session active */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Badge className="bg-admin-green text-white">
                      <Play className="w-3 h-3 mr-1" />
                      Session Active
                    </Badge>
                    <span className="font-medium">{currentSession.sessionNumber}</span>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Démarrée à {format(currentSession.startTime, 'HH:mm', { locale: fr })} • 
                    Durée: {getSessionDuration()}
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setIsCloseDialogOpen(true)}
                  className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  <Square className="w-4 h-4 mr-2" />
                  Clôturer Session
                </Button>
              </div>

              {/* Statistiques de session */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-admin-blue">{mockSessionData.transactionCount}</div>
                  <div className="text-sm text-muted-foreground">Transactions</div>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-admin-green">{mockSessionData.totalSales.toFixed(2)}€</div>
                  <div className="text-sm text-muted-foreground">Ventes</div>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-admin-purple">{mockSessionData.cashSales.toFixed(2)}€</div>
                  <div className="text-sm text-muted-foreground">Espèces</div>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <div className="text-2xl font-bold text-admin-orange">{mockSessionData.cardSales.toFixed(2)}€</div>
                  <div className="text-sm text-muted-foreground">Cartes</div>
                </div>
              </div>

              {/* Fond de caisse */}
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-2">Fond de Caisse</h4>
                <div className="flex justify-between items-center">
                  <span>Ouverture:</span>
                  <span className="font-medium">{currentSession.openingCash.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Espèces vendues:</span>
                  <span className="font-medium text-admin-green">+{mockSessionData.cashSales.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between items-center font-bold border-t pt-2 mt-2">
                  <span>Attendu en caisse:</span>
                  <span>{(currentSession.openingCash + mockSessionData.cashSales).toFixed(2)}€</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-medium mb-2">Aucune session active</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Démarrez une nouvelle session pour commencer à enregistrer les ventes
              </p>
              <Button onClick={() => setIsStartDialogOpen(true)} className="bg-admin-green hover:bg-admin-green/90">
                <Play className="w-4 h-4 mr-2" />
                Ouvrir Session
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog ouverture session */}
      <Dialog open={isStartDialogOpen} onOpenChange={setIsStartDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ouverture de Session</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="opening_cash">Montant d'ouverture (€)</Label>
              <Input
                id="opening_cash"
                type="number"
                step="0.01"
                value={openingCash}
                onChange={(e) => setOpeningCash(e.target.value)}
                placeholder="100.00"
              />
              <p className="text-sm text-muted-foreground">
                Montant en espèces présent dans la caisse au début de la session
              </p>
            </div>
            
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsStartDialogOpen(false)}>
                Annuler
              </Button>
              <Button onClick={startSession} className="bg-admin-green hover:bg-admin-green/90">
                <Play className="w-4 h-4 mr-2" />
                Démarrer Session
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog clôture session */}
      <Dialog open={isCloseDialogOpen} onOpenChange={setIsCloseDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Clôture de Session</DialogTitle>
          </DialogHeader>
          {currentSession && (
            <div className="space-y-6">
              {/* Résumé session */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-muted-foreground">Session</div>
                  <div className="font-medium">{currentSession.sessionNumber}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Durée</div>
                  <div className="font-medium">{getSessionDuration()}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Transactions</div>
                  <div className="font-medium">{mockSessionData.transactionCount}</div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Ventes totales</div>
                  <div className="font-medium text-admin-green">{mockSessionData.totalSales.toFixed(2)}€</div>
                </div>
              </div>

              {/* Comptage caisse */}
              <div className="border rounded-lg p-4">
                <h4 className="font-medium mb-4">Comptage de Caisse</h4>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <div className="text-sm text-muted-foreground">Ouverture</div>
                    <div className="font-medium">{currentSession.openingCash.toFixed(2)}€</div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground">Ventes espèces</div>
                    <div className="font-medium text-admin-green">+{mockSessionData.cashSales.toFixed(2)}€</div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="closing_cash">Montant compté en caisse (€)</Label>
                  <Input
                    id="closing_cash"
                    type="number"
                    step="0.01"
                    value={closingCash}
                    onChange={(e) => setClosingCash(e.target.value)}
                    placeholder={(currentSession.openingCash + mockSessionData.cashSales).toFixed(2)}
                  />
                </div>
                
                {closingCash && (
                  <div className="mt-4 p-3 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <span>Attendu:</span>
                      <span className="font-medium">{(currentSession.openingCash + mockSessionData.cashSales).toFixed(2)}€</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Compté:</span>
                      <span className="font-medium">{parseFloat(closingCash).toFixed(2)}€</span>
                    </div>
                    <div className={`flex justify-between items-center font-bold border-t pt-2 mt-2 ${
                      parseFloat(closingCash) - (currentSession.openingCash + mockSessionData.cashSales) === 0 
                        ? 'text-admin-green' 
                        : 'text-destructive'
                    }`}>
                      <span>Écart:</span>
                      <span>
                        {(parseFloat(closingCash) - (currentSession.openingCash + mockSessionData.cashSales)) >= 0 ? '+' : ''}
                        {(parseFloat(closingCash) - (currentSession.openingCash + mockSessionData.cashSales)).toFixed(2)}€
                      </span>
                    </div>
                    {Math.abs(parseFloat(closingCash) - (currentSession.openingCash + mockSessionData.cashSales)) > 0 && (
                      <div className="flex items-center gap-2 mt-2 text-sm text-muted-foreground">
                        <AlertCircle className="w-4 h-4" />
                        Un écart de caisse a été détecté
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="session_notes">Notes de session (optionnel)</Label>
                <Textarea
                  id="session_notes"
                  value={sessionNotes}
                  onChange={(e) => setSessionNotes(e.target.value)}
                  placeholder="Commentaires, incidents, observations..."
                  rows={3}
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCloseDialogOpen(false)}>
                  Annuler
                </Button>
                <Button 
                  onClick={closeSession}
                  disabled={!closingCash}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  <Square className="w-4 h-4 mr-2" />
                  Clôturer Session
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default POSSessionManager;