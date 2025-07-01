
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, AlertTriangle, Lightbulb, Settings, List, MessageSquare } from 'lucide-react';

interface TemplateSelectorProps {
  onTemplateSelect: (template: string) => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ onTemplateSelect }) => {
  const templates = [
    {
      name: 'Guide étape par étape',
      icon: List,
      category: 'Structure',
      content: `## Guide de réparation

### Étape 1: Préparation
- [ ] Outil nécessaire 1
- [ ] Outil nécessaire 2
- [ ] Matériel requis

### Étape 2: Démontage
1. Première action à effectuer
2. Deuxième action importante
3. Points de vigilance

### Étape 3: Diagnostic
> 🔍 **Inspection**: Vérifiez attentivement l'état des composants

### Étape 4: Réparation
- Procédure détaillée
- Techniques recommandées

### Étape 5: Remontage
- Procédure inverse du démontage
- Vérifications finales

> ✅ **Conseil**: Testez le fonctionnement avant de refermer complètement`
    },
    {
      name: 'Avertissement sécurité',
      icon: AlertTriangle,
      category: 'Sécurité',
      content: `> ⚠️ **ATTENTION - SÉCURITÉ**
> 
> **Risques identifiés :**
> - Risque électrique
> - Composants fragiles
> - Outils spécialisés requis
> 
> **Précautions obligatoires :**
> - Débrancher l'appareil
> - Porter des équipements de protection
> - Travailler dans un environnement propre
> 
> Ne pas ignorer ces consignes de sécurité.`
    },
    {
      name: 'Astuce technique',
      icon: Lightbulb,
      category: 'Conseil',
      content: `> 💡 **Conseil d'expert**
> 
> **Astuce :** Technique pour faciliter la réparation
> 
> **Pourquoi ça marche :** Explication technique
> 
> **Alternative :** Méthode de secours si la première ne fonctionne pas`
    },
    {
      name: 'Diagnostic problème',
      icon: Settings,
      category: 'Diagnostic',
      content: `## Diagnostic du problème

### Symptômes observés
- [ ] Symptôme 1
- [ ] Symptôme 2
- [ ] Symptôme 3

### Tests à effectuer
1. **Test visuel :**
   - Vérifier l'état général
   - Rechercher des signes d'usure

2. **Test fonctionnel :**
   - Tester les fonctions de base
   - Identifier les dysfonctionnements

### Causes probables
| Symptôme | Cause probable | Solution |
|----------|---------------|----------|
| Problème A | Cause A | Solution A |
| Problème B | Cause B | Solution B |`
    },
    {
      name: 'FAQ Réparation',
      icon: MessageSquare,
      category: 'Support',
      content: `## Questions fréquentes

### ❓ Question 1
**Réponse :** Explication détaillée avec les étapes à suivre.

### ❓ Question 2
**Réponse :** Solution pratique avec conseils.

### ❓ Question 3
**Réponse :** Troubleshooting et alternatives.

> 📞 **Besoin d'aide ?** N'hésitez pas à contacter un professionnel si vous rencontrez des difficultés.`
    }
  ];

  const categories = Array.from(new Set(templates.map(t => t.category)));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Templates de contenu
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {categories.map(category => (
            <div key={category}>
              <Badge variant="outline" className="mb-2">{category}</Badge>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {templates
                  .filter(template => template.category === category)
                  .map((template, index) => {
                    const IconComponent = template.icon;
                    return (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => onTemplateSelect(template.content)}
                        className="justify-start h-auto p-3 text-left"
                      >
                        <div className="flex items-center gap-2 w-full">
                          <IconComponent className="h-4 w-4 flex-shrink-0" />
                          <span className="text-sm font-medium">{template.name}</span>
                        </div>
                      </Button>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default TemplateSelector;
