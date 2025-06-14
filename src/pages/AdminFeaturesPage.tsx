
import React from "react";
import AdminFeatureFlags from "@/components/AdminFeatureFlags";

export default function AdminFeaturesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto pt-8 px-2">
        <h1 className="text-3xl font-bold mb-4">Configuration des fonctionnalités par plan</h1>
        <AdminFeatureFlags />
      </div>
    </div>
  );
}
