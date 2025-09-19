import React from 'react';
import Link from 'next/link';

export default function StoryList({ stories, isLoading }) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {[...Array(2)].map((_, index) => (
          <div key={index} className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <div className="h-4 bg-gray-200 rounded w-1/4 mb-4 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!stories || stories.length === 0) {
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
        <h3 className="mt-2 text-sm font-medium text-gray-900">No stories yet</h3>
        <p className="mt-1 text-sm text-gray-500">
          Use the form above to generate your first product story.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {stories.map((story) => (
        <div key={story.id} className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <div className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {story.craftType} from {story.region}
                </h3>
                <p className="text-sm text-gray-500">
                  Created on {new Date(story.createdAt).toLocaleDateString()}
                </p>
              </div>
              <Link href={`/story/${story.id}`} className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                View Details
              </Link>
            </div>

            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Product Description</h4>
              <p className="text-sm text-gray-600 line-clamp-3">{story.description}</p>
            </div>

            {story.platformCaptions && Object.keys(story.platformCaptions).length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Social Media Captions</h4>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {Object.entries(story.platformCaptions).slice(0, 2).map(([platform, caption]) => (
                    <div key={platform} className="bg-gray-50 p-3 rounded-md">
                      <p className="text-xs font-medium text-gray-500 uppercase mb-1">{platform}</p>
                      <p className="text-sm text-gray-600 line-clamp-2">{caption}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {story.hashtags && story.hashtags.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">Hashtags</h4>
                <div className="flex flex-wrap gap-2">
                  {story.hashtags.slice(0, 5).map((hashtag, index) => (
                    <span key={index} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                      {hashtag}
                    </span>
                  ))}
                  {story.hashtags.length > 5 && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      +{story.hashtags.length - 5} more
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}