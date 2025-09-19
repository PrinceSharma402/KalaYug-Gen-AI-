import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function DesignGallery({ designs, isLoading }) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(3)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="h-48 w-full bg-gray-200 animate-pulse"></div>
            <div className="p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!designs || designs.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No designs yet</h3>
        <p className="mt-1 text-sm text-gray-500">
          Upload an image and select a product type to generate designs.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {designs.map((design) => (
        <div key={design.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <Link href={`/design/${design.id}`}>
            <div className="relative h-48 w-full">
              {design.originalImage && (
                <Image
                  src={design.originalImage}
                  alt="Original design"
                  layout="fill"
                  objectFit="cover"
                  className="absolute inset-0"
                />
              )}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                <span className="text-xs font-medium text-white bg-primary-600 px-2 py-1 rounded">
                  {design.productType}
                </span>
              </div>
            </div>
          </Link>
          <div className="p-4">
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-500">
                {new Date(design.createdAt).toLocaleDateString()}
              </p>
              <Link href={`/design/${design.id}`} className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                View Details
              </Link>
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2">
              {design.generatedImages && design.generatedImages.slice(0, 3).map((image, index) => (
                <div key={index} className="relative h-16 w-full rounded overflow-hidden">
                  <Image
                    src={image}
                    alt={`Generated design ${index + 1}`}
                    layout="fill"
                    objectFit="cover"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}