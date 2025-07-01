
export const getBlogErrorMessage = (error: any): string => {
  console.error('Blog error:', error);
  
  if (error?.message) {
    // Erreurs spécifiques de Supabase
    if (error.message.includes('duplicate key')) {
      return 'Un article avec ce slug existe déjà';
    }
    if (error.message.includes('foreign key')) {
      return 'Catégorie invalide sélectionnée';
    }
    if (error.message.includes('permission denied')) {
      return 'Permissions insuffisantes pour cette action';
    }
    if (error.message.includes('connection')) {
      return 'Problème de connexion à la base de données';
    }
    
    return error.message;
  }
  
  if (error?.code) {
    switch (error.code) {
      case '23505':
        return 'Un article avec ce titre ou slug existe déjà';
      case '23503':
        return 'Catégorie ou auteur invalide';
      case '42501':
        return 'Permissions insuffisantes';
      default:
        return `Erreur de base de données (${error.code})`;
    }
  }
  
  return 'Une erreur inattendue s\'est produite';
};
