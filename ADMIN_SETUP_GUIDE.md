# Admin Users Management System Setup Guide

This guide will help you set up and use the new Admin Users Management system in the TarimTours application.

## Overview

The new admin system provides:
- Role-based access control (RBAC)
- User invitation and management
- Granular permissions system
- Admin dashboard integration

## Database Setup

The system has been automatically set up with the following components:

### 1. User Roles
- **super_admin**: Full system access
- **admin**: Standard admin access
- **editor**: Content management access
- **viewer**: Read-only access
- **user**: Regular user (default)

### 2. Permissions
- `manage_users`: Manage other admin users
- `manage_packages`: Manage travel packages
- `manage_visa_offers`: Manage visa offers
- `manage_applications`: View and manage applications
- `view_analytics`: Access analytics dashboard
- `manage_settings`: System settings
- `manage_content`: Content management
- `view_reports`: Access reports

## Initial Setup

### 1. First Admin User
A default super admin user has been created:
- **Email**: admin@tarimtours.com
- **Role**: super_admin
- **Status**: Active

To set the password for this user:
1. Go to the Supabase Studio at http://127.0.0.1:54323
2. Navigate to Authentication > Users
3. Find the admin@tarimtours.com user
4. Click "Send magic link" or manually set a password

### 2. Environment Configuration
Ensure your `.env` file has the correct Supabase configuration:
```env
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0
```

## Using the Admin System

### 1. Accessing Admin Dashboard
- Log in to the application
- Navigate to `/admin` (Admin Dashboard)
- The "Admin Users Management" section will be visible to users with admin or super_admin roles

### 2. Inviting New Admin Users
1. Click "Invite New User" button
2. Fill in the form:
   - **Email**: Required, must be valid email
   - **Full Name**: Optional display name
   - **Role**: Select appropriate role (admin, editor, viewer)
   - **Permissions**: Check specific permissions for the role
3. Click "Invite User"

### 3. Managing Existing Users
- **Edit**: Modify user details, role, permissions, or status
- **Activate/Deactivate**: Toggle user access without deleting
- **Role Assignment**: Change user roles (super_admin role requires super_admin privileges)

### 4. Role Capabilities

#### Super Admin
- Full system access
- Can assign super_admin role
- Can manage all users and permissions

#### Admin
- Can manage users (except super_admin)
- Can manage content and applications
- Can view analytics and reports

#### Editor
- Can manage content (packages, visa offers)
- Limited user management
- Cannot assign admin roles

#### Viewer
- Read-only access to admin dashboard
- Can view reports and analytics
- Cannot make changes

## API Reference

### AdminAPI Service
The `src/services/adminAPI.ts` file provides the following methods:

- `getAllUsers()`: Fetch all users for admin management
- `getCurrentUserRole()`: Get current user's role
- `isCurrentUserAdmin()`: Check if current user is admin
- `isCurrentUserSuperAdmin()`: Check if current user is super admin
- `inviteUser(data)`: Invite new admin user
- `updateUser(id, data)`: Update user details
- `toggleUserStatus(id, status)`: Activate/deactivate user
- `searchUsers(query)`: Search users by email or name

### Database Functions
The system includes PostgreSQL functions:

- `is_admin(uuid)`: Check if user has admin role
- `has_permission(uuid, permission)`: Check specific permission
- `invite_admin_user(email, role, permissions)`: Invite new admin
- `update_user_role(user_id, new_role, permissions)`: Update user role
- `toggle_user_status(user_id, status)`: Toggle user status

## Security Features

### 1. Role-Based Access Control
- All admin endpoints check user role before allowing access
- Super admin role has special privileges
- Regular users cannot access admin functions

### 2. Permission System
- Granular permissions for different actions
- Permissions can be assigned per user
- Role-based default permissions

### 3. Audit Trail
- User creation and modification are tracked
- Invited users show who invited them
- Last login timestamps are maintained

## Troubleshooting

### Common Issues

1. **"You don't have permission" message**
   - Ensure you're logged in as an admin user
   - Check your role in the profiles table

2. **Cannot assign super_admin role**
   - Only super_admin users can assign this role
   - Verify your current role

3. **User invitation fails**
   - Check if email already exists
   - Ensure you have admin privileges
   - Verify Supabase connection

4. **Database connection issues**
   - Ensure Supabase is running: `npx supabase start`
   - Check environment variables
   - Verify database migrations applied

### Resetting Admin Access
If you lose admin access:
1. Connect to the database directly
2. Run: `UPDATE profiles SET role = 'super_admin' WHERE email = 'your-email@domain.com'`
3. Or use the Supabase Studio to modify the user role

## Testing the System

### 1. Test Admin Access
1. Log in as the default admin user
2. Navigate to Admin Dashboard
3. Verify you can see the Users Management section

### 2. Test User Invitation
1. Invite a new user with editor role
2. Check if the invitation appears in the user list
3. Verify the invited user can log in

### 3. Test Permission System
1. Create a user with viewer role
2. Verify they can only view but not edit
3. Test role escalation to editor

## Development Notes

### Adding New Permissions
1. Add the permission to `getAvailablePermissions()` in adminAPI.ts
2. Update the database permissions JSON schema
3. Add UI elements for the new permission

### Adding New Roles
1. Add the role to the `user_role` enum in the database
2. Update role display names in adminAPI.ts
3. Update role-based logic in components

### Customizing the UI
- Modify `UsersManager.tsx` for table layout changes
- Update `AddUserModal.tsx` and `EditUserModal.tsx` for form changes
- Customize styling in the respective component files

## Support
For technical issues or questions about the admin system, please refer to the development team or check the Supabase documentation.
