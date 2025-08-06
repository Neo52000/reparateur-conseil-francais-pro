import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Plus, 
  Edit3, 
  Trash2, 
  Shield,
  Key,
  UserCheck,
  UserX,
  Crown,
  Search,
  Filter,
  MoreHorizontal,
  Mail,
  Phone,
  Calendar,
  Activity
} from 'lucide-react';
import AdvancedTable, { TableColumn, TableAction } from './AdvancedTable';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  last_login: string | null;
  created_at: string;
  subscription_tier: string | null;
  permissions: string[];
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  user_count: number;
  is_system: boolean;
}

interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description: string;
}

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [activeTab, setActiveTab] = useState('users');
  
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false);
  const [isCreateRoleModalOpen, setIsCreateRoleModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  
  const [userFormData, setUserFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    role: 'user',
    status: 'active',
    send_welcome: true
  });

  const [roleFormData, setRoleFormData] = useState({
    name: '',
    description: '',
    permissions: [] as string[]
  });

  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
    fetchRoles();
    fetchPermissions();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter, statusFilter]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      
      // Données de démonstration
      const mockUsers = [
        {
          id: '1',
          email: 'admin@repairhub.fr',
          first_name: 'Super',
          last_name: 'Admin',
          role: 'admin',
          status: 'active',
          last_login: new Date().toISOString(),
          created_at: new Date(2024, 0, 15).toISOString(),
          subscription_tier: null,
          permissions: ['all']
        },
        {
          id: '2',
          email: 'jean.dupont@techrepair.fr',
          first_name: 'Jean',
          last_name: 'Dupont',
          role: 'repairer',
          status: 'active',
          last_login: new Date(Date.now() - 86400000).toISOString(),
          created_at: new Date(2024, 1, 20).toISOString(),
          subscription_tier: 'pro',
          permissions: ['pos:read', 'pos:write', 'inventory:read']
        },
        {
          id: '3',
          email: 'marie.martin@client.fr',
          first_name: 'Marie',
          last_name: 'Martin',
          role: 'user',
          status: 'active',
          last_login: new Date(Date.now() - 3600000).toISOString(),
          created_at: new Date(2024, 2, 10).toISOString(),
          subscription_tier: null,
          permissions: ['profile:read', 'profile:write']
        },
        {
          id: '4',
          email: 'paul.bernard@suspend.fr',
          first_name: 'Paul',
          last_name: 'Bernard',
          role: 'repairer',
          status: 'suspended',
          last_login: new Date(Date.now() - 604800000).toISOString(),
          created_at: new Date(2024, 1, 5).toISOString(),
          subscription_tier: 'basic',
          permissions: []
        }
      ] as User[];
      
      setUsers(mockUsers);
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les utilisateurs",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const mockRoles = [
        {
          id: '1',
          name: 'admin',
          description: 'Super administrateur avec tous les droits',
          permissions: ['all'],
          user_count: 1,
          is_system: true
        },
        {
          id: '2',
          name: 'repairer',
          description: 'Réparateur avec accès POS et gestion',
          permissions: ['pos:read', 'pos:write', 'inventory:read', 'inventory:write'],
          user_count: 23,
          is_system: true
        },
        {
          id: '3',
          name: 'user',
          description: 'Client standard',
          permissions: ['profile:read', 'profile:write'],
          user_count: 156,
          is_system: true
        },
        {
          id: '4',
          name: 'moderator',
          description: 'Modérateur avec droits limités',
          permissions: ['users:read', 'content:moderate'],
          user_count: 3,
          is_system: false
        }
      ] as Role[];
      
      setRoles(mockRoles);
    } catch (error) {
      console.error('Erreur lors du chargement des rôles:', error);
    }
  };

  const fetchPermissions = async () => {
    try {
      const mockPermissions = [
        { id: '1', name: 'Lecture POS', resource: 'pos', action: 'read', description: 'Consulter les données POS' },
        { id: '2', name: 'Écriture POS', resource: 'pos', action: 'write', description: 'Modifier les données POS' },
        { id: '3', name: 'Lecture inventaire', resource: 'inventory', action: 'read', description: 'Consulter l\'inventaire' },
        { id: '4', name: 'Écriture inventaire', resource: 'inventory', action: 'write', description: 'Modifier l\'inventaire' },
        { id: '5', name: 'Gestion utilisateurs', resource: 'users', action: 'manage', description: 'Gérer les utilisateurs' },
        { id: '6', name: 'Modération contenu', resource: 'content', action: 'moderate', description: 'Modérer le contenu' },
        { id: '7', name: 'Administration système', resource: 'system', action: 'admin', description: 'Administration complète' }
      ] as Permission[];
      
      setPermissions(mockPermissions);
    } catch (error) {
      console.error('Erreur lors du chargement des permissions:', error);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.email.toLowerCase().includes(term) ||
        user.first_name?.toLowerCase().includes(term) ||
        user.last_name?.toLowerCase().includes(term)
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    setFilteredUsers(filtered);
  };

  const userColumns: TableColumn[] = [
    {
      key: 'email',
      title: 'Utilisateur',
      sortable: true,
      render: (value, row) => (
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-admin-blue-light rounded-full flex items-center justify-center">
            <span className="text-xs font-medium">
              {row.first_name?.charAt(0) || row.email.charAt(0).toUpperCase()}
            </span>
          </div>
          <div>
            <div className="font-medium">
              {row.first_name && row.last_name ? `${row.first_name} ${row.last_name}` : 'Nom non défini'}
            </div>
            <div className="text-sm text-muted-foreground">{value}</div>
          </div>
        </div>
      )
    },
    {
      key: 'role',
      title: 'Rôle',
      sortable: true,
      render: (value) => (
        <Badge variant="outline" className="capitalize">{value}</Badge>
      )
    },
    {
      key: 'status',
      title: 'Statut',
      sortable: true,
      render: (value) => (
        <Badge variant={
          value === 'active' ? 'default' : 
          value === 'inactive' ? 'secondary' : 'destructive'
        }>
          {value === 'active' ? 'Actif' :
           value === 'inactive' ? 'Inactif' : 'Suspendu'}
        </Badge>
      )
    },
    {
      key: 'subscription_tier',
      title: 'Abonnement',
      sortable: true,
      render: (value) => (
        value ? <Badge variant="secondary" className="capitalize">{value}</Badge> : 
        <span className="text-muted-foreground">-</span>
      )
    },
    {
      key: 'last_login',
      title: 'Dernière connexion',
      sortable: true,
      render: (value) => (
        value ? new Date(value).toLocaleDateString('fr-FR') : 
        <span className="text-muted-foreground">Jamais</span>
      )
    },
    {
      key: 'created_at',
      title: 'Créé le',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString('fr-FR')
    }
  ];

  const userActions: TableAction[] = [
    {
      label: 'Modifier',
      onClick: (row) => {
        setEditingUser(row as User);
        setUserFormData({
          email: row.email,
          first_name: row.first_name || '',
          last_name: row.last_name || '',
          role: row.role,
          status: row.status,
          send_welcome: false
        });
        setIsCreateUserModalOpen(true);
      }
    },
    {
      label: 'Permissions',
      onClick: (row) => {
        toast({
          title: "Gestion des permissions",
          description: `Gestion des permissions pour ${row.email}`,
        });
      }
    },
    {
      label: 'Suspendre',
      onClick: (row) => {
        toast({
          title: "Utilisateur suspendu",
          description: `${row.email} a été suspendu`,
          variant: "destructive"
        });
      },
      variant: 'destructive'
    }
  ];

  const handleSubmitUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);

      if (editingUser) {
        toast({
          title: "Utilisateur mis à jour",
          description: "L'utilisateur a été mis à jour avec succès",
        });
      } else {
        toast({
          title: "Utilisateur créé",
          description: "L'utilisateur a été créé avec succès",
        });
      }

      setIsCreateUserModalOpen(false);
      setEditingUser(null);
      resetUserForm();
      await fetchUsers();
    } catch (error: any) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de sauvegarder l'utilisateur",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetUserForm = () => {
    setUserFormData({
      email: '',
      first_name: '',
      last_name: '',
      role: 'user',
      status: 'active',
      send_welcome: true
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <UserCheck className="h-4 w-4 text-admin-green" />;
      case 'suspended': return <UserX className="h-4 w-4 text-admin-red" />;
      default: return <Users className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestion des Utilisateurs</h2>
          <p className="text-muted-foreground">Utilisateurs, rôles et permissions</p>
        </div>
        
        <div className="flex gap-2">
          <Dialog open={isCreateUserModalOpen} onOpenChange={setIsCreateUserModalOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => {
                setEditingUser(null);
                resetUserForm();
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Nouvel Utilisateur
              </Button>
            </DialogTrigger>
            
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>
                  {editingUser ? 'Modifier l\'utilisateur' : 'Créer un utilisateur'}
                </DialogTitle>
              </DialogHeader>
              
              <form onSubmit={handleSubmitUser} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={userFormData.email}
                    onChange={(e) => setUserFormData({...userFormData, email: e.target.value})}
                    placeholder="email@exemple.com"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Prénom</label>
                    <Input
                      value={userFormData.first_name}
                      onChange={(e) => setUserFormData({...userFormData, first_name: e.target.value})}
                      placeholder="Prénom"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Nom</label>
                    <Input
                      value={userFormData.last_name}
                      onChange={(e) => setUserFormData({...userFormData, last_name: e.target.value})}
                      placeholder="Nom"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Rôle</label>
                    <Select value={userFormData.role} onValueChange={(value) => setUserFormData({...userFormData, role: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map(role => (
                          <SelectItem key={role.id} value={role.name}>{role.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Statut</label>
                    <Select value={userFormData.status} onValueChange={(value) => setUserFormData({...userFormData, status: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Actif</SelectItem>
                        <SelectItem value="inactive">Inactif</SelectItem>
                        <SelectItem value="suspended">Suspendu</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                {!editingUser && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="welcome"
                      checked={userFormData.send_welcome}
                      onChange={(e) => setUserFormData({...userFormData, send_welcome: e.target.checked})}
                    />
                    <label htmlFor="welcome" className="text-sm">Envoyer email de bienvenue</label>
                  </div>
                )}
                
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsCreateUserModalOpen(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" disabled={isLoading}>
                    {editingUser ? 'Mettre à jour' : 'Créer'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-admin-blue" />
              <div>
                <p className="text-sm text-muted-foreground">Total utilisateurs</p>
                <p className="text-2xl font-bold">{users.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <UserCheck className="h-5 w-5 text-admin-green" />
              <div>
                <p className="text-sm text-muted-foreground">Utilisateurs actifs</p>
                <p className="text-2xl font-bold">{users.filter(u => u.status === 'active').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Crown className="h-5 w-5 text-admin-purple" />
              <div>
                <p className="text-sm text-muted-foreground">Admins</p>
                <p className="text-2xl font-bold">{users.filter(u => u.role === 'admin').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Activity className="h-5 w-5 text-admin-orange" />
              <div>
                <p className="text-sm text-muted-foreground">Connexions 24h</p>
                <p className="text-2xl font-bold">47</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Onglets */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="roles">Rôles</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Gestion des utilisateurs</CardTitle>
                <div className="flex gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Rechercher..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 w-64"
                    />
                  </div>
                  
                  <Select value={roleFilter} onValueChange={setRoleFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Rôle" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les rôles</SelectItem>
                      {roles.map(role => (
                        <SelectItem key={role.id} value={role.name}>{role.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue placeholder="Statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="active">Actif</SelectItem>
                      <SelectItem value="inactive">Inactif</SelectItem>
                      <SelectItem value="suspended">Suspendu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <AdvancedTable
                data={filteredUsers}
                columns={userColumns}
                actions={userActions}
                searchPlaceholder="Rechercher un utilisateur..."
                isLoading={isLoading}
                onExport={() => {
                  toast({
                    title: "Export en cours",
                    description: "Les données utilisateurs sont en cours d'export",
                  });
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {roles.map((role) => (
              <Card key={role.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-5 w-5 text-admin-blue" />
                      <CardTitle className="capitalize">{role.name}</CardTitle>
                      {role.is_system && <Badge variant="outline">Système</Badge>}
                    </div>
                    <div className="flex gap-1">
                      <Button size="sm" variant="outline">
                        <Edit3 className="h-3 w-3" />
                      </Button>
                      {!role.is_system && (
                        <Button size="sm" variant="outline">
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">{role.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Utilisateurs:</span>
                      <Badge variant="secondary">{role.user_count}</Badge>
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-2">Permissions:</p>
                      <div className="flex flex-wrap gap-1">
                        {role.permissions.slice(0, 3).map((permission, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {permission}
                          </Badge>
                        ))}
                        {role.permissions.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{role.permissions.length - 3} autres
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="permissions">
          <Card>
            <CardHeader>
              <CardTitle>Permissions système</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {permissions.map((permission) => (
                  <Card key={permission.id}>
                    <CardContent className="p-4">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Key className="h-4 w-4 text-admin-purple" />
                          <h4 className="font-medium">{permission.name}</h4>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                          {permission.description}
                        </p>
                        
                        <div className="flex justify-between items-center pt-2">
                          <Badge variant="outline" className="text-xs">
                            {permission.resource}:{permission.action}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default UserManagement;