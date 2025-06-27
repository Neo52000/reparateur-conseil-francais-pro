
import React from 'react';
import { Button } from '@/components/ui/button';
import { X, Menu } from 'lucide-react';
import RepairerInfo from './RepairerInfo';
import RepairerActions from './RepairerActions';

interface RepairerSidebarProps {
  repairer: any;
  sidebarOpen: boolean;
  onToggleSidebar: () => void;
  onClose: () => void;
  onViewProfile: () => void;
  onQuoteRequest: () => void;
  onAppointmentRequest: () => void;
}

const RepairerSidebar: React.FC<RepairerSidebarProps> = ({
  repairer,
  sidebarOpen,
  onToggleSidebar,
  onClose,
  onViewProfile,
  onQuoteRequest,
  onAppointmentRequest
}) => {
  if (!repairer) return null;

  return (
    <>
      {/* Sidebar */}
      <div className={`
        ${sidebarOpen ? 'w-80 sm:w-96' : 'w-0'} 
        bg-white shadow-xl border-r overflow-hidden transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'block' : 'hidden sm:block'}
      `}>
        <div className="h-full overflow-y-auto">
          <div className="p-4 sm:p-6">
            <div className="flex justify-between items-start mb-4">
              <RepairerInfo repairer={repairer} />
              <div className="flex gap-2">
                <Button
                  onClick={onToggleSidebar}
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-700 sm:hidden"
                >
                  <X className="h-4 w-4" />
                </Button>
                <Button
                  onClick={onClose}
                  variant="ghost"
                  size="sm"
                  className="text-gray-500 hover:text-gray-700 hidden sm:block"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <RepairerActions
              repairer={repairer}
              onViewProfile={onViewProfile}
              onQuoteRequest={onQuoteRequest}
              onAppointmentRequest={onAppointmentRequest}
            />
          </div>
        </div>
      </div>

      {/* Mobile sidebar toggle */}
      {!sidebarOpen && (
        <Button
          onClick={onToggleSidebar}
          variant="outline"
          size="sm"
          className="absolute top-4 left-4 z-20 bg-white shadow-lg sm:hidden"
        >
          <Menu className="h-4 w-4" />
        </Button>
      )}
    </>
  );
};

export default RepairerSidebar;
