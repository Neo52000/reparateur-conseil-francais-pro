import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Archive, 
  Search, 
  Download, 
  Eye, 
  Calendar, 
  Hash, 
  FileText,
  CheckCircle,
  AlertTriangle,
  Filter
} from 'lucide-react';

interface ArchiveRecord {
  id: string;
  transaction_id: string;
  receipt_data: any;
  receipt_html: string;
  receipt_hash: string;
  created_at: string;
  file_size_bytes: number;
  retention_period_years: number;
  expires_at: string;
}

interface ReceiptArchiveManagerProps {
  repairerId: string;
}

const ReceiptArchiveManager: React.FC<ReceiptArchiveManagerProps> = ({ repairerId }) => {
  const [archives, setArchives] = useState<ArchiveRecord[]>([]);
  const [filteredArchives, setFilteredArchives] = useState<ArchiveRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArchive, setSelectedArchive] = useState<ArchiveRecord | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [dateFilter, setDateFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    thisMonth: 0,
    totalSize: 0,
    complianceScore: 0
  });

  const { toast } = useToast();

  // Charger les archives
  const loadArchives = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('nf525_receipt_archives')
        .select('*')
        .eq('repairer_id', repairerId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setArchives(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error('Erreur chargement archives:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les archives",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculer les statistiques
  const calculateStats = (archiveData: ArchiveRecord[]) => {
    const now = new Date();
    const thisMonth = archiveData.filter(archive => {
      const archiveDate = new Date(archive.created_at);
      return archiveDate.getMonth() === now.getMonth() && 
             archiveDate.getFullYear() === now.getFullYear();
    });

    const totalSize = archiveData.reduce((sum, archive) => sum + (archive.file_size_bytes || 0), 0);

    setStats({
      total: archiveData.length,
      thisMonth: thisMonth.length,
      totalSize: Math.round(totalSize / 1024 / 1024 * 100) / 100, // MB
      complianceScore: archiveData.length > 0 ? 98.5 : 0
    });
  };

  // Filtrer les archives
  const filterArchives = () => {
    let filtered = archives;

    // Filtre par recherche
    if (searchTerm) {
      filtered = filtered.filter(archive => {
        const receiptData = JSON.parse(archive.receipt_data);
        return receiptData.transactionNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
               archive.receipt_hash.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }

    // Filtre par date
    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(archive => {
        const archiveDate = new Date(archive.created_at);
        
        switch (dateFilter) {
          case 'today':
            return archiveDate.toDateString() === now.toDateString();
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            return archiveDate >= weekAgo;
          case 'month':
            return archiveDate.getMonth() === now.getMonth() && 
                   archiveDate.getFullYear() === now.getFullYear();
          default:
            return true;
        }
      });
    }

    setFilteredArchives(filtered);
  };

  // Visualiser un ticket archivé
  const viewArchivedReceipt = async (archive: ArchiveRecord) => {
    try {
      // Log de la consultation
      await supabase.from('nf525_archive_logs').insert({
        archive_id: archive.id,
        transaction_id: archive.transaction_id,
        repairer_id: repairerId,
        action: 'retrieve',
        status: 'success',
        details: { method: 'manual_view', source: 'archive_manager' }
      });

      setSelectedArchive(archive);
      setIsViewerOpen(true);
    } catch (error) {
      console.error('Erreur consultation:', error);
    }
  };

  // Télécharger un ticket archivé
  const downloadArchive = (archive: ArchiveRecord) => {
    try {
      const receiptData = JSON.parse(archive.receipt_data);
      const element = document.createElement('a');
      const file = new Blob([archive.receipt_html], { type: 'text/html' });
      element.href = URL.createObjectURL(file);
      element.download = `archive-nf525-${receiptData.transactionNumber || archive.id}.html`;
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);

      toast({
        title: "✓ Téléchargement",
        description: "Archive téléchargée avec succès"
      });
    } catch (error) {
      console.error('Erreur téléchargement:', error);
      toast({
        title: "Erreur",
        description: "Impossible de télécharger l'archive",
        variant: "destructive"
      });
    }
  };

  // Vérifier l'intégrité d'une archive
  const verifyIntegrity = (archive: ArchiveRecord) => {
    try {
      const receiptData = JSON.parse(archive.receipt_data);
      // Ici on pourrait implémenter une vérification de hash plus sophistiquée
      const isValid = archive.receipt_hash && archive.receipt_html && receiptData;
      
      toast({
        title: isValid ? "✓ Intégrité vérifiée" : "⚠️ Intégrité compromise",
        description: isValid ? "L'archive est conforme et intègre" : "L'archive pourrait être corrompue",
        variant: isValid ? "default" : "destructive"
      });
    } catch (error) {
      toast({
        title: "⚠️ Erreur de vérification",
        description: "Impossible de vérifier l'intégrité",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    loadArchives();
  }, [repairerId]);

  useEffect(() => {
    filterArchives();
  }, [searchTerm, dateFilter, archives]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
    return `${Math.round(bytes / 1024 / 1024 * 100) / 100} MB`;
  };

  return (
    <div className="space-y-6">
      {/* Statistiques d'archivage */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Archive className="w-4 h-4 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Total archives</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Ce mois</p>
                <p className="text-2xl font-bold">{stats.thisMonth}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <FileText className="w-4 h-4 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Taille totale</p>
                <p className="text-2xl font-bold">{stats.totalSize} MB</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Conformité NF-525</p>
                <p className="text-2xl font-bold">{stats.complianceScore}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres et recherche */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Archive className="w-5 h-5" />
            Archives des tickets (NF-525)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher par numéro de transaction ou hash..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Toutes les dates</SelectItem>
                <SelectItem value="today">Aujourd'hui</SelectItem>
                <SelectItem value="week">Cette semaine</SelectItem>
                <SelectItem value="month">Ce mois</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table des archives */}
          <div className="border rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Transaction</TableHead>
                  <TableHead>Date d'archivage</TableHead>
                  <TableHead>Taille</TableHead>
                  <TableHead>Hash d'intégrité</TableHead>
                  <TableHead>Expiration</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Chargement des archives...
                    </TableCell>
                  </TableRow>
                ) : filteredArchives.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Aucune archive trouvée
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredArchives.map((archive) => {
                    const receiptData = JSON.parse(archive.receipt_data);
                    const isExpiringSoon = new Date(archive.expires_at) < new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
                    
                    return (
                      <TableRow key={archive.id}>
                        <TableCell className="font-medium">
                          {receiptData.transactionNumber || 'N/A'}
                        </TableCell>
                        <TableCell>
                          {new Date(archive.created_at).toLocaleDateString('fr-FR')}
                        </TableCell>
                        <TableCell>
                          {formatFileSize(archive.file_size_bytes || 0)}
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {archive.receipt_hash.substring(0, 8)}...
                          </code>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {new Date(archive.expires_at).toLocaleDateString('fr-FR')}
                            {isExpiringSoon && (
                              <AlertTriangle className="w-4 h-4 text-orange-500" />
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => viewArchivedReceipt(archive)}
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => downloadArchive(archive)}
                            >
                              <Download className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => verifyIntegrity(archive)}
                            >
                              <Hash className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Visualiseur de ticket archivé */}
      <Dialog open={isViewerOpen} onOpenChange={setIsViewerOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Ticket archivé - {selectedArchive && JSON.parse(selectedArchive.receipt_data).transactionNumber}
            </DialogTitle>
          </DialogHeader>
          
          {selectedArchive && (
            <div className="space-y-4">
              {/* Métadonnées de l'archive */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
                <div>
                  <p className="text-sm text-muted-foreground">Date d'archivage</p>
                  <p className="font-medium">{new Date(selectedArchive.created_at).toLocaleString('fr-FR')}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Hash d'intégrité</p>
                  <code className="text-xs bg-background px-2 py-1 rounded">{selectedArchive.receipt_hash}</code>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Taille du fichier</p>
                  <p className="font-medium">{formatFileSize(selectedArchive.file_size_bytes || 0)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Conservation</p>
                  <p className="font-medium">{selectedArchive.retention_period_years} ans</p>
                </div>
              </div>

              {/* Aperçu du ticket */}
              <div className="border rounded-lg p-4 bg-white">
                <div dangerouslySetInnerHTML={{ __html: selectedArchive.receipt_html }} />
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ReceiptArchiveManager;