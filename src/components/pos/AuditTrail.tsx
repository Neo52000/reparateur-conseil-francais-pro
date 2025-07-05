import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { 
  Shield, 
  Clock, 
  User, 
  FileText, 
  AlertTriangle,
  CheckCircle,
  Eye,
  Download,
  Filter
} from 'lucide-react';

interface AuditLog {
  id: string;
  timestamp: string;
  user_id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details: any;
  ip_address: string;
  user_agent: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
}

interface AuditTrailProps {
  sessionId?: string;
  repairerId?: string;
}

const AuditTrail: React.FC<AuditTrailProps> = ({ sessionId, repairerId }) => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [filterSeverity, setFilterSeverity] = useState<string>('all');
  const [filterAction, setFilterAction] = useState<string>('');
  const [loading, setLoading] = useState(false);

  // Simulation des logs d'audit
  useEffect(() => {
    const mockLogs: AuditLog[] = [
      {
        id: '1',
        timestamp: new Date().toISOString(),
        user_id: 'demo-user',
        action: 'SESSION_OPEN',
        entity_type: 'session',
        entity_id: sessionId || 'demo-session',
        details: { session_number: 'S123456', initial_cash: 100.00 },
        ip_address: '192.168.1.100',
        user_agent: 'POS Terminal v1.0',
        severity: 'info'
      },
      {
        id: '2',
        timestamp: new Date(Date.now() - 300000).toISOString(),
        user_id: 'demo-user',
        action: 'TRANSACTION_CREATE',
        entity_type: 'transaction',
        entity_id: 'TXN-001',
        details: { amount: 149.90, payment_method: 'card' },
        ip_address: '192.168.1.100',
        user_agent: 'POS Terminal v1.0',
        severity: 'info'
      },
      {
        id: '3',
        timestamp: new Date(Date.now() - 600000).toISOString(),
        user_id: 'demo-user',
        action: 'INVENTORY_UPDATE',
        entity_type: 'inventory',
        entity_id: 'INV-001',
        details: { sku: 'SCR-IP13-001', stock_change: -1, new_stock: 11 },
        ip_address: '192.168.1.100',
        user_agent: 'POS Terminal v1.0',
        severity: 'info'
      },
      {
        id: '4',
        timestamp: new Date(Date.now() - 900000).toISOString(),
        user_id: 'demo-user',
        action: 'PAYMENT_FAILURE',
        entity_type: 'payment',
        entity_id: 'PAY-001',
        details: { error: 'Card declined', amount: 89.90 },
        ip_address: '192.168.1.100',
        user_agent: 'POS Terminal v1.0',
        severity: 'warning'
      }
    ];

    setAuditLogs(mockLogs);
    setFilteredLogs(mockLogs);
  }, [sessionId]);

  // Filtrage des logs
  useEffect(() => {
    let filtered = auditLogs;

    if (filterSeverity !== 'all') {
      filtered = filtered.filter(log => log.severity === filterSeverity);
    }

    if (filterAction) {
      filtered = filtered.filter(log => 
        log.action.toLowerCase().includes(filterAction.toLowerCase())
      );
    }

    setFilteredLogs(filtered);
  }, [auditLogs, filterSeverity, filterAction]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-600';
      case 'error': return 'bg-red-500';
      case 'warning': return 'bg-yellow-500';
      case 'info': return 'bg-blue-500';
      default: return 'bg-slate-500';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
      case 'error': return <AlertTriangle className="w-4 h-4" />;
      case 'warning': return <AlertTriangle className="w-4 h-4" />;
      case 'info': return <CheckCircle className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const exportAuditLogs = () => {
    const csvContent = [
      ['Timestamp', 'User', 'Action', 'Entity', 'Severity', 'Details'].join(','),
      ...filteredLogs.map(log => [
        log.timestamp,
        log.user_id,
        log.action,
        log.entity_type,
        log.severity,
        JSON.stringify(log.details)
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Journal d'Audit NF-525</CardTitle>
              <p className="text-sm text-muted-foreground">
                Traçabilité complète des opérations POS
              </p>
            </div>
          </div>
          <Button onClick={exportAuditLogs} variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </Button>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filtres */}
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
              className="border rounded px-2 py-1 text-sm"
            >
              <option value="all">Tous les niveaux</option>
              <option value="info">Info</option>
              <option value="warning">Avertissement</option>
              <option value="error">Erreur</option>
              <option value="critical">Critique</option>
            </select>
          </div>
          <Input
            placeholder="Filtrer par action..."
            value={filterAction}
            onChange={(e) => setFilterAction(e.target.value)}
            className="max-w-xs"
          />
        </div>

        {/* Table des logs */}
        <div className="border rounded-lg max-h-96 overflow-y-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Heure</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entité</TableHead>
                <TableHead>Niveau</TableHead>
                <TableHead>Détails</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono text-xs">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3 text-muted-foreground" />
                      {new Date(log.timestamp).toLocaleTimeString('fr-FR')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{log.action}</div>
                    <div className="text-xs text-muted-foreground">
                      par {log.user_id}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {log.entity_type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getSeverityColor(log.severity)}>
                      {getSeverityIcon(log.severity)}
                      <span className="ml-1 capitalize">{log.severity}</span>
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="text-xs truncate">
                      {JSON.stringify(log.details)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button size="sm" variant="ghost">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Détails du Log d'Audit</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <strong>Timestamp:</strong><br />
                              {new Date(log.timestamp).toLocaleString('fr-FR')}
                            </div>
                            <div>
                              <strong>Utilisateur:</strong><br />
                              {log.user_id}
                            </div>
                            <div>
                              <strong>Action:</strong><br />
                              {log.action}
                            </div>
                            <div>
                              <strong>Entité:</strong><br />
                              {log.entity_type} ({log.entity_id})
                            </div>
                            <div>
                              <strong>Adresse IP:</strong><br />
                              {log.ip_address}
                            </div>
                            <div>
                              <strong>User Agent:</strong><br />
                              {log.user_agent}
                            </div>
                          </div>
                          <div>
                            <strong>Détails:</strong>
                            <pre className="bg-muted p-3 rounded text-xs overflow-auto">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {filteredLogs.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Aucun log d'audit trouvé</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AuditTrail;