import React from 'react';
import { useRouter } from 'next/router';
import Image from 'next/image';
import { useQuery } from 'react-query';
import { toast } from 'react-toastify';
import Layout from '../../components/layout/Layout';
import { useAuth } from '../../utils/auth';
import { designService } from '../../utils/api';

export default function DesignDetail() {
  const router = useRouter();
  const { id } = router.query;
  const { user, loading } = useAuth();

  // Fetch design details
  const { data: design, isLoading, error } = useQuery(
    ['design', id],
    () => designService.getDesignById(id).then((res) => res.data),
    {
      enabled: !!id && !!user,
      onError: (error) => {
        console.error('Error fetching design:', error);
        toast.error('Failed to load design details. Please try again.');
      },
    }
  );

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/design');
    }
  }, [user, loading, router]);

  const handleBack = () => {
    router.push('/design');
  };

  if (loading || isLoading) {
    return (
      <Layout title="Design Details - Kalā-Yug">
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Error - Kalā-Yug">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-900">Error Loading Design</h1>
            <p className="mt-4 text-lg text-gray-500">We couldn't load the design details. Please try again.</p>
            <button
              onClick={handleBack}
              className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
            >
              Back to Designs
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  if (!design) {
    return (
      <Layout title="Design Not Found - Kalā-Yug">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-3xl font-extrabold text-gray-900">Design Not Found</h1>
            <p className="mt-4 text-lg text-gray-500">The design you're looking for doesn't exist or you don't have permission to view it.</p>
            <button
              onClick={handleBack}
              className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700"
            >
              Back to Designs
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title={`${design.productType} Design - Kalā-Yug`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={handleBack}
          className="mb-6 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="-ml-0.5 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Designs
        </button>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {design.productType} Design
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Created on {new Date(design.createdAt).toLocaleDateString()}
            </p>
          </div>

          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Original Design</h4>
                <div className="relative h-64 w-full rounded-lg overflow-hidden">
                  {design.originalImage && (
                    <Image
                      src={design.originalImage}
                      alt="Original design"
                      layout="fill"
                      objectFit="cover"
                    />
                  )}
                </div>
              </div>

              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Generated Designs</h4>
                <div className="grid grid-cols-2 gap-4">
                  {design.generatedImages && design.generatedImages.map((image, index) => (
                    <div key={index} className="relative h-48 w-full rounded-lg overflow-hidden">
                      <Image
                        src={image}
                        alt={`Generated design ${index + 1}`}
                        layout="fill"
                        objectFit="cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-opacity duration-300 flex items-center justify-center">
                        <a
                          href={image}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="opacity-0 hover:opacity-100 bg-white p-2 rounded-full"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <h4 className="text-md font-medium text-gray-900 mb-4">Product Information</h4>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Product Type</dt>
                <dd className="mt-1 text-sm text-gray-900">{design.productType}</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">Created At</dt>
                <dd className="mt-1 text-sm text-gray-900">{new Date(design.createdAt).toLocaleString()}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </Layout>
  );
}