import React, { useEffect, useState } from "react";
import { sanitizeFilename } from "../../utils/helpers";
import supabaseAPI from "../../services/supabaseAPI";
import Button from "../../components/common/Button";
import LoadingSpinner from "../../components/common/LoadingSpinner";
import ViewVisaOfferModal from "./ViewVisaOfferModal";

interface VisaOffer {
  id: string;
  country: string;
  visa_type: string;
  duration: string;
  price: number;
  requirements: string;
  cover_photo_url?: string;
  status?: 'active' | 'archived';
  created_at?: string;
  updated_at?: string;
}

const initialForm: Omit<VisaOffer, "id"> = {
  country: "",
  visa_type: "",
  duration: "",
  price: 0,
  requirements: "",
  cover_photo_url: "",
};

const VisaOffersManager: React.FC = () => {
  const [offers, setOffers] = useState<VisaOffer[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<VisaOffer | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Fetch offers
  const fetchOffers = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('Fetching visa offers...');
      const data = await supabaseAPI.getVisaOffers();
      console.log('Fetched visa offers:', data);
      setOffers(data || []);
    } catch (err: any) {
      console.error('Error fetching offers:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOffers();
  }, []);

  // Handle form input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle file input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const originalFile = e.target.files[0];
      const cleanName = `${Date.now()}_${sanitizeFilename(originalFile.name)}`;
      const sanitizedFile = new File([originalFile], cleanName, {
        type: originalFile.type,
        lastModified: originalFile.lastModified,
      });
      setCoverFile(sanitizedFile);
    }
  };

  // Open form for add/edit
  const openForm = (offer?: VisaOffer) => {
    if (offer) {
      setForm({
        country: offer.country,
        visa_type: offer.visa_type,
        duration: offer.duration,
        price: offer.price,
        requirements: offer.requirements,
        cover_photo_url: offer.cover_photo_url || "",
      });
      setEditingId(offer.id);
    } else {
      setForm(initialForm);
      setEditingId(null);
    }
    setCoverFile(null);
    setShowForm(true);
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (editingId) {
        await supabaseAPI.updateVisaOffer(editingId, form);
        if (coverFile) {
          // This is not ideal, as it will orphan the old file.
          // A better solution would be to delete the old file first.
          await supabaseAPI.uploadVisaOffer(form, coverFile);
        }
      } else {
        if (coverFile) {
          await supabaseAPI.uploadVisaOffer(form, coverFile);
        } else {
          setError("A cover photo is required to add a new offer.");
          setLoading(false);
          return;
        }
      }
      setShowForm(false);
      await fetchOffers();
    } catch (err: any) {
      setError(err.message);
    }
    setLoading(false);
  };

  // Delete offer
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this offer?")) return;
    setActionLoading(`delete-${id}`);
    setError(null);
    setSuccess(null);
    try {
      // First, optimistically remove from UI
      setOffers(prevOffers => prevOffers.filter(offer => offer.id !== id));
      
      // Then delete from database
      await supabaseAPI.deleteVisaOffer(id);
      
      // Refresh data to ensure consistency
      await fetchOffers();
      
      // Show success message
      setSuccess("Visa offer deleted successfully!");
      setTimeout(() => setSuccess(null), 3000);
      console.log(`Successfully deleted offer with ID: ${id}`);
    } catch (err: any) {
      console.error('Delete error:', err);
      setError(`Failed to delete offer: ${err.message}`);
      // Refresh data to restore UI state if delete failed
      await fetchOffers();
    } finally {
      setActionLoading(null);
    }
  };

  // Duplicate offer
  const handleDuplicate = async (offer: VisaOffer) => {
    setActionLoading(`duplicate-${offer.id}`);
    setError(null);
    try {
      const duplicatedOffer = {
        country: `${offer.country} (Copy)`,
        visa_type: offer.visa_type,
        duration: offer.duration,
        price: offer.price,
        requirements: offer.requirements,
        cover_photo_url: offer.cover_photo_url,
        status: 'active',
      };
      
      // Use the supabase client directly to insert without file upload
      const { supabase } = await import('../../services/supabaseClient');
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");
      
      const { error: dbError } = await supabase
        .from('visa_offers')
        .insert({
          ...duplicatedOffer,
          created_by: user.id
        });
      
      if (dbError) {
        throw new Error(`Database insert failed: ${dbError.message}`);
      }
      
      await fetchOffers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // Toggle status
  const handleToggleStatus = async (id: string, currentStatus: string) => {
    setActionLoading(`status-${id}`);
    setError(null);
    try {
      const newStatus = currentStatus === 'active' ? 'archived' : 'active';
      await supabaseAPI.updateVisaOffer(id, { status: newStatus });
      await fetchOffers();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(null);
    }
  };

  // Open view modal
  const openViewModal = (offer: VisaOffer) => {
    setSelectedOffer(offer);
    setShowViewModal(true);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Visa Offers Management</h2>
          <p className="text-gray-600 text-sm mt-1">Add, edit, or remove visa offers. All changes are synced with Supabase.</p>
        </div>
        <Button
          className="bg-blue-600 hover:bg-blue-700 text-white"
          onClick={() => openForm()}
          type="button"
        >
          Add New Offer
        </Button>
      </div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-gray-600">Loading visa offers...</span>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full table-auto border">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cover</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Country</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visa Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requirements</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {offers.map((offer) => (
              <tr key={offer.id} className="hover:bg-gray-50 transition">
                <td className="px-4 py-4 whitespace-nowrap">
                  {offer.cover_photo_url ? (
                    <img src={offer.cover_photo_url} alt="cover" className="w-16 h-16 object-cover rounded-md border" />
                  ) : (
                    <div className="w-16 h-16 bg-gray-200 rounded-md border flex items-center justify-center">
                      <span className="text-gray-400 text-xs">No Image</span>
                    </div>
                  )}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div>
                      <div className="font-medium text-gray-800">{offer.country}</div>
                      <div className="flex items-center mt-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          offer.status === 'active'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {offer.status || 'active'}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-gray-800">{offer.visa_type}</td>
                <td className="px-4 py-4 whitespace-nowrap text-gray-800">{offer.duration}</td>
                <td className="px-4 py-4 whitespace-nowrap text-green-700 font-semibold">${offer.price}</td>
                <td className="px-4 py-4">
                  <div className="max-w-[150px] truncate" title={offer.requirements}>
                    {offer.requirements}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap min-w-[300px]">
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 text-xs"
                      onClick={() => openViewModal(offer)}
                      type="button"
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      className="bg-yellow-500 hover:bg-yellow-600 text-white px-2 py-1 text-xs"
                      onClick={() => openForm(offer)}
                      type="button"
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 text-xs"
                      onClick={() => handleDuplicate(offer)}
                      type="button"
                      disabled={actionLoading === `duplicate-${offer.id}`}
                    >
                      {actionLoading === `duplicate-${offer.id}` ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        'Duplicate'
                      )}
                    </Button>
                    <Button
                      size="sm"
                      className={`px-2 py-1 text-xs text-white ${
                        offer.status === 'active'
                          ? 'bg-gray-500 hover:bg-gray-600'
                          : 'bg-green-500 hover:bg-green-600'
                      }`}
                      onClick={() => handleToggleStatus(offer.id, offer.status || 'active')}
                      type="button"
                      disabled={actionLoading === `status-${offer.id}`}
                    >
                      {actionLoading === `status-${offer.id}` ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        offer.status === 'active' ? 'Archive' : 'Activate'
                      )}
                    </Button>
                    <Button
                      size="sm"
                      className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 text-xs"
                      onClick={() => handleDelete(offer.id)}
                      type="button"
                      disabled={actionLoading === `delete-${offer.id}`}
                    >
                      {actionLoading === `delete-${offer.id}` ? (
                        <LoadingSpinner size="sm" />
                      ) : (
                        'Delete'
                      )}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
            {offers.length === 0 && !loading && (
              <tr>
                <td colSpan={7} className="text-center p-8 text-gray-400">
                  No visa offers found. Click "Add New Offer" to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-lg relative">
            <Button
              className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
              onClick={() => setShowForm(false)}
              type="button"
              variant="secondary"
              size="sm"
            >
              &times;
            </Button>
            <h3 className="text-lg font-bold mb-4">{editingId ? "Edit Offer" : "Add New Offer"}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block font-semibold mb-1">Country</label>
                <input
                  type="text"
                  name="country"
                  value={form.country}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Visa Type</label>
                <input
                  type="text"
                  name="visa_type"
                  value={form.visa_type}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Duration</label>
                <input
                  type="text"
                  name="duration"
                  value={form.duration}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Price</label>
                <input
                  type="number"
                  name="price"
                  value={form.price}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  required
                  min={0}
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Requirements</label>
                <textarea
                  name="requirements"
                  value={form.requirements}
                  onChange={handleChange}
                  className="w-full border rounded px-3 py-2"
                  required
                  rows={3}
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">Cover Photo</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="w-full"
                />
                {form.cover_photo_url && !coverFile && (
                  <img src={form.cover_photo_url} alt="cover" className="w-24 h-16 object-cover mt-2 rounded" />
                )}
                {coverFile && (
                  <span className="block text-green-600 mt-1">{coverFile.name}</span>
                )}
              </div>
              <div className="flex justify-end">
                <Button
                  type="submit"
                  className="px-4"
                  disabled={loading}
                >
                  {editingId ? "Update" : "Add"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* View Modal */}
      {selectedOffer && (
        <ViewVisaOfferModal
          isOpen={showViewModal}
          onClose={() => {
            setShowViewModal(false);
            setSelectedOffer(null);
          }}
          offer={selectedOffer}
        />
      )}
    </div>
  );
};

export default VisaOffersManager;
