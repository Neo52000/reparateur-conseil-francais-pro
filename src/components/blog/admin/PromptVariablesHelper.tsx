import { Alert, AlertDescription } from '@/components/ui/alert';
import { Info } from 'lucide-react';

export const PromptVariablesHelper = () => {
  return (
    <Alert>
      <Info className="h-4 w-4" />
      <AlertDescription className="space-y-3 text-sm">
        <div>
          <p className="font-semibold mb-2">Variables dynamiques disponibles :</p>
          <div className="space-y-1.5 pl-4">
            <div className="flex items-start gap-2">
              <code className="text-xs bg-secondary px-1.5 py-0.5 rounded">{'{categorie}'}</code>
              <span className="text-xs text-muted-foreground">Nom de la catégorie sélectionnée</span>
            </div>
            <div className="flex items-start gap-2">
              <code className="text-xs bg-secondary px-1.5 py-0.5 rounded">{'{date}'}</code>
              <span className="text-xs text-muted-foreground">Date de publication (ex: 30 novembre 2025)</span>
            </div>
            <div className="flex items-start gap-2">
              <code className="text-xs bg-secondary px-1.5 py-0.5 rounded">{'{saison}'}</code>
              <span className="text-xs text-muted-foreground">Saison actuelle (printemps, été, automne, hiver)</span>
            </div>
            <div className="flex items-start gap-2">
              <code className="text-xs bg-secondary px-1.5 py-0.5 rounded">{'{ton}'}</code>
              <span className="text-xs text-muted-foreground">Ton de l'article (professionnel, casual, technique)</span>
            </div>
            <div className="flex items-start gap-2">
              <code className="text-xs bg-secondary px-1.5 py-0.5 rounded">{'{longueur}'}</code>
              <span className="text-xs text-muted-foreground">Longueur cible en mots (ex: 600-800)</span>
            </div>
          </div>
        </div>
        
        <div className="pt-2 border-t">
          <p className="font-semibold text-xs mb-1">Exemple d'utilisation :</p>
          <div className="bg-secondary/50 p-2 rounded text-xs font-mono">
            Rédige un article sur {'{categorie}'} en tenant compte de la saison {'{saison}'}. 
            Le ton doit être {'{ton}'} et la longueur cible est de {'{longueur}'} mots.
          </div>
        </div>
      </AlertDescription>
    </Alert>
  );
};
