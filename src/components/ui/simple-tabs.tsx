import * as React from 'react';
import { cn } from '@/lib/utils';

interface SimpleTabsProps {
  defaultValue: string;
  className?: string;
  children: React.ReactNode;
}

interface SimpleTabsListProps {
  className?: string;
  children: React.ReactNode;
}

interface SimpleTabsTriggerProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

interface SimpleTabsContentProps {
  value: string;
  className?: string;
  children: React.ReactNode;
}

const SimpleTabsContext = React.createContext<{
  activeTab: string;
  setActiveTab: (value: string) => void;
}>({
  activeTab: '',
  setActiveTab: () => {},
});

export const SimpleTabs: React.FC<SimpleTabsProps> = ({ defaultValue, className, children }) => {
  const [activeTab, setActiveTab] = React.useState(defaultValue);

  return (
    <SimpleTabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={cn('space-y-4', className)}>
        {children}
      </div>
    </SimpleTabsContext.Provider>
  );
};

export const SimpleTabsList: React.FC<SimpleTabsListProps> = ({ className, children }) => {
  return (
    <div className={cn('inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground', className)}>
      {children}
    </div>
  );
};

export const SimpleTabsTrigger: React.FC<SimpleTabsTriggerProps> = ({ value, className, children }) => {
  const { activeTab, setActiveTab } = React.useContext(SimpleTabsContext);
  const isActive = activeTab === value;

  return (
    <button
      onClick={() => setActiveTab(value)}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        isActive ? 'bg-background text-foreground shadow' : '',
        className
      )}
    >
      {children}
    </button>
  );
};

export const SimpleTabsContent: React.FC<SimpleTabsContentProps> = ({ value, className, children }) => {
  const { activeTab } = React.useContext(SimpleTabsContext);
  
  if (activeTab !== value) return null;

  return (
    <div className={cn('mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2', className)}>
      {children}
    </div>
  );
};