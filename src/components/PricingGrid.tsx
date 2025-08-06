
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PricingItem {
  id: string;
  device_brand: string;
  device_model: string;
  issue_type: string;
  min_price: number;
  max_price: number;
  average_price: number;
}

const PricingGrid = () => {
  const [pricing, setPricing] = useState<PricingItem[]>([]);
  const [filteredPricing, setFilteredPricing] = useState<PricingItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedIssue, setSelectedIssue] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPricing();
  }, []);

  useEffect(() => {
    filterPricing();
  }, [pricing, searchTerm, selectedBrand, selectedIssue]);

  const fetchPricing = async () => {
    try {
      const { data, error } = await supabase
        .from('pricing_grid')
        .select('*')
        .order('device_brand', { ascending: true });

      if (error) throw error;
      setPricing(data || []);
    } catch (error) {
      console.error('Error fetching pricing:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterPricing = () => {
    let filtered = pricing;

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.device_model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.device_brand.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedBrand && selectedBrand !== 'all-brands') {
      filtered = filtered.filter(item => item.device_brand === selectedBrand);
    }

    if (selectedIssue && selectedIssue !== 'all-issues') {
      filtered = filtered.filter(item => item.issue_type === selectedIssue);
    }

    setFilteredPricing(filtered);
  };

  const brands = [...new Set(pricing.map(item => item.device_brand))];
  const issues = [...new Set(pricing.map(item => item.issue_type))];

  if (loading) {
    return <div className="flex justify-center p-8">Chargement des tarifs...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Grille tarifaire</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Rechercher un modèle..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedBrand} onValueChange={setSelectedBrand}>
              <SelectTrigger>
                <SelectValue placeholder="Toutes les marques" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-brands">Toutes les marques</SelectItem>
                {brands.map((brand) => (
                  <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedIssue} onValueChange={setSelectedIssue}>
              <SelectTrigger>
                <SelectValue placeholder="Tous les problèmes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-issues">Tous les problèmes</SelectItem>
                {issues.map((issue) => (
                  <SelectItem key={issue} value={issue}>{issue}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-4 py-2 text-left">Marque</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Modèle</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Type de panne</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Prix min</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Prix max</th>
                  <th className="border border-gray-200 px-4 py-2 text-left">Prix moyen</th>
                </tr>
              </thead>
              <tbody>
                {filteredPricing.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="border border-gray-200 px-4 py-2">{item.device_brand}</td>
                    <td className="border border-gray-200 px-4 py-2">{item.device_model}</td>
                    <td className="border border-gray-200 px-4 py-2">{item.issue_type}</td>
                    <td className="border border-gray-200 px-4 py-2">{item.min_price.toFixed(2)}€</td>
                    <td className="border border-gray-200 px-4 py-2">{item.max_price.toFixed(2)}€</td>
                    <td className="border border-gray-200 px-4 py-2 font-semibold text-blue-600">
                      {item.average_price.toFixed(2)}€
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredPricing.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Aucun tarif trouvé pour ces critères
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PricingGrid;
