import { supabase } from '@/integrations/supabase/client';

export interface POSRole {
  id: string;
  repairer_id: string;
  role_name: string;
  description?: string;
  permissions: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface StaffAssignment {
  id: string;
  repairer_id: string;
  staff_user_id: string;
  role_id: string;
  assigned_at: string;
  assigned_by?: string;
  is_active: boolean;
  role?: POSRole;
  user_profile?: {
    id: string;
    email: string;
    first_name?: string;
    last_name?: string;
  };
}

export interface CreateRoleData {
  role_name: string;
  description?: string;
  permissions: string[];
}

// Permissions disponibles pour le POS
export const POS_PERMISSIONS = {
  // Ventes et transactions
  PROCESS_SALES: 'process_sales',
  HANDLE_REFUNDS: 'handle_refunds',
  APPLY_DISCOUNTS: 'apply_discounts',
  
  // Gestion des clients
  VIEW_CUSTOMERS: 'view_customers',
  EDIT_CUSTOMERS: 'edit_customers',
  VIEW_CUSTOMER_HISTORY: 'view_customer_history',
  
  // Inventaire
  VIEW_INVENTORY: 'view_inventory',
  EDIT_INVENTORY: 'edit_inventory',
  RECEIVE_STOCK: 'receive_stock',
  
  // Rapports
  VIEW_REPORTS: 'view_reports',
  VIEW_FINANCIAL_REPORTS: 'view_financial_reports',
  EXPORT_DATA: 'export_data',
  
  // Administration
  MANAGE_STAFF: 'manage_staff',
  MANAGE_SETTINGS: 'manage_settings',
  VIEW_AUDIT_LOGS: 'view_audit_logs',
  
  // Caisse
  OPEN_REGISTER: 'open_register',
  CLOSE_REGISTER: 'close_register',
  COUNT_CASH: 'count_cash'
} as const;

export const ROLE_TEMPLATES = {
  ADMIN: {
    role_name: 'Administrateur',
    description: 'Accès complet à toutes les fonctionnalités',
    permissions: Object.values(POS_PERMISSIONS)
  },
  MANAGER: {
    role_name: 'Manager',
    description: 'Gestion opérationnelle et rapports',
    permissions: [
      POS_PERMISSIONS.PROCESS_SALES,
      POS_PERMISSIONS.HANDLE_REFUNDS,
      POS_PERMISSIONS.APPLY_DISCOUNTS,
      POS_PERMISSIONS.VIEW_CUSTOMERS,
      POS_PERMISSIONS.EDIT_CUSTOMERS,
      POS_PERMISSIONS.VIEW_CUSTOMER_HISTORY,
      POS_PERMISSIONS.VIEW_INVENTORY,
      POS_PERMISSIONS.EDIT_INVENTORY,
      POS_PERMISSIONS.RECEIVE_STOCK,
      POS_PERMISSIONS.VIEW_REPORTS,
      POS_PERMISSIONS.VIEW_FINANCIAL_REPORTS,
      POS_PERMISSIONS.EXPORT_DATA,
      POS_PERMISSIONS.OPEN_REGISTER,
      POS_PERMISSIONS.CLOSE_REGISTER,
      POS_PERMISSIONS.COUNT_CASH
    ]
  },
  CASHIER: {
    role_name: 'Caissier',
    description: 'Ventes et caisse uniquement',
    permissions: [
      POS_PERMISSIONS.PROCESS_SALES,
      POS_PERMISSIONS.VIEW_CUSTOMERS,
      POS_PERMISSIONS.VIEW_INVENTORY,
      POS_PERMISSIONS.OPEN_REGISTER,
      POS_PERMISSIONS.CLOSE_REGISTER
    ]
  },
  TECHNICIAN: {
    role_name: 'Technicien',
    description: 'Gestion inventaire et réparations',
    permissions: [
      POS_PERMISSIONS.PROCESS_SALES,
      POS_PERMISSIONS.VIEW_CUSTOMERS,
      POS_PERMISSIONS.VIEW_CUSTOMER_HISTORY,
      POS_PERMISSIONS.VIEW_INVENTORY,
      POS_PERMISSIONS.EDIT_INVENTORY,
      POS_PERMISSIONS.RECEIVE_STOCK
    ]
  }
};

export class StaffManagementService {
  /**
   * Obtenir tous les rôles d'un réparateur
   */
  static async getRoles(repairerId: string): Promise<POSRole[]> {
    try {
      const { data, error } = await supabase
        .from('pos_staff_roles')
        .select('*')
        .eq('repairer_id', repairerId)
        .order('role_name');

      if (error) throw error;
      return (data || []).map(role => ({
        ...role,
        permissions: Array.isArray(role.permissions) ? role.permissions.filter(p => typeof p === 'string') : 
                    typeof role.permissions === 'string' ? [role.permissions] : []
      }));
    } catch (error) {
      console.error('Erreur récupération rôles:', error);
      throw error;
    }
  }

