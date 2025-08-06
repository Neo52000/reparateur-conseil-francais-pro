
import React from "react";
import { PopoverContent } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { fr } from "date-fns/locale/fr";

interface CreateAppointmentPopoverProps {
  show: boolean;
  selectedDate: Date | undefined;
  newTime: string;
  newDuration: number;
  newService: string;
  loading: boolean;
  onTimeChange: (val: string) => void;
  onDurationChange: (val: number) => void;
  onServiceChange: (val: string) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

const CreateAppointmentPopover: React.FC<CreateAppointmentPopoverProps> = ({
  show,
  selectedDate,
  newTime,
  newDuration,
  newService,
  loading,
  onTimeChange,
  onDurationChange,
  onServiceChange,
  onClose,
  onSubmit
}) => (
  <PopoverContent className="w-[320px] p-4 pointer-events-auto" side="right">
    <form onSubmit={onSubmit} className="space-y-3">
      <h4 className="font-bold text-lg mb-2">
        Créer un rendez-vous&nbsp;
        {selectedDate && format(selectedDate, "PPP", { locale: fr })}
      </h4>
      <div>
        <label className="block text-sm font-medium mb-1">Heure</label>
        <input
          type="time"
          className="w-full border rounded p-2"
          value={newTime}
          onChange={e => onTimeChange(e.target.value)}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Durée (minutes)</label>
        <input
          type="number"
          className="w-full border rounded p-2"
          min={15}
          max={360}
          step={15}
          value={newDuration}
          onChange={e => onDurationChange(Number(e.target.value))}
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Objet / service</label>
        <input
          type="text"
          className="w-full border rounded p-2"
          value={newService}
          onChange={e => onServiceChange(e.target.value)}
          placeholder="Consultation, réparation, etc."
          required
        />
      </div>
      <div className="flex gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={onClose}>
          Annuler
        </Button>
        <Button type="submit" className="bg-blue-600 text-white" disabled={loading}>
          {loading ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>
    </form>
  </PopoverContent>
);

export default CreateAppointmentPopover;

