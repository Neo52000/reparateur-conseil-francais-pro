import { Link, useLocation } from 'react-router-dom';
import { Search, Sparkles } from 'lucide-react';

const SearchModeTabs = () => {
  const { pathname } = useLocation();
  const isAi = pathname.startsWith('/ai-search');

  const base =
    'inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors';
  const active = 'bg-primary text-primary-foreground shadow-elev-1';
  const inactive = 'text-muted-foreground hover:text-foreground hover:bg-muted';

  return (
    <div
      className="inline-flex items-center gap-1 p-1 rounded-lg bg-muted/60 border border-border"
      role="tablist"
      aria-label="Mode de recherche"
    >
      <Link
        to="/search"
        role="tab"
        aria-selected={!isAi}
        className={`${base} ${!isAi ? active : inactive}`}
      >
        <Search className="h-4 w-4" aria-hidden />
        Classique
      </Link>
      <Link
        to="/ai-search"
        role="tab"
        aria-selected={isAi}
        className={`${base} ${isAi ? active : inactive}`}
      >
        <Sparkles className="h-4 w-4" aria-hidden />
        Diagnostic IA
      </Link>
    </div>
  );
};

export default SearchModeTabs;
