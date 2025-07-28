import React, { useState } from 'react';
import Button from '../common/Button';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAddAccessory: (accessory: any, file: File | null) => Promise<string | null>;
}

const AddAccessoryModal: React.FC<Props> = ({ isOpen, onClose, onAddAccessory }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const categories = [
    { value: 'luggage', label: '🧳 Luggage' },
    { value: 'electronics', label: '🔌 Electronics' },
    { value: 'comfort', label: '😌 Comfort' },
    { value: 'security', label: '🔒 Security' },
    { value: 'health', label: '🏥 Health' }
  ];
  const [category, setCategory] = useState(categories[0].value);
  const [price, setPrice] = useState(0);
  const [stock_quantity, setStockQuantity] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    // Get current user for created_by
    const { data: { user }, error: userError } = await import('../../services/supabaseClient').then(m => m.supabase.auth.getUser());
    if (userError || !user) {
      throw new Error('User must be authenticated to add an accessory.');
    }
    const result = await onAddAccessory({ name, description, category, price, stock_quantity, created_by: user.id }, file);
    setLoading(false);
    if (result) {
      setError(result);
      } else {
        // Reset form on success
        setName('');
        setDescription('');
        setCategory(categories[0].value);
        setPrice(0);
        setStockQuantity(0);
        setFile(null);
        onClose();
      }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg">
        <h2 className="text-xl font-bold mb-4">Add New Accessory</h2>
        {error && (
          <div className="mb-4 text-red-600 bg-red-100 border border-red-200 rounded p-2">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            >
              {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Price</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Stock Quantity</label>
            <input
              type="number"
              value={stock_quantity}
              onChange={(e) => setStockQuantity(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">Image</label>
            <input
              type="file"
              onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
            />
          </div>
          <div className="flex justify-end">
            <Button variant="secondary" onClick={onClose} className="mr-2" type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Accessory'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddAccessoryModal;
