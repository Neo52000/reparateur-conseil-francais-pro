import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useTeamManagement } from '@/hooks/useTeamManagement';
import { Users, UserPlus, Mail, Trash2, Shield, UserCheck, UserX, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const TeamManagement: React.FC = () => {
  const {
    teamMembers,
    invitations,
    loading,
    inviteTeamMember,
    updateTeamMemberRole,
    toggleTeamMemberStatus,
    removeTeamMember,
    cancelInvitation
  } = useTeamManagement();

  const [isInviteDialogOpen, setIsInviteDialogOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: '',
    role: 'employee'
  });

  const roles = [
    { value: 'admin', label: 'Administrateur', description: 'Accès complet' },
    { value: 'technician', label: 'Technicien', description: 'Gestion des réparations' },
    { value: 'salesperson', label: 'Vendeur', description: 'Gestion des ventes' },
    { value: 'accountant', label: 'Comptable', description: 'Gestion financière' },
    { value: 'employee', label: 'Employé', description: 'Accès de base' }
  ];

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    
    await inviteTeamMember(inviteForm.email, inviteForm.role);
    setIsInviteDialogOpen(false);
    setInviteForm({ email: '', role: 'employee' });
  };

  const getRoleLabel = (role: string) => {
    return roles.find(r => r.value === role)?.label || role;
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'technician': return 'default';
      case 'salesperson': return 'secondary';
      case 'accountant': return 'outline';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header et bouton d'invitation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <CardTitle>Gestion d'équipe</CardTitle>
              <Badge variant="outline">{teamMembers.length} membres</Badge>
            </div>
            <Dialog open={isInviteDialogOpen} onOpenChange={setIsInviteDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Inviter un membre
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Inviter un nouveau membre</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleInvite} className="space-y-4">
                  <div>
                    <Label htmlFor="email">Adresse email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={inviteForm.email}
                      onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="email@exemple.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Rôle</Label>
                    <Select value={inviteForm.role} onValueChange={(value) => setInviteForm(prev => ({ ...prev, role: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map(role => (
                          <SelectItem key={role.value} value={role.value}>
                            <div>
                              <div className="font-medium">{role.label}</div>
                              <div className="text-sm text-gray-500">{role.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex justify-end space-x-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsInviteDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button type="submit">
                      Envoyer l'invitation
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
      </Card>

      {/* Invitations en attente */}
      {invitations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Invitations en attente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {invitations.map((invitation) => (
                <div key={invitation.id} className="flex items-center justify-between p-3 border rounded-lg bg-yellow-50 border-yellow-200">
                  <div>
                    <div className="font-medium">{invitation.email}</div>
                    <div className="text-sm text-gray-600">
                      Rôle: {getRoleLabel(invitation.role)} • 
                      Expire le {format(new Date(invitation.expires_at), 'dd/MM/yyyy', { locale: fr })}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      En attente
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => cancelInvitation(invitation.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Membres de l'équipe */}
      <Card>
        <CardHeader>
          <CardTitle>Membres de l'équipe</CardTitle>
        </CardHeader>
        <CardContent>
          {teamMembers.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Aucun membre dans l'équipe.</p>
              <p className="text-sm">Invitez vos premiers collaborateurs pour commencer.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {teamMembers.map((member) => (
                <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="font-medium text-gray-600">
                        {member.profile?.first_name?.[0]?.toUpperCase() || member.profile?.email?.[0]?.toUpperCase() || '?'}
                      </span>
                    </div>
                    <div>
                      <div className="font-medium">
                        {member.profile?.first_name && member.profile?.last_name 
                          ? `${member.profile.first_name} ${member.profile.last_name}`
                          : member.profile?.email || 'Utilisateur'}
                      </div>
                      <div className="text-sm text-gray-600">{member.profile?.email}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={getRoleBadgeVariant(member.role)}>
                          {getRoleLabel(member.role)}
                        </Badge>
                        {member.joined_at && (
                          <span className="text-xs text-gray-500">
                            Rejoint le {format(new Date(member.joined_at), 'dd/MM/yyyy', { locale: fr })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-600">
                        {member.is_active ? 'Actif' : 'Inactif'}
                      </span>
                      <Switch
                        checked={member.is_active}
                        onCheckedChange={(checked) => toggleTeamMemberStatus(member.id, checked)}
                      />
                    </div>
                    
                    <Select 
                      value={member.role} 
                      onValueChange={(value) => updateTeamMemberRole(member.id, value)}
                    >
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map(role => (
                          <SelectItem key={role.value} value={role.value}>
                            {role.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        if (confirm('Êtes-vous sûr de vouloir supprimer ce membre ?')) {
                          removeTeamMember(member.id);
                        }
                      }}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamManagement;