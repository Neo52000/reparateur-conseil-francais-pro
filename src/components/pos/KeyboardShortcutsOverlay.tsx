import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Keyboard, 
  X, 
  Euro, 
  CreditCard, 
  Search, 
  ScanLine,
  FolderOpen,
  FolderX,
  Trash2
} from 'lucide-react';

interface KeyboardShortcut {
  key: string;
  description: string;
  icon: React.ReactNode;
  category: string;
}

const shortcuts: KeyboardShortcut[] = [
  {
    key: 'F1',
    description: 'Paiement Espèces',
    icon: <Euro className="w-4 h-4" />,
    category: 'Paiement'
  },
  {
    key: 'F2',
    description: 'Paiement Carte',
    icon: <CreditCard className="w-4 h-4" />,
    category: 'Paiement'
  },
  {
    key: 'F3',
    description: 'Rechercher Produit',
    icon: <Search className="w-4 h-4" />,
    category: 'Navigation'
  },
  {
    key: 'F4',
    description: 'Scanner Code-barres',
    icon: <ScanLine className="w-4 h-4" />,
    category: 'Navigation'
  },
  {
    key: 'Ctrl+O',
    description: 'Ouvrir Session',
    icon: <FolderOpen className="w-4 h-4" />,
    category: 'Session'
  },
  {
    key: 'Ctrl+W',
    description: 'Fermer Session',
    icon: <FolderX className="w-4 h-4" />,
    category: 'Session'
  },
  {
    key: 'Escape',
    description: 'Vider Panier',
    icon: <Trash2 className="w-4 h-4" />,
    category: 'Actions'
  }
];

interface KeyboardShortcutsOverlayProps {
  isVisible: boolean;
  onClose: () => void;
}

const KeyboardShortcutsOverlay: React.FC<KeyboardShortcutsOverlayProps> = ({
  isVisible,
  onClose
}) => {
  const [activeKey, setActiveKey] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isVisible) return;

      // Fermer avec Escape
      if (event.key === 'Escape') {
        onClose();
        return;
      }

      // Mettre en évidence la touche pressée
      const keyPressed = event.ctrlKey || event.metaKey 
        ? `Ctrl+${event.key.toUpperCase()}`
        : event.key.toUpperCase();
      
      const shortcut = shortcuts.find(s => s.key.toUpperCase() === keyPressed);
      if (shortcut) {
        setActiveKey(shortcut.key);
        setTimeout(() => setActiveKey(null), 1000);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const groupedShortcuts = shortcuts.reduce((acc, shortcut) => {
    if (!acc[shortcut.category]) {
      acc[shortcut.category] = [];
    }
    acc[shortcut.category].push(shortcut);
    return acc;
  }, {} as Record<string, KeyboardShortcut[]>);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center animate-fade-in">
      <Card className="w-full max-w-2xl mx-4 animate-scale-in">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Keyboard className="w-6 h-6 text-primary" />
              <h2 className="text-xl font-bold">Raccourcis Clavier</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
              <div key={category} className="space-y-3">
                <h3 className="font-semibold text-lg text-slate-700 border-b pb-2">
                  {category}
                </h3>
                <div className="space-y-2">
                  {categoryShortcuts.map((shortcut) => (
                    <div
                      key={shortcut.key}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-300 ${
                        activeKey === shortcut.key
                          ? 'bg-primary/10 border-primary shadow-lg scale-105'
                          : 'bg-slate-50 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-slate-600">
                          {shortcut.icon}
                        </div>
                        <span className="font-medium text-slate-800">
                          {shortcut.description}
                        </span>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`font-mono text-xs ${
                          activeKey === shortcut.key
                            ? 'bg-primary text-primary-foreground border-primary'
                            : ''
                        }`}
                      >
                        {shortcut.key}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t text-center">
            <p className="text-sm text-slate-600">
              Appuyez sur <Badge variant="outline" className="font-mono">Escape</Badge> pour fermer
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default KeyboardShortcutsOverlay;