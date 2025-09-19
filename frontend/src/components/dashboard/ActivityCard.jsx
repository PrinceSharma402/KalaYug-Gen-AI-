import React from 'react';
import Link from 'next/link';

export default function ActivityCard({ title, count, icon, linkText, linkHref, bgColor, textColor }) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center">
        <div className={`p-3 rounded-full ${bgColor} ${textColor} mr-4`}>
          {icon}
        </div>
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900">
            {count}
          </h3>
        </div>
      </div>
      {linkText && linkHref && (
        <div className="mt-4 text-right">
          <Link 
            href={linkHref} 
            className="text-sm font-medium text-primary-600 hover:text-primary-700"
          >
            {linkText}
          </Link>
        </div>
      )}
    </div>
  );
}