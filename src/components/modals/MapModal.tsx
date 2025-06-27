
import React from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import EnhancedRepairersMap from '@/components/search/EnhancedRepairersMap';

interface MapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MapModal: React.FC<MapModalProps> = ({
  isOpen,
  onClose
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0">
        <div className="relative w-full h-full">
          <Button
            onClick={onClose}
            variant="outline"
            size="icon"
            className="absolute top-4 right-4 z-50 bg-white hover:bg-gray-100 shadow-lg"
          >
            <X className="h-4 w-4" />
          </Button>
          
          <div className="w-full h-full">
            <EnhancedRepairersMap
              searchFilters={null}
              onClose={onClose}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MapModal;
