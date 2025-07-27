
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import AdminFeatureFlags from "@/components/AdminFeatureFlags";
import OptionalModulesManager from "@/components/OptionalModulesManager";


export default function AdminFeaturesPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto pt-8 px-2">
        <div className="flex items-center mb-6">
          <Button
            variant="outline"
            onClick={() => navigate("/admin")}
            className="mr-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour à l'Admin
          </Button>
          <h1 className="text-3xl font-bold">Configuration des fonctionnalités par plan</h1>
        </div>
        
        <div className="space-y-8">
          <OptionalModulesManager />
          <AdminFeatureFlags />
        </div>
      </div>
    </div>
  );
}
