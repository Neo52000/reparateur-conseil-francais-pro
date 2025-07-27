
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import ComprehensiveFeaturesManager from "@/components/admin/ComprehensiveFeaturesManager";


export default function AdminFeaturesPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto pt-8 px-4">
        <div className="flex items-center mb-6">
          <Button
            variant="outline"
            onClick={() => navigate("/admin")}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à l'Admin
          </Button>
        </div>
        
        <ComprehensiveFeaturesManager />
      </div>
    </div>
  );
}
