import React, { useState, useEffect } from 'react';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import supabaseAPI from '../../services/supabaseAPI';
import AddPackageModal from './AddPackageModal';
import EditPackageModal from './EditPackageModal';
import ViewPackageModal from './ViewPackageModal';

interface TravelPackage {
  id: string;
  attributes: {
    name: string;
    description: string;
    destination: string;
    price: number;
    duration: string;
    createdAt: string;
    updatedAt?: string;
    cover_photo_url?: string;
    cover_image?: {
      data: {
        attributes: {
          url: string;
        };
      };
    };
    status?: 'active' | 'archived';
  };
}

const TravelPackagesManager: React.FC = () => {
  const [packages, setPackages] = useState<TravelPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<TravelPackage | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      setError(null);
      console.log('Fetching travel packages...');
      const data = await supabaseAPI.getTravelPackages();
      console.log('Fetched travel packages:', data);
      setPackages(data || []);
    } catch (error: any) {
      console.error('Error fetching travel packages:', error);
      setError(error.message || 'Failed to fetch travel packages');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this package?')) {
      try {
        setActionLoading(`delete-${id}`);
        setError(null);
        
        // First, optimistically remove from UI
        setPackages(prevPackages => prevPackages.filter(pkg => pkg.id !== id));
        
        // Then delete from database
        await supabaseAPI.deleteTravelPackage(id);
        
        // Refresh data to ensure consistency
        await fetchPackages();
        
        // Show success message
        alert("Travel package deleted successfully!");
        console.log(`Successfully deleted package with ID: ${id}`);
      } catch (error: any) {
        console.error('Error deleting package:', error);
        setError(error.message || 'Failed to delete package');
        // Refresh data to restore UI state if delete failed
        await fetchPackages();
      } finally {
        setActionLoading(null);
      }
    }
  };

  const handleDuplicate = async (pkg: TravelPackage) => {
    try {
      setActionLoading(`duplicate-${pkg.id}`);
      setError(null);
      const duplicatedPackage = {
        ...pkg.attributes,
        name: `${pkg.attributes.name} (Copy)`,
      };
      await supabaseAPI.createTravelPackage(duplicatedPackage);
      await fetchPackages();
    } catch (error: any) {
      console.error('Error duplicating package:', error);
      setError(error.message || 'Failed to duplicate package');
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    try {
      setActionLoading(`status-${id}`);
      setError(null);
      const newStatus = currentStatus === 'active' ? 'archived' : 'active';
      await supabaseAPI.updateTravelPackage(id, { status: newStatus });
      await fetchPackages();
    } catch (error: any) {
      console.error('Error updating package status:', error);
      setError(error.message || 'Failed to update package status');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAddPackage = async (pkg: any, file: File | null) => {
    try {
      // Get current user for created_by
      const { data: { user }, error: userError } = await import('../../services/supabaseClient').then(m => m.supabase.auth.getUser());
      if (userError || !user) {
        throw new Error('User must be authenticated to add a package.');
      }
      if (file) {
        const { url } = await supabaseAPI.uploadFile(file);
        pkg.cover_photo_url = url;
      }
      pkg.created_by = user.id;
      await supabaseAPI.createTravelPackage(pkg);
      await fetchPackages();
      return null; // No error
    } catch (error: any) {
      console.error('Error creating travel package:', error);
      return error.message || 'Failed to create travel package';
    }
  };

  const handleEditPackage = async (id: string, pkg: any, file: File | null) => {
    try {
      if (file) {
        const { url } = await supabaseAPI.uploadFile(file);
        pkg.cover_photo_url = url;
      }
      await supabaseAPI.updateTravelPackage(id, pkg);
      await fetchPackages();
    } catch (error) {
      console.error('Error updating package:', error);
    }
  };

  const openEditModal = (pkg: TravelPackage) => {
    setSelectedPackage(pkg);
    setIsEditModalOpen(true);
  };

  const openViewModal = (pkg: TravelPackage) => {
    setSelectedPackage(pkg);
    setIsViewModalOpen(true);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-gray-600">Loading travel packages...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Travel Packages</h2>
          <p className="text-gray-600 text-sm mt-1">Manage your travel packages, add new ones, and track their performance</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          Add New Package
        </Button>
      </div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cover</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Destination</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created At</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Updated At</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {packages.map((pkg) => (
              <tr key={pkg.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-4 whitespace-nowrap">
                  {(pkg.attributes.cover_image?.data?.attributes?.url || pkg.attributes.cover_photo_url) ? (
                    <img
                      src={pkg.attributes.cover_image?.data?.attributes?.url || pkg.attributes.cover_photo_url}
                      alt={pkg.attributes.name}
                      className="w-16 h-16 object-cover rounded-md border"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded-md border flex items-center justify-center">
                      <span className="text-gray-400 text-xs">No Image</span>
                    </div>
                  )}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="font-medium text-gray-800">{pkg.attributes.name}</div>
                      <div className="flex items-center mt-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          pkg.attributes.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {pkg.attributes.status || 'active'}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="max-w-xs truncate" title={pkg.attributes.description}>
                    {pkg.attributes.description}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">{pkg.attributes.destination}</td>
                <td className="px-4 py-4 whitespace-nowrap text-green-700 font-semibold">${pkg.attributes.price}</td>
                <td className="px-4 py-4 whitespace-nowrap">{pkg.attributes.duration}</td>
                <td className="px-4 py-4 whitespace-nowrap text-xs text-gray-500">
                  {pkg.attributes.createdAt ? new Date(pkg.attributes.createdAt).toLocaleDateString() : ""}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-xs text-gray-500">
                  {pkg.attributes.updatedAt ? new Date(pkg.attributes.updatedAt).toLocaleDateString() : ""}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 text-xs"
                      onClick={() => openViewModal(pkg)}
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 text-xs"
                      onClick={() => openEditModal(pkg)}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 text-xs"
                      onClick={() => handleDuplicate(pkg)}
                      disabled={actionLoading === `duplicate-${pkg.id}`}
                    >
                      {actionLoading === `duplicate-${pkg.id}` ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        'Duplicate'
                      )}
                    </Button>
                    <Button
                      size="sm"
                      className={`px-2 py-1 text-xs text-white ${
                        pkg.attributes.status === 'active'
                          ? 'bg-gray-500 hover:bg-gray-600'
                          : 'bg-green-500 hover:bg-green-600'
                      }`}
                      onClick={() => handleToggleStatus(pkg.id, pkg.attributes.status || 'active')}
                      disabled={actionLoading === `status-${pkg.id}`}
                    >
                      {actionLoading === `status-${pkg.id}` ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        pkg.attributes.status === 'active' ? 'Archive' : 'Activate'
                      )}
                    </Button>
                    <Button
                      size="sm"
                      className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 text-xs"
                      onClick={() => handleDelete(pkg.id)}
                      disabled={actionLoading === `delete-${pkg.id}`}
                    >
                      {actionLoading === `delete-${pkg.id}` ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        'Delete'
                      )}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {packages.length === 0 && (
              <tr>
                <td colSpan={9} className="text-center p-4 text-gray-400">
                  No travel packages found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <AddPackageModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddPackage={handleAddPackage}
      />
      {selectedPackage && (
        <EditPackageModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onEditPackage={handleEditPackage}
          pkg={selectedPackage}
        />
      )}
      {selectedPackage && (
        <ViewPackageModal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          pkg={selectedPackage}
        />
      )}
    </div>
  );
};

export default TravelPackagesManager;
