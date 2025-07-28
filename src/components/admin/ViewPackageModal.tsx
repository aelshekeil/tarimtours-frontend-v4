import React from 'react';
import Button from '../common/Button';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  pkg: any;
}

const ViewPackageModal: React.FC<Props> = ({ isOpen, onClose, pkg }) => {
  if (!isOpen || !pkg) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Package Details</h2>
          <Button 
            onClick={onClose} 
            className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 text-sm"
          >
            ×
          </Button>
        </div>
        
        <div className="space-y-6">
          {/* Cover Image */}
          {(pkg.attributes.cover_image?.data?.attributes?.url || pkg.attributes.cover_photo_url) && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Cover Image</label>
              <img
                src={pkg.attributes.cover_image?.data?.attributes?.url || pkg.attributes.cover_photo_url}
                alt={pkg.attributes.name}
                className="w-full h-64 object-cover rounded-lg border"
              />
            </div>
          )}

          {/* Package Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Package Name</label>
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-lg font-semibold text-gray-800">{pkg.attributes.name}</p>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
            <div className="p-3 bg-gray-50 rounded-md">
              <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                pkg.attributes.status === 'active' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-gray-100 text-gray-800'
              }`}>
                {pkg.attributes.status || 'active'}
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-gray-800">{pkg.attributes.description}</p>
            </div>
          </div>

          {/* Destination */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Destination</label>
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-gray-800">{pkg.attributes.destination}</p>
            </div>
          </div>

          {/* Price and Duration */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Price</label>
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="text-lg font-semibold text-green-700">${pkg.attributes.price}</p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="text-gray-800">{pkg.attributes.duration}</p>
              </div>
            </div>
          </div>

          {/* Timestamps */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Created At</label>
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600">
                  {pkg.attributes.createdAt ? new Date(pkg.attributes.createdAt).toLocaleString() : 'N/A'}
                </p>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Updated At</label>
              <div className="p-3 bg-gray-50 rounded-md">
                <p className="text-sm text-gray-600">
                  {pkg.attributes.updatedAt ? new Date(pkg.attributes.updatedAt).toLocaleString() : 'N/A'}
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

export default ViewPackageModal;