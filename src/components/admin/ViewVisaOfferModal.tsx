import React from 'react';
import Button from '../common/Button';

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

interface Props {
  isOpen: boolean;
  onClose: () => void;
  offer: VisaOffer;
}

const ViewVisaOfferModal: React.FC<Props> = ({ isOpen, onClose, offer }) => {
  if (!isOpen || !offer) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Visa Offer Details</h2>
          <Button 
            onClick={onClose} 
            className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 text-sm"
          >
            ×
          </Button>
        </div>
        
        <div className="space-y-6">
          {/* Cover Image */}
          {offer.cover_photo_url && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>
              <img
                src={offer.cover_photo_url}
                alt={`${offer.country} visa`}
                className="w-full h-64 object-cover rounded-lg border"
              />
            </div>
          )}

          {/* Country */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-lg font-semibold text-gray-800">{offer.country}</p>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <div className="p-3 bg-gray-50 rounded-md">
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                offer.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {offer.status || 'active'}
              </span>
            </div>
          </div>

          {/* Visa Type and Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Visa Type</label>
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="text-gray-800">{offer.visa_type}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="text-gray-800">{offer.duration}</p>
              </div>
            </div>
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-2xl font-semibold text-green-700">${offer.price}</p>
            </div>
          </div>

          {/* Requirements */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Requirements</label>
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-gray-800 whitespace-pre-wrap">{offer.requirements}</p>
            </div>
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Created At</label>
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600">
                  {offer.created_at ? new Date(offer.created_at).toLocaleString() : 'N/A'}
                </p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Updated At</label>
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600">
                  {offer.updated_at ? new Date(offer.updated_at).toLocaleString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end mt-8">
          <Button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 text-white">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ViewVisaOfferModal;