import React, { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

interface POSKeyboardShortcutsProps {
  onOpenSession: () => void;
  onCloseSession: () => void;
  onProcessPayment: (method: 'cash' | 'card') => void;
  onClearCart: () => void;
  onAddProduct: (barcode?: string) => void;
  disabled?: boolean;
}

/**
 * Gestion des raccourcis clavier pour le POS (conformité NF-525)
 */
const POSKeyboardShortcuts: React.FC<POSKeyboardShortcutsProps> = ({
  onOpenSession,
  onCloseSession,
  onProcessPayment,
  onClearCart,
  onAddProduct,
  disabled = false
}) => {
  const { toast } = useToast();

  useEffect(() => {
    if (disabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignorer si on est dans un input
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Raccourcis avec Ctrl/Cmd
      if (event.ctrlKey || event.metaKey) {
        switch (event.key.toLowerCase()) {
          case 'o': // Ctrl+O : Ouvrir session
            event.preventDefault();
            onOpenSession();
            toast({
              title: "Raccourci utilisé",
              description: "Ctrl+O : Ouverture de session",
              duration: 1000
            });
            break;
          case 'w': // Ctrl+W : Fermer session
            event.preventDefault();
            onCloseSession();
            toast({
              title: "Raccourci utilisé", 
              description: "Ctrl+W : Fermeture de session",
              duration: 1000
            });
            break;
          case 'delete': // Ctrl+Delete : Vider panier
          case 'backspace':
            event.preventDefault();
            onClearCart();
            toast({
              title: "Raccourci utilisé",
              description: "Ctrl+Delete : Panier vidé",
              duration: 1000
            });
            break;
        }
        return;
      }

      // Touches fonction
      switch (event.key) {
        case 'F1': // F1 : Paiement espèces
          event.preventDefault();
          onProcessPayment('cash');
          toast({
            title: "Raccourci utilisé",
            description: "F1 : Paiement espèces",
            duration: 1000
          });
          break;
        case 'F2': // F2 : Paiement carte
          event.preventDefault();
          onProcessPayment('card');
          toast({
            title: "Raccourci utilisé",
            description: "F2 : Paiement carte",
            duration: 1000
          });
          break;
        case 'F3': // F3 : Recherche produit
          event.preventDefault();
          const searchInput = document.querySelector('input[placeholder*="Rechercher"]') as HTMLInputElement;
          if (searchInput) {
            searchInput.focus();
            toast({
              title: "Raccourci utilisé",
              description: "F3 : Recherche produit",
              duration: 1000
            });
          }
          break;
        case 'F4': // F4 : Scanner code-barres
          event.preventDefault();
          onAddProduct();
          toast({
            title: "Raccourci utilisé",
            description: "F4 : Scanner code-barres",
            duration: 1000
          });
          break;
        case 'Escape': // Escape : Vider panier
          event.preventDefault();
          onClearCart();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [disabled, onOpenSession, onCloseSession, onProcessPayment, onClearCart, onAddProduct, toast]);

  return null; // Ce composant n'affiche rien
};

export default POSKeyboardShortcuts;