import { supabase } from './supabaseClient';

export interface AdminUser {
  id: string;
  email: string;
  joined_at: string;
  last_sign_in_at: string | null;
  full_name: string | null;
  role: 'user' | 'admin' | 'super_admin' | 'editor' | 'viewer';
  is_active: boolean;
  last_login: string | null;
  invited_by: string | null;
  invited_at: string | null;
  permissions: Record<string, boolean>;
  invited_by_email: string | null;
}

export interface InviteUserData {
  email: string;
  role: 'admin' | 'super_admin' | 'editor' | 'viewer';
  permissions?: Record<string, boolean>;
  fullName?: string;
}

export interface UpdateUserData {
  role?: 'user' | 'admin' | 'super_admin' | 'editor' | 'viewer';
  permissions?: Record<string, boolean>;
  isActive?: boolean;
  fullName?: string;
}

class AdminAPIService {
  // Get all users for admin management
  async getAllUsers(): Promise<AdminUser[]> {
    const { data, error } = await supabase
      .from('admin_users_view')
      .select('*')
      .order('joined_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }

  // Get current user's role
  async getCurrentUserRole(): Promise<string | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching user role:', error);
      return null;
    }

    return data?.role || null;
  }

  // Check if current user is admin
  async isCurrentUserAdmin(): Promise<boolean> {
    const role = await this.getCurrentUserRole();
    return role === 'admin' || role === 'super_admin';
  }

  // Check if current user is super admin
  async isCurrentUserSuperAdmin(): Promise<boolean> {
    const role = await this.getCurrentUserRole();
    return role === 'super_admin';
  }

  // Invite new user
  async inviteUser(userData: InviteUserData): Promise<string> {
    try {
      const { data, error } = await supabase
        .rpc('invite_admin_user', {
          target_email: userData.email,
          target_role: userData.role,
          target_permissions: userData.permissions || {}
        });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error: any) {
      throw new Error(`Failed to invite user: ${error.message}`);
    }
  }

  // Update user role and permissions
  async updateUser(userId: string, updateData: UpdateUserData): Promise<void> {
    try {
      const { error } = await supabase
        .rpc('update_user_role', {
          target_user_id: userId,
          new_role: updateData.role,
          new_permissions: updateData.permissions || undefined
        });

      if (error) {
        throw new Error(error.message);
      }

      // Update additional fields if provided
      if (updateData.fullName !== undefined || updateData.isActive !== undefined) {
        const updateObj: any = {};
        if (updateData.fullName !== undefined) updateObj.full_name = updateData.fullName;
        if (updateData.isActive !== undefined) updateObj.is_active = updateData.isActive;

        const { error: profileError } = await supabase
          .from('profiles')
          .update(updateObj)
          .eq('id', userId);

        if (profileError) {
          throw new Error(profileError.message);
        }
      }
    } catch (error: any) {
      throw new Error(`Failed to update user: ${error.message}`);
    }
  }

  // Toggle user active status
  async toggleUserStatus(userId: string, isActive: boolean): Promise<void> {
    try {
      const { error } = await supabase
        .rpc('toggle_user_status', {
          target_user_id: userId,
          new_status: isActive
        });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error: any) {
      throw new Error(`Failed to toggle user status: ${error.message}`);
    }
  }

  // Delete user (soft delete by deactivating)
  async deactivateUser(userId: string): Promise<void> {
    return this.toggleUserStatus(userId, false);
  }

  // Reactivate user
  async reactivateUser(userId: string): Promise<void> {
    return this.toggleUserStatus(userId, true);
  }

  // Get user by ID
  async getUserById(userId: string): Promise<AdminUser | null> {
    const { data, error } = await supabase
      .from('admin_users_view')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user:', error);
      return null;
    }

    return data;
  }

  // Search users
  async searchUsers(query: string): Promise<AdminUser[]> {
    const { data, error } = await supabase
      .from('admin_users_view')
      .select('*')
      .or(`email.ilike.%${query}%,full_name.ilike.%${query}%`)
      .order('joined_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  }

  // Get available permissions
  getAvailablePermissions(): Record<string, string> {
    return {
      'manage_users': 'Manage Users',
      'manage_packages': 'Manage Travel Packages',
      'manage_visa_offers': 'Manage Visa Offers',
      'manage_applications': 'Manage Applications',
      'view_analytics': 'View Analytics',
      'manage_settings': 'Manage Settings',
      'manage_content': 'Manage Content',
      'view_reports': 'View Reports'
    };
  }

  // Get role display names
  getRoleDisplayNames(): Record<string, string> {
    return {
      'user': 'Regular User',
      'admin': 'Administrator',
      'super_admin': 'Super Administrator',
      'editor': 'Editor',
      'viewer': 'Viewer'
    };
  }
}

export default new AdminAPIService();
