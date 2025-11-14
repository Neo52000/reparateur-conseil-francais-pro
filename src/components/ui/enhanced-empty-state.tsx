import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MotionWrapper } from '@/components/ui/motion-wrapper';

interface EnhancedEmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  illustration?: React.ReactNode;
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: LucideIcon;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  suggestions?: string[];
}

export const EnhancedEmptyState: React.FC<EnhancedEmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  illustration,
  primaryAction,
  secondaryAction,
  suggestions
}) => {
  return (
    <MotionWrapper variant="fadeInUp" className="w-full max-w-2xl mx-auto py-12">
      <Card className="border-dashed border-2 bg-muted/20">
        <CardContent className="pt-12 pb-10 px-6 text-center space-y-6">
          {/* Illustration ou icône */}
          {illustration ? (
            <div className="w-full max-w-xs mx-auto mb-6">
              {illustration}
            </div>
          ) : (
            <div className="mx-auto w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon className="h-10 w-10 text-primary" />
            </div>
          )}

          {/* Textes */}
          <div className="space-y-3">
            <h3 className="text-2xl font-semibold text-foreground">
              {title}
            </h3>
            <p className="text-muted-foreground text-lg max-w-md mx-auto">
              {description}
            </p>
          </div>

          {/* Actions principales */}
          {(primaryAction || secondaryAction) && (
            <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-4">
              {primaryAction && (
                <Button
                  onClick={primaryAction.onClick}
                  size="lg"
                  className="w-full sm:w-auto min-w-[200px] shadow-lg hover:shadow-xl transition-all"
                >
                  {primaryAction.icon && <primaryAction.icon className="mr-2 h-5 w-5" />}
                  {primaryAction.label}
                </Button>
              )}
              {secondaryAction && (
                <Button
                  onClick={secondaryAction.onClick}
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto"
                >
                  {secondaryAction.label}
                </Button>
              )}
            </div>
          )}

          {/* Suggestions */}
          {suggestions && suggestions.length > 0 && (
            <div className="pt-6 border-t border-border/50">
              <p className="text-sm text-muted-foreground mb-3 font-medium">
                Suggestions pour commencer :
              </p>
              <ul className="space-y-2 text-sm text-left max-w-md mx-auto">
                {suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-primary mr-2 mt-0.5">•</span>
                    <span className="text-muted-foreground">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </MotionWrapper>
  );
};
