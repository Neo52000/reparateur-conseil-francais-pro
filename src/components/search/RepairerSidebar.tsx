
import React from 'react';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import RepairerInfo from './RepairerInfo';
import RepairerActions from './RepairerActions';

interface RepairerSidebarProps {
  repairer: any;
  onClose: () => void;
  onViewProfile: () => void;
  onQuoteRequest: () => void;
  onAppointmentRequest: () => void;
}

const RepairerSidebar: React.FC<RepairerSidebarProps> = ({
  repairer,
  onClose,
  onViewProfile,
  onQuoteRequest,
  onAppointmentRequest
}) => {
  if (!repairer) return null;

  return (
    <div className="w-80 bg-white shadow-xl border-r overflow-hidden">
      <div className="h-full overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <RepairerInfo repairer={repairer} />
            <Button
              onClick={onClose}
              variant="ghost"
              size="sm"
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </Button>
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
  );
};

export default RepairerSidebar;
