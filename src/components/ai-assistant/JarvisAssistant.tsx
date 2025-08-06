import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Brain, MessageCircle, Mic, MicOff, Send, Bot, User, 
  Zap, Settings, VolumeX, Volume2, Sparkles, FileText,
  Calculator, Search, TrendingUp, Clock, CheckCircle 
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  type?: 'text' | 'command' | 'suggestion';
  metadata?: any;
}

interface JarvisAssistantProps {
  repairerId: string;
  context?: any;
}

const JarvisAssistant: React.FC<JarvisAssistantProps> = ({ repairerId, context }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: '👋 Bonjour ! Je suis Jarvis, votre assistant IA. Comment puis-je vous aider aujourd\'hui ?',
      timestamp: new Date(),
      type: 'text'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(false);
  const [assistantMode, setAssistantMode] = useState<'chat' | 'voice' | 'commands'>('chat');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const quickCommands = [
    { icon: Calculator, label: 'Calculer prix', command: '/price', description: 'Aide au calcul de prix' },
    { icon: Search, label: 'Rechercher', command: '/search', description: 'Recherche dans la base' },
    { icon: TrendingUp, label: 'Analytics', command: '/analytics', description: 'Voir les statistiques' },
    { icon: FileText, label: 'Devis', command: '/quote', description: 'Créer un devis' },
    { icon: Clock, label: 'Planning', command: '/schedule', description: 'Gérer le planning' },
    { icon: CheckCircle, label: 'Tâches', command: '/tasks', description: 'Liste des tâches' },
  ];

  const suggestions = [
    "Comment puis-je améliorer mon taux de conversion ?",
    "Quels sont mes revenus de ce mois ?", 
    "Génère un devis pour un iPhone 14",
    "Quelles réparations sont les plus rentables ?",
    "Comment optimiser mes prix ?",
    "Montre-moi mes statistiques de satisfaction client"
  ];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (message?: string) => {
    const messageContent = message || inputMessage.trim();
    if (!messageContent || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
      timestamp: new Date(),
      type: messageContent.startsWith('/') ? 'command' : 'text'
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Traitement des commandes spéciales
      if (messageContent.startsWith('/')) {
        await handleCommand(messageContent);
      } else {
        await sendToAI(messageContent);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCommand = async (command: string) => {
    const cmd = command.toLowerCase();
    let response = '';
    let metadata = {};

    switch (true) {
      case cmd.startsWith('/price'):
        response = '💰 **Calculateur de prix activé**\n\nDonnez-moi les détails de la réparation et je calculerai le prix optimal basé sur :\n- Coût des pièces\n- Temps de main d\'œuvre\n- Marge recommandée\n- Prix du marché local';
        metadata = { type: 'price_calculator' };
        break;

      case cmd.startsWith('/search'):
        response = '🔍 **Recherche activée**\n\nQue souhaitez-vous rechercher ?\n- Clients\n- Réparations\n- Pièces détachées\n- Historique\n- Documentation';
        metadata = { type: 'search' };
        break;

      case cmd.startsWith('/analytics'):
        response = await getAnalyticsData();
        metadata = { type: 'analytics' };
        break;

      case cmd.startsWith('/quote'):
        response = '📄 **Générateur de devis**\n\nPour créer un devis, j\'ai besoin de :\n1. Type d\'appareil\n2. Marque et modèle\n3. Type de réparation\n4. Urgence du client\n\nVoulez-vous utiliser le générateur IA ?';
        metadata = { type: 'quote_generator' };
        break;

      case cmd.startsWith('/schedule'):
        response = '📅 **Gestionnaire de planning**\n\nOptions disponibles :\n- Voir le planning du jour\n- Ajouter un rendez-vous\n- Modifier un créneau\n- Voir la disponibilité\n\nQue souhaitez-vous faire ?';
        metadata = { type: 'schedule' };
        break;

      case cmd.startsWith('/tasks'):
        response = '✅ **Liste des tâches**\n\n• Répondre aux devis en attente (3)\n• Appeler Mme Dupont pour son iPhone\n• Commander écrans Samsung S23\n• Mettre à jour les prix\n• Vérifier les stocks\n\nVoulez-vous plus de détails sur une tâche ?';
        metadata = { type: 'tasks' };
        break;

      default:
        response = '❓ Commande non reconnue. Tapez `/help` pour voir toutes les commandes disponibles.';
    }

    const assistantMessage: Message = {
      id: Date.now().toString(),
      role: 'assistant',
      content: response,
      timestamp: new Date(),
      type: 'command',
      metadata
    };

    setMessages(prev => [...prev, assistantMessage]);
  };

  const sendToAI = async (message: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('jarvis-assistant', {
        body: {
          message,
          repairerId,
          context: {
            ...context,
            previousMessages: messages.slice(-5)
          }
        }
      });

      if (error) throw error;

      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.response || 'Désolé, je n\'ai pas pu traiter votre demande.',
        timestamp: new Date(),
        type: 'text',
        metadata: data.metadata
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Text-to-speech si activé
      if (voiceEnabled && data.response) {
        await speakText(data.response);
      }

    } catch (error) {
      console.error('Error with AI:', error);
      
      // Réponse de fallback
      const fallbackMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: 'Je ne peux pas me connecter au service IA pour le moment. Puis-je vous aider avec une commande spécifique ? Tapez `/help` pour voir les options.',
        timestamp: new Date(),
        type: 'text'
      };

      setMessages(prev => [...prev, fallbackMessage]);
    }
  };

  const getAnalyticsData = async (): Promise<string> => {
    // Simulation de données analytics
    return `📊 **Tableau de bord - ${new Date().toLocaleDateString('fr-FR')}**

**💰 Chiffre d'affaires**
• Ce mois : 2,450€ (+15%)
• Cette semaine : 625€
• Aujourd'hui : 125€

**📱 Réparations**
• Total ce mois : 28 réparations
• Taux de réussite : 96%
• Temps moyen : 42 min

**⭐ Satisfaction client**
• Note moyenne : 4.8/5
• Avis positifs : 94%
• Recommandations : 12

**🔧 Top réparations**
1. Écran iPhone (40%)
2. Batterie Samsung (25%)
3. Charge iPad (15%)

Voulez-vous plus de détails sur une métrique ?`;
  };

  const speakText = async (text: string) => {
    if ('speechSynthesis' in window) {
      setIsSpeaking(true);
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'fr-FR';
      utterance.rate = 0.9;
      utterance.onend = () => setIsSpeaking(false);
      speechSynthesis.speak(utterance);
    }
  };

  const startListening = () => {
    if ('webkitSpeechRecognition' in window) {
      const recognition = new (window as any).webkitSpeechRecognition();
      recognition.lang = 'fr-FR';
      recognition.continuous = false;
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage(transcript);
      };

      recognition.onerror = () => {
        toast({
          title: "Erreur vocale",
          description: "Impossible d'utiliser la reconnaissance vocale",
          variant: "destructive"
        });
        setIsListening(false);
      };

      recognition.start();
    } else {
      toast({
        title: "Non supporté",
        description: "La reconnaissance vocale n'est pas supportée",
        variant: "destructive"
      });
    }
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  return (
    <div className="flex flex-col h-full max-h-[800px]">
      <Card className="flex-1 flex flex-col">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Jarvis Assistant IA
              <Badge variant="outline" className="ml-2">
                {assistantMode === 'chat' && 'Chat'}
                {assistantMode === 'voice' && 'Vocal'}
                {assistantMode === 'commands' && 'Commandes'}
              </Badge>
            </CardTitle>
            
            <div className="flex items-center gap-2">
              {isSpeaking && (
                <Button size="sm" variant="outline" onClick={stopSpeaking}>
                  <VolumeX className="h-4 w-4" />
                </Button>
              )}
              
              <Button 
                size="sm" 
                variant={voiceEnabled ? "default" : "outline"}
                onClick={() => setVoiceEnabled(!voiceEnabled)}
              >
                {voiceEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col p-0">
          <Tabs value={assistantMode} onValueChange={(v) => setAssistantMode(v as any)}>
            <TabsList className="mx-4 mb-4">
              <TabsTrigger value="chat" className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4" />
                Chat
              </TabsTrigger>
              <TabsTrigger value="voice" className="flex items-center gap-2">
                <Mic className="h-4 w-4" />
                Vocal
              </TabsTrigger>
              <TabsTrigger value="commands" className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Commandes
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="flex-1 flex flex-col m-0">
              <ScrollArea className="flex-1 px-4">
                <div className="space-y-4 pb-4">
                  <AnimatePresence>
                    {messages.map((message) => (
                      <motion.div
                        key={message.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex gap-3 max-w-[80%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                            message.role === 'user' 
                              ? 'bg-primary text-primary-foreground' 
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                          </div>
                          
                          <div className={`rounded-lg px-4 py-2 ${
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}>
                            <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                            <div className="text-xs opacity-70 mt-1">
                              {message.timestamp.toLocaleTimeString('fr-FR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  
                  {isLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex justify-start"
                    >
                      <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div className="bg-muted rounded-lg px-4 py-2">
                          <div className="flex gap-1">
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} />
                            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} />
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>
                <div ref={messagesEndRef} />
              </ScrollArea>

              {/* Suggestions rapides */}
              <div className="px-4 pb-3">
                <div className="flex gap-2 flex-wrap">
                  {suggestions.slice(0, 3).map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => handleSendMessage(suggestion)}
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Input de chat */}
              <div className="px-4 pb-4">
                <div className="flex gap-2">
                  <Input
                    ref={inputRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Tapez votre message ou /help pour les commandes..."
                    onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1"
                  />
                  
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={startListening}
                    disabled={isListening}
                  >
                    {isListening ? (
                      <MicOff className="h-4 w-4 text-red-500" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </Button>
                  
                  <Button 
                    onClick={() => handleSendMessage()}
                    disabled={!inputMessage.trim() || isLoading}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="voice" className="flex-1 p-4">
              <div className="text-center space-y-6">
                <div className="text-6xl">🎤</div>
                <h3 className="text-lg font-medium">Mode Vocal</h3>
                <p className="text-muted-foreground">
                  Parlez directement avec Jarvis. Cliquez sur le microphone pour commencer.
                </p>
                
                <Button
                  size="lg"
                  onClick={startListening}
                  disabled={isListening}
                  className={`rounded-full w-20 h-20 ${
                    isListening ? 'bg-red-500 hover:bg-red-600' : ''
                  }`}
                >
                  {isListening ? (
                    <MicOff className="h-8 w-8" />
                  ) : (
                    <Mic className="h-8 w-8" />
                  )}
                </Button>
                
                <p className="text-sm text-muted-foreground">
                  {isListening ? 'Écoute en cours...' : 'Cliquez pour parler'}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="commands" className="flex-1 p-4">
              <div className="space-y-4">
                <h3 className="font-medium">Commandes rapides</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {quickCommands.map((cmd, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="flex items-center gap-3 h-auto p-4 justify-start"
                      onClick={() => handleSendMessage(cmd.command)}
                    >
                      <cmd.icon className="h-5 w-5 text-primary" />
                      <div className="text-left">
                        <div className="font-medium">{cmd.label}</div>
                        <div className="text-xs text-muted-foreground">{cmd.description}</div>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default JarvisAssistant;