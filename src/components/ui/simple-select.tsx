import * as React from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

interface SimpleSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}

interface SimpleSelectTriggerProps {
  className?: string;
  children: React.ReactNode;
}

interface SimpleSelectContentProps {
  children: React.ReactNode;
}

interface SimpleSelectItemProps {
  value: string;
  children: React.ReactNode;
}

interface SimpleSelectValueProps {
  placeholder?: string;
}

const SimpleSelectContext = React.createContext<{
  value: string;
  onValueChange: (value: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}>({
  value: '',
  onValueChange: () => {},
  isOpen: false,
  setIsOpen: () => {},
});

export const SimpleSelect: React.FC<SimpleSelectProps> = ({ value, onValueChange, children }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <SimpleSelectContext.Provider value={{ value, onValueChange, isOpen, setIsOpen }}>
      <div className="relative">
        {children}
      </div>
    </SimpleSelectContext.Provider>
  );
};

export const SimpleSelectTrigger: React.FC<SimpleSelectTriggerProps> = ({ className, children }) => {
  const { isOpen, setIsOpen } = React.useContext(SimpleSelectContext);

  return (
    <button
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      className={cn(
        'flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50',
        className
      )}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  );
};

export const SimpleSelectValue: React.FC<SimpleSelectValueProps> = ({ placeholder }) => {
  const { value } = React.useContext(SimpleSelectContext);
  
  if (!value) {
    return <span className="text-muted-foreground">{placeholder}</span>;
  }
  
  return <span>{value}</span>;
};

export const SimpleSelectContent: React.FC<SimpleSelectContentProps> = ({ children }) => {
  const { isOpen, setIsOpen } = React.useContext(SimpleSelectContext);
  
  if (!isOpen) return null;

  return (
    <>
      <div 
        className="fixed inset-0 z-40" 
        onClick={() => setIsOpen(false)}
      />
      <div className="absolute top-full left-0 z-50 mt-1 w-full rounded-md border bg-popover p-1 text-popover-foreground shadow-md">
        {children}
      </div>
    </>
  );
};

export const SimpleSelectItem: React.FC<SimpleSelectItemProps> = ({ value, children }) => {
  const { onValueChange, setIsOpen, value: selectedValue } = React.useContext(SimpleSelectContext);
  const isSelected = selectedValue === value;

  const handleClick = () => {
    onValueChange(value);
    setIsOpen(false);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={cn(
        'relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground',
        isSelected ? 'bg-accent text-accent-foreground' : ''
      )}
    >
      {children}
    </button>
  );
};