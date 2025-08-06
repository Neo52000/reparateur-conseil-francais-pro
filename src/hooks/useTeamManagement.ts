import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface TeamMember {
  id: string;
  user_id: string;
  role: string;
  permissions: any;
  is_active: boolean;
  invited_by?: string;
  invited_at: string;
  joined_at?: string;
  created_at: string;
  updated_at: string;
  // Relations
  profile?: {
    first_name?: string;
    last_name?: string;
    email: string;
  };
}

export interface TeamInvitation {
  id: string;
  email: string;
  role: string;
  permissions: any;
  token: string;
  expires_at: string;
  status: string;
  created_at: string;
}

export const useTeamManagement = () => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [invitations, setInvitations] = useState<TeamInvitation[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchTeamData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Récupérer les membres de l'équipe
      const { data: membersData, error: membersError } = await supabase
        .from('repairer_team_members')
        .select(`
          *,
          profiles!repairer_team_members_user_id_fkey(first_name, last_name, email)
        `)
        .eq('repairer_id', user.id);

      if (membersError) throw membersError;

      // Récupérer les invitations en attente
      const { data: invitationsData, error: invitationsError } = await supabase
        .from('team_invitations')
        .select('*')
        .eq('repairer_id', user.id)
        .eq('status', 'pending');

      if (invitationsError) throw invitationsError;

      // Simplifier pour éviter les erreurs de relation
      setTeamMembers(membersData || []);
      setInvitations(invitationsData || []);
    } catch (error) {
      console.error('Error fetching team data:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les données de l'équipe",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const inviteTeamMember = async (email: string, role: string, permissions: any = {}) => {
    if (!user?.id) return;

    try {
      // Générer un token unique
      const token = crypto.randomUUID();
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // Expire dans 7 jours

      const { data, error } = await supabase
        .from('team_invitations')
        .insert({
          repairer_id: user.id,
          email,
          role,
          permissions,
          invited_by: user.id,
          token,
          expires_at: expiresAt.toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      setInvitations(prev => [data, ...prev]);
      toast({
        title: "Invitation envoyée",
        description: `Une invitation a été envoyée à ${email}`
      });

      return data;
    } catch (error) {
      console.error('Error inviting team member:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer l'invitation",
        variant: "destructive"
      });
    }
  };

  const updateTeamMemberRole = async (memberId: string, role: string, permissions: any = {}) => {
    try {
      const { data, error } = await supabase
        .from('repairer_team_members')
        .update({ role, permissions })
        .eq('id', memberId)
        .eq('repairer_id', user?.id)
        .select()
        .single();

      if (error) throw error;

      setTeamMembers(prev => 
        prev.map(member => member.id === memberId ? { ...member, ...data } : member)
      );

      toast({
        title: "Rôle mis à jour",
        description: "Le rôle du membre a été modifié"
      });

      return data;
    } catch (error) {
      console.error('Error updating team member role:', error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le rôle",
        variant: "destructive"
      });
    }
  };

  const toggleTeamMemberStatus = async (memberId: string, isActive: boolean) => {
    try {
      const { data, error } = await supabase
        .from('repairer_team_members')
        .update({ is_active: isActive })
        .eq('id', memberId)
        .eq('repairer_id', user?.id)
        .select()
        .single();

      if (error) throw error;

      setTeamMembers(prev => 
        prev.map(member => member.id === memberId ? { ...member, ...data } : member)
      );

      toast({
        title: isActive ? "Membre activé" : "Membre désactivé",
        description: `Le membre a été ${isActive ? 'activé' : 'désactivé'}`
      });

      return data;
    } catch (error) {
      console.error('Error toggling team member status:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut",
        variant: "destructive"
      });
    }
  };

  const removeTeamMember = async (memberId: string) => {
    try {
      const { error } = await supabase
        .from('repairer_team_members')
        .delete()
        .eq('id', memberId)
        .eq('repairer_id', user?.id);

      if (error) throw error;

      setTeamMembers(prev => prev.filter(member => member.id !== memberId));
      toast({
        title: "Membre supprimé",
        description: "Le membre a été retiré de l'équipe"
      });
    } catch (error) {
      console.error('Error removing team member:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le membre",
        variant: "destructive"
      });
    }
  };

  const cancelInvitation = async (invitationId: string) => {
    try {
      const { error } = await supabase
        .from('team_invitations')
        .delete()
        .eq('id', invitationId)
        .eq('repairer_id', user?.id);

      if (error) throw error;

      setInvitations(prev => prev.filter(invitation => invitation.id !== invitationId));
      toast({
        title: "Invitation annulée",
        description: "L'invitation a été annulée"
      });
    } catch (error) {
      console.error('Error canceling invitation:', error);
      toast({
        title: "Erreur",
        description: "Impossible d'annuler l'invitation",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchTeamData();
  }, [user?.id]);

  return {
    teamMembers,
    invitations,
    loading,
    inviteTeamMember,
    updateTeamMemberRole,
    toggleTeamMemberStatus,
    removeTeamMember,
    cancelInvitation,
    refetch: fetchTeamData
  };
};