import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, FileSpreadsheet, FileJson, Database } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import Papa from 'papaparse';
import jsPDF from 'jspdf';

interface GooglePlace {
  place_id: string;
  name: string;
  formatted_address: string;
  formatted_phone_number?: string;
  rating?: number;
  user_ratings_total?: number;
  website?: string;
}

interface ScrapingExportPanelProps {
  results: GooglePlace[];
  locationLabel: string;
}

const ScrapingExportPanel: React.FC<ScrapingExportPanelProps> = ({ results, locationLabel }) => {
  const { toast } = useToast();

  // Clean shop name
  const cleanName = (name: string): string => {
    return name
      .replace(/\s*-\s*.*$/, '')
      .replace(/\s*\|.*$/, '')
      .replace(/\([^)]*\)/g, '')
      .trim();
  };

  // Format phone number
  const formatPhone = (phone?: string): string => {
    if (!phone) return '';
    return phone.replace(/\D/g, '').replace(/^33/, '0').replace(/(\d{2})(?=\d)/g, '$1 ').trim();
  };

  // Extract city and postal from address
  const extractLocationFromAddress = (address: string) => {
    const parts = address.split(',');
    const cityPart = parts.length > 1 ? parts[parts.length - 2].trim() : '';
    const postalMatch = cityPart.match(/\d{5}/);
    const postal = postalMatch ? postalMatch[0] : '';
    const city = cityPart.replace(/\d{5}/, '').trim();
    return { city, postal };
  };

  // Export to CSV
  const exportToCSV = () => {
    if (results.length === 0) {
      toast({
        title: "Aucun résultat",
        description: "Pas de données à exporter",
        variant: "destructive",
      });
      return;
    }

    const csvData = results.map(place => {
      const location = extractLocationFromAddress(place.formatted_address);
      return {
        'Nom': cleanName(place.name),
        'Adresse': place.formatted_address,
        'Ville': location.city,
        'Code postal': location.postal,
        'Téléphone': formatPhone(place.formatted_phone_number),
        'Note': place.rating || '',
        'Nombre d\'avis': place.user_ratings_total || '',
        'Site web': place.website || '',
        'Source': 'Google Places',
      };
    });

    const csv = Papa.unparse(csvData);
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reparateurs-${locationLabel}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Export CSV réussi",
      description: `${results.length} réparateurs exportés`,
    });
  };

  // Export to JSON
  const exportToJSON = () => {
    if (results.length === 0) {
      toast({
        title: "Aucun résultat",
        description: "Pas de données à exporter",
        variant: "destructive",
      });
      return;
    }

    const exportData = results.map(place => {
      const location = extractLocationFromAddress(place.formatted_address);
      return {
        name: cleanName(place.name),
        address: place.formatted_address,
        city: location.city,
        postal_code: location.postal,
        phone: formatPhone(place.formatted_phone_number),
        rating: place.rating,
        reviews_count: place.user_ratings_total,
        website: place.website,
        services: ["Réparation écran", "Changement batterie", "Diagnostic"],
        source: 'google_places',
      };
    });

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `reparateurs-${locationLabel}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast({
      title: "Export JSON réussi",
      description: `${results.length} réparateurs exportés`,
    });
  };

  // Export to PDF
  const exportToPDF = () => {
    if (results.length === 0) {
      toast({
        title: "Aucun résultat",
        description: "Pas de données à exporter",
        variant: "destructive",
      });
      return;
    }

    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 15;
    let yPosition = margin;

    // Header
    pdf.setFontSize(18);
    pdf.setFont("helvetica", "bold");
    pdf.text(`Réparateurs - ${locationLabel}`, margin, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setFont("helvetica", "normal");
    pdf.text(`Exporté le ${new Date().toLocaleDateString('fr-FR')} - ${results.length} résultats`, margin, yPosition);
    yPosition += 15;

    // Results
    pdf.setFontSize(9);
    results.forEach((place, index) => {
      if (yPosition > pdf.internal.pageSize.getHeight() - 40) {
        pdf.addPage();
        yPosition = margin;
      }

      const location = extractLocationFromAddress(place.formatted_address);

      // Name with background
      pdf.setFont("helvetica", "bold");
      pdf.text(`${index + 1}. ${cleanName(place.name)}`, margin, yPosition);
      yPosition += 5;

      pdf.setFont("helvetica", "normal");
      pdf.text(`📍 ${place.formatted_address}`, margin + 5, yPosition);
      yPosition += 4;

      if (place.formatted_phone_number) {
        pdf.text(`📞 ${formatPhone(place.formatted_phone_number)}`, margin + 5, yPosition);
        yPosition += 4;
      }

      if (place.rating) {
        pdf.text(`⭐ ${place.rating}/5 (${place.user_ratings_total || 0} avis)`, margin + 5, yPosition);
        yPosition += 4;
      }

      if (place.website) {
        const shortUrl = place.website.replace(/^https?:\/\//, '').replace(/\/$/, '');
        pdf.text(`🌐 ${shortUrl.length > 40 ? shortUrl.substring(0, 40) + '...' : shortUrl}`, margin + 5, yPosition);
        yPosition += 4;
      }

      yPosition += 6;
    });

    pdf.save(`reparateurs-${locationLabel}-${new Date().toISOString().split('T')[0]}.pdf`);

    toast({
      title: "Export PDF réussi",
      description: `${results.length} réparateurs exportés`,
    });
  };

  if (results.length === 0) return null;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Download className="h-4 w-4" />
          Exporter les résultats ({results.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          <Button 
            onClick={exportToCSV} 
            variant="outline" 
            size="sm"
            className="gap-2"
          >
            <FileSpreadsheet className="h-4 w-4" />
            CSV / Excel
          </Button>
          <Button 
            onClick={exportToJSON} 
            variant="outline" 
            size="sm"
            className="gap-2"
          >
            <FileJson className="h-4 w-4" />
            JSON
          </Button>
          <Button 
            onClick={exportToPDF} 
            variant="outline" 
            size="sm"
            className="gap-2"
          >
            <Database className="h-4 w-4" />
            PDF
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ScrapingExportPanel;
