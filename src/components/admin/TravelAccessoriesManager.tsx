import React, { useState, useEffect } from 'react';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import supabaseAPI from '../../services/supabaseAPI';
import { TravelAccessory } from '../../utils/types';
import AddAccessoryModal from './AddAccessoryModal';

const TravelAccessoriesManager: React.FC = () => {
  const [accessories, setAccessories] = useState<TravelAccessory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    fetchAccessories();
  }, []);

  const fetchAccessories = async () => {
    try {
      setError(null);
      const data = await supabaseAPI.getTravelAccessories();
      setAccessories(data || []);
    } catch (error: any) {
      console.error('Error fetching travel accessories:', error);
      setError(error.message || 'Failed to fetch travel accessories');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAccessory = async (accessory: any, file: File | null) => {
    try {
      if (file) {
        const { url } = await supabaseAPI.uploadFile(file);
        accessory.images = [{ url }];
      }
      await supabaseAPI.createTravelAccessory(accessory);
      await fetchAccessories();
      return null; // No error
    } catch (error: any) {
      console.error('Error creating travel accessory:', error);
      return error.message || 'Failed to create travel accessory';
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this accessory?')) {
      try {
        setActionLoading(`delete-${id}`);
        setError(null);
        
        await supabaseAPI.deleteTravelAccessory(id);
        
        await fetchAccessories();
        
        alert("Travel accessory deleted successfully!");
      } catch (error: any) {
        console.error('Error deleting accessory:', error);
        setError(error.message || 'Failed to delete accessory');
      } finally {
        setActionLoading(null);
      }
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-gray-600">Loading travel accessories...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Travel Accessories</h2>
          <p className="text-gray-600 text-sm mt-1">Manage your travel accessories, add new ones, and track their stock</p>
        </div>
        <Button onClick={() => setIsAddModalOpen(true)} className="bg-blue-600 hover:bg-blue-700">
          Add New Accessory
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
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {accessories.map((accessory) => (
              <tr key={accessory.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-4 whitespace-nowrap">
                  {accessory.images && accessory.images.length > 0 ? (
                    <img
                      src={accessory.images[0].url}
                      alt={accessory.name}
                      className="w-16 h-16 object-cover rounded-md border"
                    />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded-md border flex items-center justify-center">
                      <span className="text-gray-400 text-xs">No Image</span>
                    </div>
                  )}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="font-medium text-gray-800">{accessory.name}</div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">{accessory.category}</td>
                <td className="px-4 py-4 whitespace-nowrap text-green-700 font-semibold">${accessory.price}</td>
                <td className="px-4 py-4 whitespace-nowrap">{accessory.stock_quantity}</td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 text-xs"
                      onClick={() => alert("Edit modal coming soon!")}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 text-xs"
                      onClick={() => handleDelete(accessory.id)}
                      disabled={actionLoading === `delete-${accessory.id}`}
                    >
                      {actionLoading === `delete-${accessory.id}` ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        'Delete'
                      )}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {accessories.length === 0 && (
              <tr>
                <td colSpan={6} className="text-center p-4 text-gray-400">
                  No travel accessories found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <AddAccessoryModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddAccessory={handleAddAccessory}
      />
    </div>
  );
};

export default TravelAccessoriesManager;
