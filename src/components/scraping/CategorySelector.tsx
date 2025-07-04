import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

interface BusinessCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  search_keywords: string[];
  scraping_prompts: any;
}

interface CategorySelectorProps {
  categories: BusinessCategory[];
  selectedCategory: BusinessCategory | null;
  onCategoryChange: (category: BusinessCategory) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  selectedCategory,
  onCategoryChange
}) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((category) => (
          <Card 
            key={category.id}
            className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
              selectedCategory?.id === category.id 
                ? 'ring-2 ring-primary bg-primary/5' 
                : 'hover:bg-muted/50'
            }`}
            onClick={() => onCategoryChange(category)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div 
                    className="text-2xl p-2 rounded-lg"
                    style={{ backgroundColor: `${category.color}15` }}
                  >
                    {category.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-sm">{category.name}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {category.description}
                    </p>
                  </div>
                </div>
                {selectedCategory?.id === category.id && (
                  <Check className="h-5 w-5 text-primary" />
                )}
              </div>
              
              <div className="mt-3 flex flex-wrap gap-1">
                {category.search_keywords?.slice(0, 3).map((keyword, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="text-xs"
                    style={{ 
                      backgroundColor: `${category.color}15`,
                      color: category.color 
                    }}
                  >
                    {keyword}
                  </Badge>
                ))}
                {category.search_keywords?.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{category.search_keywords.length - 3}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedCategory && (
        <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
          <div className="flex items-center space-x-2 mb-2">
            <span className="text-xl">{selectedCategory.icon}</span>
            <h4 className="font-semibold text-primary">
              Catégorie sélectionnée : {selectedCategory.name}
            </h4>
          </div>
          <p className="text-sm text-muted-foreground">
            {selectedCategory.description}
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {selectedCategory.search_keywords?.map((keyword, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {keyword}
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CategorySelector;