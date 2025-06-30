
export const getBlogErrorMessage = (error: any): string => {
  let errorMessage = "Impossible de sauvegarder l'article";
  
  if (error.message?.includes('duplicate key value violates unique constraint')) {
    if (error.message.includes('slug')) {
      errorMessage = "Ce slug existe déjà. Veuillez en choisir un autre.";
    }
  } else if (error.message?.includes('invalid input syntax for type uuid')) {
    errorMessage = "Erreur de format des identifiants. Veuillez réessayer.";
  } else if (error.message?.includes('not-null constraint')) {
    errorMessage = "Certains champs obligatoires sont manquants.";
  } else if (error.message) {
    errorMessage = error.message;
  }
  
  return errorMessage;
};
