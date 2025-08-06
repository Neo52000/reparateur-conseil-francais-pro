import * as React from 'react';
import { cn } from '@/lib/utils';

interface SimpleDropdownMenuProps {
  children: React.ReactNode;
}

interface SimpleDropdownMenuTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
}

interface SimpleDropdownMenuContentProps {
  className?: string;
  align?: 'start' | 'center' | 'end';
  forceMount?: boolean;
  children: React.ReactNode;
}

interface SimpleDropdownMenuItemProps {
  onClick?: () => void;
  children: React.ReactNode;
}

const SimpleDropdownMenuContext = React.createContext<{
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}>({
  isOpen: false,
  setIsOpen: () => {},
});

export const SimpleDropdownMenu: React.FC<SimpleDropdownMenuProps> = ({ children }) => {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <SimpleDropdownMenuContext.Provider value={{ isOpen, setIsOpen }}>
      <div className="relative">
        {children}
      </div>
    </SimpleDropdownMenuContext.Provider>
  );
};

export const SimpleDropdownMenuTrigger: React.FC<SimpleDropdownMenuTriggerProps> = ({ 
  asChild, 
  children 
}) => {
  const { isOpen, setIsOpen } = React.useContext(SimpleDropdownMenuContext);

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      onClick: () => setIsOpen(!isOpen),
    } as any);
  }

  return (
    <button onClick={() => setIsOpen(!isOpen)}>
      {children}
    </button>
  );
};

export const SimpleDropdownMenuContent: React.FC<SimpleDropdownMenuContentProps> = ({ 
  className, 
  align = 'center',
  children 
}) => {
  const { isOpen, setIsOpen } = React.useContext(SimpleDropdownMenuContext);
  
  if (!isOpen) return null;

  const alignClass = {
    start: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
    end: 'right-0'
  }[align];

  return (
    <>
      <div 
        className="fixed inset-0 z-40" 
        onClick={() => setIsOpen(false)}
      />
      <div className={cn(
        'absolute top-full z-50 mt-1 w-56 rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
        alignClass,
        className
      )}>
        {children}
      </div>
    </>
  );
};

export const SimpleDropdownMenuItem: React.FC<SimpleDropdownMenuItemProps> = ({ 
  onClick, 
  children 
}) => {
  const { setIsOpen } = React.useContext(SimpleDropdownMenuContext);

  const handleClick = () => {
    onClick?.();
    setIsOpen(false);
  };

  return (
    <button
      onClick={handleClick}
      className="relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
    >
      {children}
    </button>
  );
};