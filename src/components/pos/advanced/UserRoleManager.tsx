import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Users, 
  Shield, 
  UserPlus, 
  Edit, 
  Trash2, 
  Clock, 
  Eye,
  Settings,
  CheckCircle,
  XCircle,
  AlertTriangle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';

interface UserRole {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  color: string;
  is_default: boolean;
  created_at: string;
}

interface StaffMember {
  id: string;
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  role_id: string;
  role_name: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  work_schedule?: {
    monday: { start: string; end: string; active: boolean };
    tuesday: { start: string; end: string; active: boolean };
    wednesday: { start: string; end: string; active: boolean };
    thursday: { start: string; end: string; active: boolean };
    friday: { start: string; end: string; active: boolean };
    saturday: { start: string; end: string; active: boolean };
    sunday: { start: string; end: string; active: boolean };
  };
}

interface ActivityLog {
  id: string;
  user_id: string;
  user_name: string;
  action: string;
  resource: string;
  timestamp: string;
  ip_address?: string;
  user_agent?: string;
  success: boolean;
}

const UserRoleManager: React.FC = () => {
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [selectedTab, setSelectedTab] = useState<'users' | 'roles' | 'logs'>('users');
  const [isRoleDialogOpen, setIsRoleDialogOpen] = useState(false);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [newRole, setNewRole] = useState({
    name: '',
    description: '',
    permissions: [] as string[],
    color: '#3b82f6'
  });
  const [newUser, setNewUser] = useState({
    email: '',
    first_name: '',
    last_name: '',
    role_id: '',
    send_invitation: true
  });

  const { user } = useAuth();
  const { toast } = useToast();

  const availablePermissions = [
    { id: 'pos_sales', label: 'Ventes POS', category: 'POS' },
    { id: 'pos_inventory', label: 'Gestion Stock', category: 'POS' },
    { id: 'pos_reports', label: 'Rapports POS', category: 'POS' },
    { id: 'pos_settings', label: 'Paramètres POS', category: 'POS' },
    { id: 'customer_read', label: 'Voir Clients', category: 'CRM' },
    { id: 'customer_write', label: 'Modifier Clients', category: 'CRM' },
    { id: 'customer_delete', label: 'Supprimer Clients', category: 'CRM' },
    { id: 'financial_read', label: 'Voir Finances', category: 'Finance' },
    { id: 'financial_write', label: 'Modifier Finances', category: 'Finance' },
    { id: 'admin_users', label: 'Gestion Utilisateurs', category: 'Admin' },
    { id: 'admin_settings', label: 'Paramètres Système', category: 'Admin' }
  ];

  const loadRoles = async () => {
    // Mode démo avec données simulées
    if (user?.email === 'demo@demo.fr') {
      setRoles([
        {
          id: '1',
          name: 'Administrateur',
          description: 'Accès complet à toutes les fonctionnalités',
          permissions: availablePermissions.map(p => p.id),
          color: '#dc2626',
          is_default: false,
          created_at: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Technicien',
          description: 'Accès aux réparations et stock',
          permissions: ['pos_sales', 'pos_inventory', 'customer_read', 'customer_write'],
          color: '#2563eb',
          is_default: false,
          created_at: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Vendeur',
          description: 'Accès aux ventes et clients',
          permissions: ['pos_sales', 'customer_read', 'customer_write'],
          color: '#059669',
          is_default: true,
          created_at: new Date().toISOString()
        }
      ]);

      setStaffMembers([
        {
          id: '1',
          user_id: 'user-1',
          email: 'marie.technicien@example.com',
          first_name: 'Marie',
          last_name: 'Dubois',
          role_id: '2',
          role_name: 'Technicien',
          is_active: true,
          last_login: new Date(Date.now() - 3600000).toISOString(),
          created_at: new Date(Date.now() - 86400000 * 30).toISOString(),
          work_schedule: {
            monday: { start: '09:00', end: '18:00', active: true },
            tuesday: { start: '09:00', end: '18:00', active: true },
            wednesday: { start: '09:00', end: '18:00', active: true },
            thursday: { start: '09:00', end: '18:00', active: true },
            friday: { start: '09:00', end: '17:00', active: true },
            saturday: { start: '10:00', end: '16:00', active: true },
            sunday: { start: '10:00', end: '16:00', active: false }
          }
        },
        {
          id: '2',
          user_id: 'user-2',
          email: 'pierre.vendeur@example.com',
          first_name: 'Pierre',
          last_name: 'Martin',
          role_id: '3',
          role_name: 'Vendeur',
          is_active: true,
          last_login: new Date(Date.now() - 1800000).toISOString(),
          created_at: new Date(Date.now() - 86400000 * 15).toISOString()
        }
      ]);

      setActivityLogs([
        {
          id: '1',
          user_id: 'user-1',
          user_name: 'Marie Dubois',
          action: 'LOGIN',
          resource: 'POS System',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          success: true
        },
        {
          id: '2',
          user_id: 'user-2',
          user_name: 'Pierre Martin',
          action: 'SALE_CREATED',
          resource: 'Transaction TXN-20250105-001',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          success: true
        },
        {
          id: '3',
          user_id: 'user-1',
          user_name: 'Marie Dubois',
          action: 'INVENTORY_UPDATED',
          resource: 'Écran iPhone 13',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          success: true
        },
        {
          id: '4',
          user_id: 'user-2',
          user_name: 'Pierre Martin',
          action: 'LOGIN_FAILED',
          resource: 'POS System',
          timestamp: new Date(Date.now() - 86400000).toISOString(),
          success: false
        }
      ]);
    }
  };

  const createRole = async () => {
    if (!newRole.name || !newRole.description) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    const role: UserRole = {
      id: Date.now().toString(),
      ...newRole,
      is_default: false,
      created_at: new Date().toISOString()
    };

    setRoles(prev => [...prev, role]);
    setNewRole({ name: '', description: '', permissions: [], color: '#3b82f6' });
    setIsRoleDialogOpen(false);

    toast({
      title: "Rôle créé",
      description: `Le rôle "${role.name}" a été créé avec succès`,
      duration: 3000
    });
  };

  const inviteUser = async () => {
    if (!newUser.email || !newUser.first_name || !newUser.last_name || !newUser.role_id) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    const selectedRole = roles.find(r => r.id === newUser.role_id);
    if (!selectedRole) return;

    const staff: StaffMember = {
      id: Date.now().toString(),
      user_id: `user-${Date.now()}`,
      email: newUser.email,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      role_id: newUser.role_id,
      role_name: selectedRole.name,
      is_active: true,
      created_at: new Date().toISOString()
    };

    setStaffMembers(prev => [...prev, staff]);
    setNewUser({ email: '', first_name: '', last_name: '', role_id: '', send_invitation: true });
    setIsUserDialogOpen(false);

    toast({
      title: "Invitation envoyée",
      description: `Invitation envoyée à ${staff.first_name} ${staff.last_name}`,
      duration: 3000
    });
  };

  const getRoleColor = (roleId: string) => {
    const role = roles.find(r => r.id === roleId);
    return role?.color || '#6b7280';
  };

  const getStatusIcon = (isActive: boolean, lastLogin?: string) => {
    if (!isActive) return <XCircle className="w-4 h-4 text-red-500" />;
    
    if (lastLogin) {
      const lastLoginDate = new Date(lastLogin);
      const hoursSinceLogin = (Date.now() - lastLoginDate.getTime()) / (1000 * 60 * 60);
      
      if (hoursSinceLogin < 24) return <CheckCircle className="w-4 h-4 text-green-500" />;
      if (hoursSinceLogin < 168) return <Clock className="w-4 h-4 text-yellow-500" />;
    }
    
    return <AlertTriangle className="w-4 h-4 text-orange-500" />;
  };

  const togglePermission = (permissionId: string) => {
    setNewRole(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permissionId)
        ? prev.permissions.filter(p => p !== permissionId)
        : [...prev.permissions, permissionId]
    }));
  };

  useEffect(() => {
    loadRoles();
  }, [user?.id]);

  const groupedPermissions = availablePermissions.reduce((acc, permission) => {
    if (!acc[permission.category]) {
      acc[permission.category] = [];
    }
    acc[permission.category].push(permission);
    return acc;
  }, {} as Record<string, typeof availablePermissions>);

  return (
    <div className="space-y-6">
      {/* Header avec statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-muted-foreground">Équipe Active</p>
                <p className="text-2xl font-bold">{staffMembers.filter(s => s.is_active).length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-sm text-muted-foreground">Rôles Définis</p>
                <p className="text-2xl font-bold">{roles.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
              <div>
                <p className="text-sm text-muted-foreground">Connectés</p>
                <p className="text-2xl font-bold">
                  {staffMembers.filter(s => s.last_login && 
                    (Date.now() - new Date(s.last_login).getTime()) < 24 * 60 * 60 * 1000
                  ).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Eye className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-muted-foreground">Actions/24h</p>
                <p className="text-2xl font-bold">
                  {activityLogs.filter(log => 
                    (Date.now() - new Date(log.timestamp).getTime()) < 24 * 60 * 60 * 1000
                  ).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation par onglets */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Gestion Utilisateurs & Permissions
            </CardTitle>
            <div className="flex gap-2">
              {selectedTab === 'users' && (
                <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <UserPlus className="w-4 h-4 mr-2" />
                      Inviter Utilisateur
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Inviter un Nouvel Utilisateur</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="first_name">Prénom</Label>
                          <Input
                            id="first_name"
                            value={newUser.first_name}
                            onChange={(e) => setNewUser(prev => ({ ...prev, first_name: e.target.value }))}
                            placeholder="Marie"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="last_name">Nom</Label>
                          <Input
                            id="last_name"
                            value={newUser.last_name}
                            onChange={(e) => setNewUser(prev => ({ ...prev, last_name: e.target.value }))}
                            placeholder="Dubois"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={newUser.email}
                          onChange={(e) => setNewUser(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="marie.dubois@example.com"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role">Rôle</Label>
                        <Select value={newUser.role_id} onValueChange={(value) => setNewUser(prev => ({ ...prev, role_id: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un rôle..." />
                          </SelectTrigger>
                          <SelectContent>
                            {roles.map((role) => (
                              <SelectItem key={role.id} value={role.id}>
                                {role.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="send_invitation"
                          checked={newUser.send_invitation}
                          onCheckedChange={(checked) => setNewUser(prev => ({ ...prev, send_invitation: !!checked }))}
                        />
                        <Label htmlFor="send_invitation">Envoyer un email d'invitation</Label>
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsUserDialogOpen(false)}>
                        Annuler
                      </Button>
                      <Button onClick={inviteUser}>
                        Envoyer l'Invitation
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
              
              {selectedTab === 'roles' && (
                <Dialog open={isRoleDialogOpen} onOpenChange={setIsRoleDialogOpen}>
                  <DialogTrigger asChild>
                    <Button size="sm">
                      <Shield className="w-4 h-4 mr-2" />
                      Nouveau Rôle
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Créer un Nouveau Rôle</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="role_name">Nom du rôle</Label>
                          <Input
                            id="role_name"
                            value={newRole.name}
                            onChange={(e) => setNewRole(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Ex: Manager"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="role_color">Couleur</Label>
                          <Input
                            id="role_color"
                            type="color"
                            value={newRole.color}
                            onChange={(e) => setNewRole(prev => ({ ...prev, color: e.target.value }))}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="role_description">Description</Label>
                        <Input
                          id="role_description"
                          value={newRole.description}
                          onChange={(e) => setNewRole(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Description du rôle et responsabilités..."
                        />
                      </div>
                      
                      <div className="space-y-4">
                        <Label>Permissions</Label>
                        {Object.entries(groupedPermissions).map(([category, permissions]) => (
                          <div key={category} className="space-y-2">
                            <h4 className="font-medium text-sm text-muted-foreground">{category}</h4>
                            <div className="grid grid-cols-2 gap-2">
                              {permissions.map((permission) => (
                                <div key={permission.id} className="flex items-center space-x-2">
                                  <Checkbox
                                    id={permission.id}
                                    checked={newRole.permissions.includes(permission.id)}
                                    onCheckedChange={() => togglePermission(permission.id)}
                                  />
                                  <Label htmlFor={permission.id} className="text-sm">
                                    {permission.label}
                                  </Label>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => setIsRoleDialogOpen(false)}>
                        Annuler
                      </Button>
                      <Button onClick={createRole}>
                        Créer le Rôle
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
          
          <div className="flex gap-4 border-b">
            <button
              className={`pb-2 px-1 font-medium text-sm border-b-2 transition-colors ${
                selectedTab === 'users' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setSelectedTab('users')}
            >
              Utilisateurs ({staffMembers.length})
            </button>
            <button
              className={`pb-2 px-1 font-medium text-sm border-b-2 transition-colors ${
                selectedTab === 'roles' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setSelectedTab('roles')}
            >
              Rôles ({roles.length})
            </button>
            <button
              className={`pb-2 px-1 font-medium text-sm border-b-2 transition-colors ${
                selectedTab === 'logs' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setSelectedTab('logs')}
            >
              Journal d'Activité ({activityLogs.length})
            </button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Onglet Utilisateurs */}
          {selectedTab === 'users' && (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Statut</TableHead>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Rôle</TableHead>
                    <TableHead>Dernière Connexion</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {staffMembers.map((staff) => (
                    <TableRow key={staff.id}>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(staff.is_active, staff.last_login)}
                          <span className="text-xs">
                            {staff.is_active ? 'Actif' : 'Inactif'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{staff.first_name} {staff.last_name}</div>
                          <div className="text-sm text-muted-foreground">{staff.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          style={{ backgroundColor: getRoleColor(staff.role_id), color: 'white' }}
                        >
                          {staff.role_name}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {staff.last_login ? (
                          <div className="text-sm">
                            {new Date(staff.last_login).toLocaleDateString('fr-FR')}
                            <div className="text-xs text-muted-foreground">
                              {new Date(staff.last_login).toLocaleTimeString('fr-FR', { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Jamais connecté</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Onglet Rôles */}
          {selectedTab === 'roles' && (
            <div className="space-y-4">
              {roles.map((role) => (
                <Card key={role.id} className="border-l-4" style={{ borderLeftColor: role.color }}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{role.name}</h3>
                          {role.is_default && (
                            <Badge variant="outline" className="text-xs">Par défaut</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">{role.description}</p>
                        <div className="flex flex-wrap gap-1">
                          {role.permissions.map((permissionId) => {
                            const permission = availablePermissions.find(p => p.id === permissionId);
                            return permission ? (
                              <Badge key={permissionId} variant="secondary" className="text-xs">
                                {permission.label}
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="w-4 h-4" />
                        </Button>
                        {!role.is_default && (
                          <Button variant="ghost" size="sm" className="text-red-600">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Onglet Journal d'Activité */}
          {selectedTab === 'logs' && (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Statut</TableHead>
                    <TableHead>Utilisateur</TableHead>
                    <TableHead>Action</TableHead>
                    <TableHead>Ressource</TableHead>
                    <TableHead>Date & Heure</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {activityLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell>
                        {log.success ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <XCircle className="w-4 h-4 text-red-500" />
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{log.user_name}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={log.success ? "default" : "destructive"}>
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm">{log.resource}</span>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {new Date(log.timestamp).toLocaleDateString('fr-FR')}
                          <div className="text-xs text-muted-foreground">
                            {new Date(log.timestamp).toLocaleTimeString('fr-FR')}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UserRoleManager;