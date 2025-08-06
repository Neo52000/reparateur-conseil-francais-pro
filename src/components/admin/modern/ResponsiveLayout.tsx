import React from 'react';
import { cn } from '@/lib/utils';

interface ResponsiveLayoutProps {
  children: React.ReactNode;
  sidebar?: React.ReactNode;
  header?: React.ReactNode;
  className?: string;
}

const ResponsiveLayout: React.FC<ResponsiveLayoutProps> = ({
  children,
  sidebar,
  header,
  className
}) => {
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  return (
    <div className={cn("min-h-screen bg-background", className)}>
      {/* Header */}
      {header}

      {/* Main Layout */}
      <div className="flex h-[calc(100vh-2rem)]">
        {/* Mobile Sidebar Overlay */}
        {mobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 lg:hidden"
            onClick={() => setMobileMenuOpen(false)}
          />
        )}

        {/* Sidebar */}
        {sidebar && (
          <div className={cn(
            "z-50 transition-transform duration-300",
            "lg:relative lg:translate-x-0",
            mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}>
            {React.cloneElement(sidebar as React.ReactElement, {
              onCollapse: setSidebarCollapsed,
              onMobileToggle: setMobileMenuOpen
            })}
          </div>
        )}

        {/* Main Content */}
        <main className={cn(
          "flex-1 overflow-auto",
          "transition-all duration-300",
          sidebarCollapsed ? "lg:ml-0" : "lg:ml-0"
        )}>
          {/* Mobile Menu Button */}
          <div className="lg:hidden p-4 border-b border-border">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 rounded-md hover:bg-muted"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default ResponsiveLayout;