
import React from "react";
import SubscriptionPlans from "@/components/SubscriptionPlans";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const RepairerPlans = () => (
  <div className="min-h-screen bg-gray-50 py-12 px-4">
    <div className="max-w-4xl mx-auto">
      <Link
        to="/repairer/auth"
        className="flex items-center gap-1 mb-6 text-blue-600 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour à la connexion
      </Link>
      <SubscriptionPlans />
    </div>
  </div>
);

export default RepairerPlans;
