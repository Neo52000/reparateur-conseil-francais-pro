// Hook de compatibilité temporaire pour éviter les erreurs de build
// Redirige vers useStaticAuth
export { useStaticAuth as useAuth, StaticAuthProvider as AuthProvider } from './useStaticAuth';