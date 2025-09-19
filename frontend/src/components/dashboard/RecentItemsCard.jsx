import React from 'react';
import Link from 'next/link';

export default function RecentItemsCard({ 
  title, 
  items, 
  viewAllLink, 
  emptyMessage, 
  createLink, 
  renderItem,
  gridLayout = "grid-cols-1 gap-4", // Default grid layout
  itemLimit = 3 // Default number of items to show
}) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        {viewAllLink && (
          <Link href={viewAllLink} className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View All
          </Link>
        )}
      </div>

      {!items || items.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">{emptyMessage}</p>
          {createLink && (
            <Link href={createLink} className="mt-2 inline-block text-primary-600 hover:text-primary-700">
              Create your first {title.toLowerCase()}
            </Link>
          )}
        </div>
      ) : (
        <div className={`grid ${gridLayout}`}>
          {items.slice(0, itemLimit).map((item) => renderItem(item))}
        </div>
      )}
    </div>
  );
}