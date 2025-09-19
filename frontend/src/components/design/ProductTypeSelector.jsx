import React from 'react';

const productTypes = [
  { id: 'bag', name: 'Bag', description: 'Handbags, totes, and clutches' },
  { id: 'scarf', name: 'Scarf', description: 'Scarves and stoles' },
  { id: 'cushion', name: 'Cushion', description: 'Cushion covers and pillows' },
  { id: 'wallArt', name: 'Wall Art', description: 'Wall hangings and frames' },
  { id: 'clothing', name: 'Clothing', description: 'Apparel items like shirts and dresses' },
];

export default function ProductTypeSelector({ selectedType, onSelect, disabled }) {
  return (
    <div className="mt-2">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {productTypes.map((type) => (
          <div
            key={type.id}
            className={`relative rounded-lg border ${selectedType === type.id ? 'border-primary-500 bg-primary-50' : 'border-gray-300'} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary-400'} p-4`}
            onClick={() => !disabled && onSelect(type.id)}
          >
            <div className="flex items-start">
              <div className="flex-shrink-0">
                {/* Icon placeholder - replace with actual icons for each product type */}
                <div className="h-10 w-10 rounded-md bg-primary-500 flex items-center justify-center text-white">
                  {type.name.charAt(0)}
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">{type.name}</h3>
                <p className="mt-1 text-sm text-gray-500">{type.description}</p>
              </div>
            </div>
            {selectedType === type.id && (
              <div className="absolute top-2 right-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
      {disabled && (
        <p className="mt-2 text-sm text-gray-500">
          Please upload an image first to select a product type.
        </p>
      )}
    </div>
  );
}