  /**
   * Créer un nouveau rôle
   */
  static async createRole(repairerId: string, roleData: CreateRoleData): Promise<POSRole> {
    try {
      const { data, error } = await supabase
        .from('pos_staff_roles')
        .insert({
          repairer_id: repairerId,
          ...roleData
        })
        .select()
        .single();

      if (error) throw error;
      return {
        ...data,
        permissions: Array.isArray(data.permissions) ? data.permissions.filter(p => typeof p === 'string') : []
      };
    } catch (error) {
      console.error('Erreur création rôle:', error);
      throw error;
    }
  }

  /**
   * Mettre à jour un rôle
   */
  static async updateRole(roleId: string, updates: Partial<CreateRoleData>): Promise<POSRole> {
    try {
      const { data, error } = await supabase
        .from('pos_staff_roles')
        .update(updates)
        .eq('id', roleId)
        .select()
        .single();

      if (error) throw error;
      return {
        ...data,
        permissions: Array.isArray(data.permissions) ? data.permissions.filter(p => typeof p === 'string') : []
      };
    } catch (error) {
      console.error('Erreur mise à jour rôle:', error);
      throw error;
    }
  }

  /**
   * Obtenir les affectations du personnel
   */
  static async getStaffAssignments(repairerId: string): Promise<StaffAssignment[]> {
    try {
      const { data, error } = await supabase
        .from('pos_staff_assignments')
        .select(`
          *,
          pos_staff_roles (
            id,
            role_name,
            description,
            permissions,
            is_active
          ),
          profiles (
            id,
            email,
            first_name,
            last_name
          )
        `)
        .eq('repairer_id', repairerId)
        .eq('is_active', true);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Erreur récupération affectations:', error);
      throw error;
    }
  }

  /**
   * Assigner un rôle à un utilisateur
   */
  static async assignRole(repairerId: string, staffUserId: string, roleId: string, assignedBy: string): Promise<StaffAssignment> {
    try {
      const { data, error } = await supabase
        .from('pos_staff_assignments')
        .insert({
          repairer_id: repairerId,
          staff_user_id: staffUserId,
          role_id: roleId,
          assigned_by: assignedBy
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Erreur affectation rôle:', error);
      throw error;
    }
  }

  /**
   * Révoquer un rôle
   */
  static async revokeRole(assignmentId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('pos_staff_assignments')
        .update({ is_active: false })
        .eq('id', assignmentId);

      if (error) throw error;
    } catch (error) {
      console.error('Erreur révocation rôle:', error);
      throw error;
    }
  }

  /**
   * Vérifier si un utilisateur a une permission spécifique
   */
  static async hasPermission(staffUserId: string, repairerId: string, permission: string): Promise<boolean> {
    try {
      const { data, error } = await supabase.rpc('has_pos_permission', {
        staff_user_id: staffUserId,
        repairer_id: repairerId,
        permission_name: permission
      });

      if (error) throw error;
      return data || false;
    } catch (error) {
      console.error('Erreur vérification permission:', error);
      return false;
    }
  }

  /**
   * Obtenir les permissions d'un utilisateur
   */
  static async getUserPermissions(staffUserId: string, repairerId: string): Promise<string[]> {
    try {
      const { data, error } = await supabase
        .from('pos_staff_assignments')
        .select(`
          pos_staff_roles (permissions)
        `)
        .eq('staff_user_id', staffUserId)
        .eq('repairer_id', repairerId)
        .eq('is_active', true);

      if (error) throw error;

      const permissions = new Set<string>();
      data?.forEach(assignment => {
        if (assignment.pos_staff_roles?.permissions) {
          const rolePermissions = Array.isArray(assignment.pos_staff_roles.permissions) 
            ? assignment.pos_staff_roles.permissions 
            : typeof assignment.pos_staff_roles.permissions === 'string' 
              ? [assignment.pos_staff_roles.permissions] 
              : [];
          rolePermissions.forEach((perm: string) => {
            permissions.add(perm);
          });
        }
      });

      return Array.from(permissions);
    } catch (error) {
      console.error('Erreur récupération permissions:', error);
      return [];
    }
  }

  /**
   * Initialiser les rôles par défaut pour un nouveau réparateur
   */
  static async initializeDefaultRoles(repairerId: string): Promise<void> {
    try {
      const roles = await Promise.all(
        Object.values(ROLE_TEMPLATES).map(template =>
          this.createRole(repairerId, template)
        )
      );

      console.log(`Rôles par défaut créés pour le réparateur ${repairerId}:`, roles);
    } catch (error) {
      console.error('Erreur initialisation rôles par défaut:', error);
      throw error;
    }
  }
}