
import React, { useState } from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Check, Eye, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface RepairerResult {
  id: string;
  name: string;
  address: string;
  city: string;
  phone?: string;
  website?: string;
  services: string[];
  price_range: string;
  source: string;
  is_verified: boolean;
  rating?: number;
  scraped_at: string;
}

type Mode = "view" | "edit";

interface RepairerModalProps {
  repairer: RepairerResult | null;
  open: boolean;
  mode: Mode;
  onClose: () => void;
  onUpdated: () => void;
}

const RepairerModal: React.FC<RepairerModalProps> = ({
  repairer,
  open,
  mode,
  onClose,
  onUpdated,
}) => {
  const { toast } = useToast();
  const [editMode, setEditMode] = useState(mode === "edit");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(() => ({
    name: repairer?.name || "",
    address: repairer?.address || "",
    city: repairer?.city || "",
    phone: repairer?.phone || "",
    website: repairer?.website || "",
    price_range: repairer?.price_range || "",
    is_verified: repairer?.is_verified ?? false,
  }));

  // Met à jour l'état local quand le réparateur change (switch entre différentes fiches)
  React.useEffect(() => {
    setEditMode(mode === "edit");
    setForm({
      name: repairer?.name || "",
      address: repairer?.address || "",
      city: repairer?.city || "",
      phone: repairer?.phone || "",
      website: repairer?.website || "",
      price_range: repairer?.price_range || "",
      is_verified: repairer?.is_verified ?? false,
    });
  }, [repairer, mode]);

  if (!repairer) return null;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({
      ...f,
      [e.target.name]: e.target.value,
    }));
  };

  const handleToggleStatus = async () => {
    setLoading(true);
    const nextStatus = !form.is_verified;
    const { error } = await supabase
      .from("repairers")
      .update({ is_verified: nextStatus })
      .eq("id", repairer.id);
    setLoading(false);

    if (!error) {
      setForm((f) => ({ ...f, is_verified: nextStatus }));
      toast({
        title: "Statut mis à jour",
        description: `Le statut est maintenant "${nextStatus ? "Vérifié" : "En attente"}"`,
      });
      onUpdated();
    } else {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le statut.",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async () => {
    setLoading(true);
    const { error } = await supabase
      .from("repairers")
      .update({
        name: form.name,
        address: form.address,
        city: form.city,
        phone: form.phone,
        website: form.website,
        price_range: form.price_range,
      })
      .eq("id", repairer.id);
    setLoading(false);

    if (!error) {
      toast({
        title: "Succès",
        description: "Fiche mise à jour.",
      });
      setEditMode(false);
      onUpdated();
    } else {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editMode ? (
              <>
                <Pencil className="inline w-4 h-4 mr-2" />
                Modifier la fiche réparateur
              </>
            ) : (
              <>
                <Eye className="inline w-4 h-4 mr-2" />
                Fiche réparateur
              </>
            )}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="flex space-x-2 items-center">
            Statut&nbsp;:
            <Badge
              className={
                form.is_verified
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-200 text-gray-700"
              }
            >
              {form.is_verified ? (
                <>
                  <Check className="inline w-3 h-3 mr-1" />
                  Vérifié
                </>
              ) : (
                <>En attente</>
              )}
            </Badge>
            <Button
              size="sm"
              variant="outline"
              onClick={handleToggleStatus}
              disabled={loading}
            >
              Changer le statut
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            <label>
              <span className="block text-xs mb-1 font-medium">Nom</span>
              <Input
                name="name"
                value={form.name}
                onChange={handleChange}
                disabled={!editMode}
              />
            </label>
            <label>
              <span className="block text-xs mb-1 font-medium">Adresse</span>
              <Input
                name="address"
                value={form.address}
                onChange={handleChange}
                disabled={!editMode}
              />
            </label>
            <label>
              <span className="block text-xs mb-1 font-medium">Ville</span>
              <Input
                name="city"
                value={form.city}
                onChange={handleChange}
                disabled={!editMode}
              />
            </label>
            <label>
              <span className="block text-xs mb-1 font-medium">Téléphone</span>
              <Input
                name="phone"
                value={form.phone}
                onChange={handleChange}
                disabled={!editMode}
              />
            </label>
            <label>
              <span className="block text-xs mb-1 font-medium">Site web</span>
              <Input
                name="website"
                value={form.website}
                onChange={handleChange}
                disabled={!editMode}
              />
            </label>
            <label>
              <span className="block text-xs mb-1 font-medium">Gamme de prix</span>
              <Input
                name="price_range"
                value={form.price_range}
                onChange={handleChange}
                disabled={!editMode}
              />
            </label>
          </div>
          <div>
            <span className="block text-xs mb-1 font-medium">Services</span>
            <div className="flex gap-1 flex-wrap">
              {repairer.services && repairer.services.length > 0
                ? repairer.services.map((s, i) => (
                    <Badge key={i} variant="outline">
                      {s}
                    </Badge>
                  ))
                : <span className="text-xs text-gray-400">Aucun</span>}
            </div>
          </div>
        </div>
        <DialogFooter>
          {editMode ? (
            <>
              <Button onClick={handleUpdate} disabled={loading}>
                Enregistrer
              </Button>
              <DialogClose asChild>
                <Button type="button" variant="secondary" disabled={loading}>
                  Annuler
                </Button>
              </DialogClose>
            </>
          ) : (
            <>
              <Button
                onClick={() => setEditMode(true)}
                variant="outline"
                type="button"
              >
                <Pencil className="w-4 h-4 mr-2" />
                Modifier
              </Button>
              <DialogClose asChild>
                <Button type="button" variant="secondary">
                  Fermer
                </Button>
              </DialogClose>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RepairerModal;
