export type SupportedLang = 'fr' | 'en';

export function detectLanguageClient(text?: string, hint?: string): SupportedLang {
  if (hint === 'fr' || hint === 'en') return hint;
  const t = (text || '').toLowerCase();
  const frHints = ['bonjour', 'salut', 'problème', 'réparation', 'écran', 'batterie'];
  const isFr = frHints.some(w => t.includes(w)) || /[àâçéèêëîïôûùüÿœ]/.test(t);
  if (isFr) return 'fr';
  // fallback to browser
  if (typeof navigator !== 'undefined') {
    const lang = navigator.language?.toLowerCase();
    if (lang?.startsWith('fr')) return 'fr';
  }
  return 'en';
}
