import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Version ultra-simplifiée pour résoudre les problèmes d'initialisation React
const SimpleIndex = () => {
  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">RepairHub</h1>
        <div className="text-center">
          <p className="text-lg text-gray-600 mb-4">
            Plateforme de mise en relation avec des réparateurs de smartphones
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Trouvez un réparateur</h3>
              <p className="text-gray-600">Recherchez un professionnel près de chez vous</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Demandez un devis</h3>
              <p className="text-gray-600">Obtenez des devis gratuits et transparents</p>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-xl font-semibold mb-2">Prenez rendez-vous</h3>
              <p className="text-gray-600">Réservez un créneau en quelques clics</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SimpleIndex />} />
        <Route path="*" element={<SimpleIndex />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;