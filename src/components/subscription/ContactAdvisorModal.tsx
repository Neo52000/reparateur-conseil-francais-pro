
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import ContactForm from './ContactForm';
import ContactOptions from './ContactOptions';
import QualityCommitment from './QualityCommitment';

interface ContactAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ContactAdvisorModal: React.FC<ContactAdvisorModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">Parler à un conseiller</DialogTitle>
          <DialogDescription>
            Nos experts vous accompagnent gratuitement pour choisir le plan idéal 
            et maximiser votre visibilité sur la plateforme.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <ContactOptions />
          <ContactForm onClose={onClose} />
        </div>

        <QualityCommitment />
      </DialogContent>
    </Dialog>
  );
};

export default ContactAdvisorModal;
