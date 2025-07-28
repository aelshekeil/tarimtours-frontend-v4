import React, { useState, useEffect } from "react";
import Button from "../common/Button";
import LoadingSpinner from "../common/LoadingSpinner";
import AddUserModal from "./AddUserModal";
import EditUserModal from "./EditUserModal";
import adminAPI, { AdminUser } from "../../services/adminAPI";

const UsersManager: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const roleDisplayNames = adminAPI.getRoleDisplayNames();

  useEffect(() => {
    checkAdminStatus();
    loadUsers();
  }, []);

  const checkAdminStatus = async () => {
    const admin = await adminAPI.isCurrentUserAdmin();
    setIsAdmin(admin);
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const userData = await adminAPI.getAllUsers();
      setUsers(userData);
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = () => {
    setIsAddModalOpen(true);
  };

  const handleEditUser = (user: AdminUser) => {
    setSelectedUser(user);
    setIsEditModalOpen(true);
  };

  const handleToggleStatus = async (user: AdminUser) => {
    try {
      await adminAPI.toggleUserStatus(user.id, !user.is_active);
      loadUsers();
    } catch (err: any) {
      setError(err.message || 'Failed to update user status');
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString();
  };

  if (!isAdmin) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-bold mb-4">Admin Users Management</h2>
        <p className="text-red-600">You don't have permission to access this section.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <h2 className="text-lg font-bold mb-4">Admin Users Management</h2>
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-lg font-bold">Admin Users Management</h2>
          <p className="text-gray-600 text-sm">View and manage admin users and their roles.</p>
        </div>
        <Button onClick={handleAddUser} type="button">
          Invite New User
        </Button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Last Login</th>
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-2 font-medium text-gray-800">
                  {user.full_name || 'N/A'}
                </td>
                <td className="px-4 py-2 text-sm">{user.email}</td>
                <td className="px-4 py-2">
                  <span className="text-sm font-medium">
                    {roleDisplayNames[user.role] || user.role}
                  </span>
                </td>
                <td className="px-4 py-2">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${
                    user.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                  }`}>
                    {user.is_active ? "Active" : "Inactive"}
                  </span>
                </td>
                <td className="px-4 py-2 text-sm">{formatDate(user.joined_at)}</td>
                <td className="px-4 py-2 text-sm">{formatDate(user.last_sign_in_at)}</td>
                <td className="px-4 py-2 space-x-2">
                  <Button 
                    size="sm" 
                    variant="secondary" 
                    type="button"
                    onClick={() => handleEditUser(user)}
                  >
                    Edit
                  </Button>
                  <Button 
                    size="sm" 
                    variant={user.is_active ? "danger" : "success"}
                    type="button"
                    onClick={() => handleToggleStatus(user)}
                  >
                    {user.is_active ? 'Deactivate' : 'Activate'}
                  </Button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={7} className="text-center p-4 text-gray-400">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onUserAdded={loadUsers}
      />

      <EditUserModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedUser(null);
        }}
        onUserUpdated={loadUsers}
        user={selectedUser}
      />
    </div>
  );
};

export default UsersManager;
