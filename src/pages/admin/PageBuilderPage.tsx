import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Save, Eye, Plus, Trash2, GripVertical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface PageComponent {
  id: string;
  type: 'hero' | 'text' | 'image' | 'cta' | 'stats';
  content: {
    title?: string;
    subtitle?: string;
    description?: string;
    buttonText?: string;
    buttonLink?: string;
    imageUrl?: string;
    stats?: Array<{ label: string; value: string }>;
  };
}

interface Page {
  id: string;
  title: string;
  slug: string;
  components: PageComponent[];
  isPublished: boolean;
}

const componentTemplates = {
  hero: {
    type: 'hero' as const,
    content: {
      title: 'Titre Principal',
      subtitle: 'Sous-titre accrocheur',
      description: 'Description de votre service',
      buttonText: 'En savoir plus',
      buttonLink: '#'
    }
  },
  text: {
    type: 'text' as const,
    content: {
      title: 'Section de texte',
      description: 'Votre contenu textuel ici...'
    }
  },
  cta: {
    type: 'cta' as const,
    content: {
      title: 'Appel à l\'action',
      description: 'Motivez vos visiteurs à agir',
      buttonText: 'Commencer',
      buttonLink: '#'
    }
  },
  stats: {
    type: 'stats' as const,
    content: {
      title: 'Nos chiffres',
      stats: [
        { label: 'Clients satisfaits', value: '1000+' },
        { label: 'Réparations', value: '5000+' },
        { label: 'Villes couvertes', value: '50+' }
      ]
    }
  }
};

export default function PageBuilderPage() {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState<Page>({
    id: '1',
    title: 'Nouvelle Page',
    slug: 'nouvelle-page',
    components: [],
    isPublished: false
  });
  
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);

  const addComponent = (type: keyof typeof componentTemplates) => {
    const template = componentTemplates[type];
    const newComponent: PageComponent = {
      id: `comp-${Date.now()}`,
      ...template
    };
    
    setCurrentPage(prev => ({
      ...prev,
      components: [...prev.components, newComponent]
    }));
  };

  const updateComponent = (id: string, field: string, value: any) => {
    setCurrentPage(prev => ({
      ...prev,
      components: prev.components.map(comp => 
        comp.id === id 
          ? { ...comp, content: { ...comp.content, [field]: value } }
          : comp
      )
    }));
  };

  const removeComponent = (id: string) => {
    setCurrentPage(prev => ({
      ...prev,
      components: prev.components.filter(comp => comp.id !== id)
    }));
    setSelectedComponent(null);
  };

  const ComponentEditor = ({ component }: { component: PageComponent }) => (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg capitalize">{component.type}</CardTitle>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedComponent(selectedComponent === component.id ? null : component.id)}
            >
              <GripVertical className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeComponent(component.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {selectedComponent === component.id && (
        <CardContent className="space-y-3">
          {component.content.title !== undefined && (
            <div>
              <label className="text-sm font-medium">Titre</label>
              <Input
                value={component.content.title || ''}
                onChange={(e) => updateComponent(component.id, 'title', e.target.value)}
              />
            </div>
          )}
          
          {component.content.subtitle !== undefined && (
            <div>
              <label className="text-sm font-medium">Sous-titre</label>
              <Input
                value={component.content.subtitle || ''}
                onChange={(e) => updateComponent(component.id, 'subtitle', e.target.value)}
              />
            </div>
          )}
          
          {component.content.description !== undefined && (
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={component.content.description || ''}
                onChange={(e) => updateComponent(component.id, 'description', e.target.value)}
                rows={3}
              />
            </div>
          )}
          
          {component.content.buttonText !== undefined && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm font-medium">Texte du bouton</label>
                <Input
                  value={component.content.buttonText || ''}
                  onChange={(e) => updateComponent(component.id, 'buttonText', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Lien</label>
                <Input
                  value={component.content.buttonLink || ''}
                  onChange={(e) => updateComponent(component.id, 'buttonLink', e.target.value)}
                />
              </div>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );

  const ComponentPreview = ({ component }: { component: PageComponent }) => {
    switch (component.type) {
      case 'hero':
        return (
          <div className="bg-gradient-to-r from-primary to-primary-foreground text-white p-8 rounded-lg">
            <h1 className="text-4xl font-bold mb-2">{component.content.title}</h1>
            <h2 className="text-xl mb-4">{component.content.subtitle}</h2>
            <p className="mb-6">{component.content.description}</p>
            <Button variant="secondary">{component.content.buttonText}</Button>
          </div>
        );
      case 'text':
        return (
          <div className="p-6 bg-card rounded-lg">
            <h3 className="text-2xl font-semibold mb-4">{component.content.title}</h3>
            <p className="text-muted-foreground">{component.content.description}</p>
          </div>
        );
      case 'cta':
        return (
          <div className="bg-accent p-6 rounded-lg text-center">
            <h3 className="text-2xl font-bold mb-2">{component.content.title}</h3>
            <p className="mb-4">{component.content.description}</p>
            <Button>{component.content.buttonText}</Button>
          </div>
        );
      case 'stats':
        return (
          <div className="p-6 bg-card rounded-lg">
            <h3 className="text-2xl font-semibold mb-6 text-center">{component.content.title}</h3>
            <div className="grid grid-cols-3 gap-4">
              {component.content.stats?.map((stat, idx) => (
                <div key={idx} className="text-center">
                  <div className="text-3xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return <div className="p-4 bg-muted rounded">Composant non reconnu</div>;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto pt-8 px-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => navigate("/admin")}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour à l'Admin
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Constructeur de Pages</h1>
              <p className="text-muted-foreground">Créez et modifiez vos pages facilement</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline">
              <Eye className="h-4 w-4 mr-2" />
              Aperçu
            </Button>
            <Button>
              <Save className="h-4 w-4 mr-2" />
              Sauvegarder
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - Composants */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Composants</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {Object.keys(componentTemplates).map((type) => (
                  <Button
                    key={type}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => addComponent(type as keyof typeof componentTemplates)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    {type.charAt(0).toUpperCase() + type.slice(1)}
                  </Button>
                ))}
              </CardContent>
            </Card>

            {/* Page Settings */}
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Paramètres</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Titre de la page</label>
                  <Input
                    value={currentPage.title}
                    onChange={(e) => setCurrentPage(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">URL (slug)</label>
                  <Input
                    value={currentPage.slug}
                    onChange={(e) => setCurrentPage(prev => ({ ...prev, slug: e.target.value }))}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Editor */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Éditeur</CardTitle>
              </CardHeader>
              <CardContent>
                {currentPage.components.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <p>Aucun composant ajouté.</p>
                    <p>Cliquez sur les composants à gauche pour commencer.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {currentPage.components.map((component) => (
                      <ComponentEditor key={component.id} component={component} />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Preview */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>Aperçu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {currentPage.components.map((component) => (
                    <div key={component.id} className="scale-75 origin-top-left">
                      <ComponentPreview component={component} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}