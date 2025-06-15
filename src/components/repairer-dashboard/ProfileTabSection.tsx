
import React, { useState } from "react";
import RepairerProfileModal from "../RepairerProfileModal";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

interface ProfileTabSectionProps {
  profileData: {
    name: string;
    rating: number;
    totalRepairs: number;
    joinDate: string;
  };
}

const ProfileTabSection: React.FC<ProfileTabSectionProps> = ({ profileData }) => {
  const { user } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <div className="max-w-xl mx-auto py-8">
      <h2 className="text-xl font-bold mb-4">Informations du réparateur</h2>
      <div className="bg-white rounded-lg shadow p-6 space-y-4">
        <div>
          <span className="font-medium">Nom commercial :</span> {profileData.name}
        </div>
        <div>
          <span className="font-medium">Note :</span> {profileData.rating} / 5
        </div>
        <div>
          <span className="font-medium">Réparations totales :</span> {profileData.totalRepairs}
        </div>
        <div>
          <span className="font-medium">Inscrit depuis :</span> {profileData.joinDate}
        </div>
        <Button onClick={() => setModalOpen(true)}>Modifier mon profil</Button>
      </div>
      {user && (
        <RepairerProfileModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          repairerId={user.id}
        />
      )}
    </div>
  );
};

export default ProfileTabSection;
