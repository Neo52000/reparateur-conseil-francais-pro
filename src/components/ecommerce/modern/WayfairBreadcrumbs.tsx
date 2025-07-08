import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface WayfairBreadcrumbsProps {
  items: BreadcrumbItem[];
}

const WayfairBreadcrumbs: React.FC<WayfairBreadcrumbsProps> = ({ items }) => {
  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
      {items.map((item, index) => (
        <React.Fragment key={index}>
          {index > 0 && (
            <ChevronRight className="h-4 w-4 text-gray-400" />
          )}
          {index === 0 ? (
            <div className="flex items-center gap-1">
              <Home className="h-4 w-4" />
              {item.href ? (
                <a 
                  href={item.href}
                  className="hover:text-primary transition-colors"
                >
                  {item.label}
                </a>
              ) : (
                <span>{item.label}</span>
              )}
            </div>
          ) : index === items.length - 1 ? (
            <span className="font-medium text-foreground">{item.label}</span>
          ) : (
            <a 
              href={item.href}
              className="hover:text-primary transition-colors"
            >
              {item.label}
            </a>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default WayfairBreadcrumbs;