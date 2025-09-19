import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import { useAuth } from '@/utils/auth';
import { storyService } from '@/utils/api';
import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import { toast } from 'react-toastify';

export default function StoryDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { user, loading } = useAuth();

  // Redirect if not authenticated
  if (!loading && !user) {
    typeof window !== 'undefined' && router.push('/login');
    return null;
  }

  const { data: story, isLoading, error } = useQuery(
    ['story', id],
    () => storyService.getStoryById(id),
    {
      enabled: !!id && !!user,
      onError: (err) => {
        console.error('Error fetching story:', err);
        toast.error('Failed to load story details');
      },
    }
  );

  if (loading || isLoading) {
    return (
      <Layout title="Loading Story...">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
              <div className="h-6 bg-gray-200 rounded w-1/4 mt-6"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-24 bg-gray-200 rounded"></div>
                <div className="h-24 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Error">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Story</h1>
            <p className="mb-6">We couldn't load the story details. Please try again later.</p>
            <Link href="/story" className="btn-primary">
              Back to Stories
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  if (!story) {
    return (
      <Layout title="Story Not Found">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Story Not Found</h1>
            <p className="mb-6">The story you're looking for doesn't exist or has been removed.</p>
            <Link href="/story" className="btn-primary">
              Back to Stories
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`${story.craftType} from ${story.region} | Story`}>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link href="/story" className="text-primary-600 hover:text-primary-700 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Back to Stories
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                {story.craftType} from {story.region}
              </h1>
              <p className="text-sm text-gray-500 mb-6">
                Created on {new Date(story.createdAt).toLocaleDateString()}
              </p>

              <div className="mb-8">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">Product Description</h2>
                <div className="prose max-w-none">
                  <p className="text-gray-700">{story.description}</p>
                </div>
              </div>

              {story.captions && (
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-gray-800 mb-3">Social Media Caption</h2>
                  <div className="bg-gray-50 p-4 rounded-md">
                    <p className="text-gray-700">{story.captions}</p>
                  </div>
                </div>
              )}

              {story.platformCaptions && Object.keys(story.platformCaptions).length > 0 && (
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-gray-800 mb-3">Platform-Specific Captions</h2>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {Object.entries(story.platformCaptions).map(([platform, caption]) => (
                      <div key={platform} className="bg-gray-50 p-4 rounded-md">
                        <h3 className="text-sm font-medium text-gray-500 uppercase mb-2">{platform}</h3>
                        <p className="text-gray-700">{caption}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {story.hashtags && story.hashtags.length > 0 && (
                <div>
                  <h2 className="text-lg font-semibold text-gray-800 mb-3">Hashtags</h2>
                  <div className="flex flex-wrap gap-2">
                    {story.hashtags.map((hashtag, index) => (
                      <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                        {hashtag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}