import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, Smartphone, Palette, Award } from 'lucide-react';

export interface CoqueTemplate {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  content: string;
}

export const coqueTemplates: CoqueTemplate[] = [
  {
    id: 'protection',
    name: 'Protection',
    icon: Shield,
    description: 'Template pour décrire les niveaux de protection',
    content: `
      <h2>🛡️ Protection Avancée</h2>
      <h3>Résistance aux chocs</h3>
      <ul>
        <li><strong>Protection anti-chute :</strong> Testée jusqu'à 2 mètres de hauteur</li>
        <li><strong>Absorption des impacts :</strong> Matériau TPU haute qualité</li>
        <li><strong>Bords renforcés :</strong> Protection maximale des coins</li>
      </ul>
      
      <h3>Protection de l'écran</h3>
      <ul>
        <li><strong>Bords surélevés :</strong> Protection écran et caméra</li>
        <li><strong>Compatible :</strong> Films et verres de protection</li>
      </ul>
      
      <h3>Certifications</h3>
      <p>✅ Norme militaire MIL-STD-810G<br>
      ✅ Testée en laboratoire indépendant</p>
    `
  },
  {
    id: 'materials',
    name: 'Matériaux',
    icon: Award,
    description: 'Spécifications techniques des matériaux',
    content: `
      <h2>🔬 Matériaux Premium</h2>
      
      <table>
        <thead>
          <tr>
            <th>Composant</th>
            <th>Matériau</th>
            <th>Caractéristiques</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Extérieur</td>
            <td>PC (Polycarbonate)</td>
            <td>Résistant aux rayures</td>
          </tr>
          <tr>
            <td>Intérieur</td>
            <td>TPU flexible</td>
            <td>Absorption des chocs</td>
          </tr>
          <tr>
            <td>Finition</td>
            <td>Revêtement nano</td>
            <td>Anti-traces de doigts</td>
          </tr>
        </tbody>
      </table>
      
      <h3>Avantages</h3>
      <ul>
        <li><strong>Éco-responsable :</strong> Matériaux recyclables</li>
        <li><strong>Hypoallergénique :</strong> Sans BPA ni phtalates</li>
        <li><strong>Durable :</strong> Résistant à la décoloration</li>
      </ul>
    `
  },
  {
    id: 'compatibility',
    name: 'Compatibilité',
    icon: Smartphone,
    description: 'Format pour lister la compatibilité des modèles',
    content: `
      <h2>📱 Compatibilité Parfaite</h2>
      
      <h3>Modèles compatibles</h3>
      <ul>
        <li>iPhone 15 Pro Max</li>
        <li>iPhone 15 Pro</li>
        <li>iPhone 15 Plus</li>
        <li>iPhone 15</li>
      </ul>
      
      <h3>Fonctionnalités préservées</h3>
      <ul>
        <li>✅ <strong>Charge sans fil :</strong> Compatible MagSafe et Qi</li>
        <li>✅ <strong>Boutons :</strong> Accès tactile parfait</li>
        <li>✅ <strong>Ports :</strong> Découpes précises Lightning/USB-C</li>
        <li>✅ <strong>Caméra :</strong> Protection sans obstruction</li>
        <li>✅ <strong>Haut-parleurs :</strong> Qualité audio préservée</li>
      </ul>
      
      <h3>Installation</h3>
      <p><strong>Simple et rapide :</strong> Installation en 30 secondes<br>
      <strong>Notice incluse :</strong> Guide d'installation illustré</p>
    `
  },
  {
    id: 'customization',
    name: 'Personnalisation',
    icon: Palette,
    description: 'Structure pour les options de personnalisation',
    content: `
      <h2>🎨 Personnalisation Illimitée</h2>
      
      <h3>Options de design</h3>
      <ul>
        <li><strong>Couleurs :</strong> 12 coloris disponibles</li>
        <li><strong>Finitions :</strong> Mat, brillant, métallisé</li>
        <li><strong>Textures :</strong> Lisse, grainé, carbone</li>
      </ul>
      
      <h3>Gravure personnalisée</h3>
      <ul>
        <li>📝 <strong>Texte :</strong> Nom, initiales, message</li>
        <li>🖼️ <strong>Images :</strong> Photos, logos, motifs</li>
        <li>⚡ <strong>Délai :</strong> 24-48h de traitement</li>
      </ul>
      
      <h3>Forfaits disponibles</h3>
      <blockquote>
        <p><strong>Standard :</strong> Couleur unie + gravure texte<br>
        <strong>Premium :</strong> Dégradé + gravure image<br>
        <strong>Luxe :</strong> Design complet personnalisé</p>
      </blockquote>
      
      <p><em>🎁 Idéal pour un cadeau unique et personnel !</em></p>
    `
  }
];

interface CoqueTemplatesSelectorProps {
  onTemplateSelect: (template: CoqueTemplate) => void;
}

export const CoqueTemplatesSelector: React.FC<CoqueTemplatesSelectorProps> = ({
  onTemplateSelect
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {coqueTemplates.map((template) => {
        const IconComponent = template.icon;
        return (
          <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <IconComponent className="w-4 h-4 text-primary" />
                {template.name}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-muted-foreground mb-3">
                {template.description}
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => onTemplateSelect(template)}
                className="w-full"
              >
                Utiliser ce template
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};