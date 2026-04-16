import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  BookOpen,
  Crown,
  Package,
  PenTool,
  Target,
  BarChart3,
  Map,
  Users,
} from 'lucide-react';
import { marketingPromptsData, PromptCategory, MarketingPrompt } from './marketingPromptsData';

const iconMap: Record<string, React.ReactNode> = {
  crown: <Crown className="w-5 h-5" />,
  package: <Package className="w-5 h-5" />,
  'pen-tool': <PenTool className="w-5 h-5" />,
  target: <Target className="w-5 h-5" />,
  'bar-chart': <BarChart3 className="w-5 h-5" />,
  map: <Map className="w-5 h-5" />,
  users: <Users className="w-5 h-5" />,
};

const difficultyColors: Record<string, string> = {
  Debutant: 'bg-green-100 text-green-800',
  Intermediaire: 'bg-yellow-100 text-yellow-800',
  Avance: 'bg-red-100 text-red-800',
};

const AiCmoMarketingPrompts: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedSubcategories, setExpandedSubcategories] = useState<Set<string>>(new Set());

  const toggleCategory = (id: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSubcategory = (key: string) => {
    setExpandedSubcategories((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Filter prompts by search query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return marketingPromptsData;

    const query = searchQuery.toLowerCase();
    return marketingPromptsData
      .map((category) => ({
        ...category,
        subcategories: category.subcategories
          .map((sub) => ({
            ...sub,
            prompts: sub.prompts.filter(
              (p) =>
                p.title.toLowerCase().includes(query) ||
                p.difficulty.toLowerCase().includes(query) ||
                sub.name.toLowerCase().includes(query) ||
                category.name.toLowerCase().includes(query)
            ),
          }))
          .filter((sub) => sub.prompts.length > 0),
      }))
      .filter((cat) => cat.subcategories.length > 0);
  }, [searchQuery]);

  // Count total prompts
  const totalPrompts = useMemo(() => {
    return marketingPromptsData.reduce(
      (total, cat) => total + cat.subcategories.reduce((sub, s) => sub + s.prompts.length, 0),
      0
    );
  }, []);

  const filteredCount = useMemo(() => {
    return filteredData.reduce(
      (total, cat) => total + cat.subcategories.reduce((sub, s) => sub + s.prompts.length, 0),
      0
    );
  }, [filteredData]);

  // Auto-expand all when searching
  const isSearching = searchQuery.trim().length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Bibliotheque de prompts marketing</h3>
          <p className="text-sm text-muted-foreground">
            {totalPrompts} prompts dans 7 categories — Source: AiCMO Marketing Prompt Collection
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un prompt par titre, categorie ou difficulte..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
        {isSearching && (
          <p className="text-xs text-muted-foreground mt-1">
            {filteredCount} resultat{filteredCount > 1 ? 's' : ''} trouve{filteredCount > 1 ? 's' : ''}
          </p>
        )}
      </div>

      {/* Categories Accordion */}
      {filteredData.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">Aucun prompt ne correspond a votre recherche</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredData.map((category) => {
            const isCatExpanded = isSearching || expandedCategories.has(category.id);
            const catPromptCount = category.subcategories.reduce(
              (acc, sub) => acc + sub.prompts.length,
              0
            );

            return (
              <Card key={category.id}>
                <div
                  className="cursor-pointer"
                  onClick={() => toggleCategory(category.id)}
                >
                  <CardHeader className="py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {iconMap[category.icon] || <BookOpen className="w-5 h-5" />}
                        <div>
                          <CardTitle className="text-base">{category.name}</CardTitle>
                          <p className="text-xs text-muted-foreground">
                            {catPromptCount} prompt{catPromptCount > 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                      {isCatExpanded ? (
                        <ChevronDown className="w-5 h-5 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-muted-foreground" />
                      )}
                    </div>
                  </CardHeader>
                </div>

                {isCatExpanded && (
                  <CardContent className="pt-0 space-y-2">
                    {category.subcategories.map((sub) => {
                      const subKey = `${category.id}/${sub.name}`;
                      const isSubExpanded = isSearching || expandedSubcategories.has(subKey);

                      return (
                        <div key={subKey} className="border rounded-lg">
                          <div
                            className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-muted/50"
                            onClick={() => toggleSubcategory(subKey)}
                          >
                            <div className="flex items-center gap-2">
                              {isSubExpanded ? (
                                <ChevronDown className="w-4 h-4 text-muted-foreground" />
                              ) : (
                                <ChevronRight className="w-4 h-4 text-muted-foreground" />
                              )}
                              <span className="font-medium text-sm">{sub.name}</span>
                              <Badge variant="secondary" className="text-xs">
                                {sub.prompts.length}
                              </Badge>
                            </div>
                          </div>

                          {isSubExpanded && (
                            <div className="border-t">
                              {sub.prompts.map((prompt, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center justify-between px-4 py-3 border-b last:border-b-0 hover:bg-muted/30"
                                >
                                  <div className="flex items-center gap-3 flex-1 min-w-0">
                                    <span className="text-sm truncate">{prompt.title}</span>
                                    <Badge
                                      className={`${difficultyColors[prompt.difficulty]} shrink-0 text-xs`}
                                    >
                                      {prompt.difficulty}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground shrink-0">
                                      {prompt.timeEstimate}
                                    </span>
                                  </div>
                                  <a
                                    href={prompt.githubPath}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <Button variant="ghost" size="sm" className="shrink-0">
                                      <ExternalLink className="w-3 h-3 mr-1" />
                                      Ouvrir
                                    </Button>
                                  </a>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AiCmoMarketingPrompts;
