import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ProcessingActivity {
  id: string;
  name: string;
  purpose: string;
  dataCategories: string[];
  recipients: string[];
  retention: string;
  legalBasis: string;
}

const AdminDataProcessingRegister = () => {
  const { toast } = useToast();

  const activities: ProcessingActivity[] = [
    {
      id: '1',
      name: 'Gestion des comptes utilisateurs',
      purpose: 'Création et gestion des comptes clients et réparateurs',
      dataCategories: ['Identité', 'Coordonnées', 'Données de connexion'],
      recipients: ['Service client', 'Service technique'],
      retention: '3 ans après la dernière connexion',
      legalBasis: 'Exécution du contrat',
    },
    {
      id: '2',
      name: 'Traitement des demandes de devis',
      purpose: 'Mise en relation clients-réparateurs',
      dataCategories: ['Identité', 'Coordonnées', 'Données de l\'appareil'],
      recipients: ['Réparateurs partenaires', 'Service commercial'],
      retention: '1 an après la fin de la prestation',
      legalBasis: 'Exécution du contrat',
    },
    {
      id: '3',
      name: 'Newsletter et marketing',
      purpose: 'Envoi d\'offres commerciales et informations',
      dataCategories: ['Email', 'Préférences de communication'],
      recipients: ['Service marketing'],
      retention: '3 ans après le dernier consentement',
      legalBasis: 'Consentement',
    },
    {
      id: '4',
      name: 'Analyse de l\'utilisation',
      purpose: 'Amélioration de l\'expérience utilisateur',
      dataCategories: ['Données de navigation', 'Statistiques d\'usage'],
      recipients: ['Service technique'],
      retention: '13 mois',
      legalBasis: 'Intérêt légitime',
    },
  ];

  const handleExportRegister = () => {
    const csvContent = [
      ['Nom du traitement', 'Finalité', 'Catégories de données', 'Destinataires', 'Durée de conservation', 'Base légale'],
      ...activities.map(activity => [
        activity.name,
        activity.purpose,
        activity.dataCategories.join('; '),
        activity.recipients.join('; '),
        activity.retention,
        activity.legalBasis,
      ]),
    ]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `registre-traitements-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    toast({
      title: 'Export réussi',
      description: 'Le registre des traitements a été téléchargé',
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Registre des traitements</h2>
          <p className="text-muted-foreground">
            Conformité article 30 du RGPD
          </p>
        </div>
        <Button onClick={handleExportRegister} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exporter (CSV)
        </Button>
      </div>

      <div className="grid gap-4">
        {activities.map((activity) => (
          <Card key={activity.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                {activity.name}
              </CardTitle>
              <CardDescription>{activity.purpose}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    Catégories de données
                  </h4>
                  <ul className="list-disc list-inside text-sm">
                    {activity.dataCategories.map((category, index) => (
                      <li key={index}>{category}</li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    Destinataires
                  </h4>
                  <ul className="list-disc list-inside text-sm">
                    {activity.recipients.map((recipient, index) => (
                      <li key={index}>{recipient}</li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4 pt-2 border-t">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    Durée de conservation
                  </h4>
                  <p className="text-sm">{activity.retention}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground mb-1">
                    Base légale
                  </h4>
                  <p className="text-sm font-medium text-primary">{activity.legalBasis}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminDataProcessingRegister;
