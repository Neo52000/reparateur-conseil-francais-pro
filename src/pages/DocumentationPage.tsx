import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, BookOpen, Database, Download, Eye } from 'lucide-react';
import { useDocumentationManager } from '@/hooks/useDocumentationManager';
import { Helmet } from 'react-helmet-async';
import { Badge } from '@/components/ui/badge';

const DocumentationPage: React.FC = () => {
  const { generating, generatePDF, previewDocument } = useDocumentationManager();

  const documents = [
    {
      id: 'prd' as const,
      title: 'Product Requirements Document (PRD)',
      description: 'Document complet des exigences produit, vision et roadmap de TopRéparateurs.fr',
      icon: FileText,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      id: 'user-guide' as const,
      title: 'Guide Utilisateur',
      description: 'Guide détaillé pour les clients, réparateurs et administrateurs',
      icon: BookOpen,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      id: 'technical' as const,
      title: 'Documentation Technique',
      description: 'Architecture, APIs, base de données et guides de développement',
      icon: Database,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  const handleDownload = async (docType: 'prd' | 'user-guide' | 'technical') => {
    await generatePDF(docType);
  };

  const handlePreview = async (docType: 'prd' | 'user-guide' | 'technical') => {
    await previewDocument(docType);
  };

  return (
    <>
      <Helmet>
        <title>Documentation - TopRéparateurs.fr</title>
        <meta name="description" content="Accédez à toute la documentation de TopRéparateurs.fr : PRD, guide utilisateur et documentation technique." />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
        <div className="container mx-auto px-4 py-16">
          {/* Header */}
          <div className="text-center mb-12">
            <Badge variant="secondary" className="mb-4">Documentation</Badge>
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              Documentation TopRéparateurs.fr
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Accédez à toute la documentation du projet : spécifications produit, guides utilisateurs et documentation technique
            </p>
          </div>

          {/* Documents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {documents.map((doc) => {
              const Icon = doc.icon;
              return (
                <Card key={doc.id} className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50">
                  <CardHeader>
                    <div className={`w-16 h-16 rounded-2xl ${doc.bgColor} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                      <Icon className={`w-8 h-8 ${doc.color}`} />
                    </div>
                    <CardTitle className="text-xl">{doc.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {doc.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <Button
                      onClick={() => handleDownload(doc.id)}
                      disabled={generating}
                      className="w-full"
                      variant="default"
                    >
                      <Download className="w-4 h-4 mr-2" />
                      {generating ? 'Génération...' : 'Télécharger PDF'}
                    </Button>
                    <Button
                      onClick={() => handlePreview(doc.id)}
                      disabled={generating}
                      className="w-full"
                      variant="outline"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Prévisualiser
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Info Section */}
          <Card className="mt-12 max-w-4xl mx-auto bg-muted/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                À propos de cette documentation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">📋 Product Requirements Document (PRD)</h3>
                <p className="text-sm text-muted-foreground">
                  Contient la vision produit, les objectifs business, les fonctionnalités principales, 
                  l'architecture technique et la roadmap complète du projet.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">📖 Guide Utilisateur</h3>
                <p className="text-sm text-muted-foreground">
                  Documentation complète pour tous les utilisateurs : particuliers, réparateurs et administrateurs.
                  Inclut des tutoriels pas-à-pas et les bonnes pratiques.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-2">⚙️ Documentation Technique</h3>
                <p className="text-sm text-muted-foreground">
                  Architecture système, schéma de base de données, documentation des APIs, 
                  guides de développement et de déploiement.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Version Info */}
          <div className="text-center mt-8 text-sm text-muted-foreground">
            <p>Dernière mise à jour : 7 janvier 2025 • Version 3.0</p>
          </div>
        </div>
      </div>
    </>
  );
};

export default DocumentationPage;
