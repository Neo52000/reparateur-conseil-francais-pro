// Hook de compatibilité temporaire pour éviter les erreurs de build
// Redirige vers useSimpleAuth
export { useAuth, SimpleAuthProvider as AuthProvider } from './useSimpleAuth';