import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useProfileTemplates } from '@/hooks/useProfileTemplates';
import ProfileBuilder from '@/components/admin/profile-builder/ProfileBuilder';
import { 
  ArrowLeft, Plus, MoreVertical, Edit, Copy, Trash2, 
  Star, Loader2, Layout, Sparkles 
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Page d'administration du builder de profils
 */
const ProfileBuilderPage: React.FC = () => {
  const { templateId } = useParams<{ templateId?: string }>();
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);

  const {
    templates,
    loading,
    setAsDefault,
    duplicateTemplate,
    deleteTemplate,
  } = useProfileTemplates();

  // Si on a un templateId, afficher le builder
  if (templateId) {
    return (
      <div className="h-full flex flex-col p-6">
        <div className="mb-4">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/admin/profile-builder')}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à la liste
          </Button>
        </div>
        <div className="flex-1 min-h-0">
          <ProfileBuilder 
            templateId={templateId} 
            onSave={() => navigate('/admin/profile-builder')}
          />
        </div>
      </div>
    );
  }

  // Sinon, afficher la liste des templates
  const handleDelete = async () => {
    if (templateToDelete) {
      await deleteTemplate(templateToDelete);
      setTemplateToDelete(null);
      setDeleteDialogOpen(false);
    }
  };

  const handleDuplicate = async (id: string) => {
    const newTemplate = await duplicateTemplate(id);
    if (newTemplate) {
      navigate(`/admin/profile-builder/${newTemplate.id}`);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Layout className="h-6 w-6" />
            Builder de Fiches Réparateurs
          </h1>
          <p className="text-muted-foreground mt-1">
            Créez et gérez les templates de fiches avec drag & drop et IA
          </p>
        </div>
        <Button onClick={() => navigate('/admin/profile-builder/new')} className="gap-2">
          <Plus className="h-4 w-4" />
          Nouveau template
        </Button>
      </div>

      {/* Liste des templates */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : templates.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Layout className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-medium">Aucun template</h3>
            <p className="text-muted-foreground mb-6">
              Créez votre premier template de fiche réparateur
            </p>
            <Button onClick={() => navigate('/admin/profile-builder/new')}>
              <Plus className="h-4 w-4 mr-2" />
              Créer un template
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {templates.map(template => (
            <Card 
              key={template.id}
              className={cn(
                'cursor-pointer transition-all hover:shadow-md',
                template.is_default && 'ring-2 ring-primary'
              )}
              onClick={() => navigate(`/admin/profile-builder/${template.id}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base flex items-center gap-2">
                      {template.name}
                      {template.is_default && (
                        <Badge variant="default" className="text-xs">
                          <Star className="h-3 w-3 mr-1" />
                          Par défaut
                        </Badge>
                      )}
                    </CardTitle>
                    <CardDescription className="mt-1">
                      {template.description || 'Aucune description'}
                    </CardDescription>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/admin/profile-builder/${template.id}`);
                      }}>
                        <Edit className="h-4 w-4 mr-2" />
                        Modifier
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        handleDuplicate(template.id);
                      }}>
                        <Copy className="h-4 w-4 mr-2" />
                        Dupliquer
                      </DropdownMenuItem>
                      {!template.is_default && (
                        <DropdownMenuItem onClick={(e) => {
                          e.stopPropagation();
                          setAsDefault(template.id);
                        }}>
                          <Star className="h-4 w-4 mr-2" />
                          Définir par défaut
                        </DropdownMenuItem>
                      )}
                      {!template.is_default && (
                        <DropdownMenuItem 
                          className="text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            setTemplateToDelete(template.id);
                            setDeleteDialogOpen(true);
                          }}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              
              <CardContent>
                {/* Preview visuel du template */}
                <div 
                  className="h-24 rounded-lg mb-3 flex items-end p-3"
                  style={{ 
                    background: `linear-gradient(135deg, hsl(${template.theme_data.primaryColor}), hsl(${template.theme_data.accentColor}))` 
                  }}
                >
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white/20" />
                    <div>
                      <div className="h-2 w-20 bg-white/40 rounded" />
                      <div className="h-1.5 w-14 bg-white/20 rounded mt-1" />
                    </div>
                  </div>
                </div>

                {/* Infos du template */}
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <span>{template.widgets.length} widgets</span>
                    {template.is_ai_generated && (
                      <Badge variant="outline" className="text-xs gap-1">
                        <Sparkles className="h-3 w-3" />
                        IA
                      </Badge>
                    )}
                  </div>
                  <span>
                    {new Date(template.updated_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog de confirmation de suppression */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce template ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Le template sera définitivement supprimé.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProfileBuilderPage;
