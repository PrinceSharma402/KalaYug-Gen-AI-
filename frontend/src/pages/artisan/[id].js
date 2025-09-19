import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import { profileService } from '@/utils/api';
import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import { toast } from 'react-toastify';

export default function ArtisanProfile() {
  const router = useRouter();
  const { id } = router.query;

  // Fetch artisan profile
  const { data: profile, isLoading: profileLoading } = useQuery(
    ['publicProfile', id],
    () => profileService.getPublicProfile(id),
    {
      enabled: !!id,
      onError: () => {
        toast.error('Failed to load artisan profile');
      },
    }
  );

  // Fetch artisan products
  const { data: products, isLoading: productsLoading } = useQuery(
    ['artisanProducts', id],
    () => profileService.getProducts(id),
    {
      enabled: !!id,
      onError: () => {
        toast.error('Failed to load artisan products');
      },
    }
  );

  const isLoading = profileLoading || productsLoading;

  if (isLoading) {
    return (
      <Layout title="Artisan Profile">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="rounded-full bg-gray-200 h-32 w-32"></div>
                <div className="space-y-3 flex-1">
                  <div className="h-8 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-full"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/4 mt-6"></div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(3)].map((_, index) => (
                  <div key={index} className="bg-white rounded-lg shadow overflow-hidden">
                    <div className="h-48 bg-gray-200"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                      <div className="h-4 bg-gray-200 rounded w-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!profile) {
    return (
      <Layout title="Artisan Not Found">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Artisan Not Found</h1>
            <p className="mb-6">The artisan profile you're looking for doesn't exist or has been removed.</p>
            <Link href="/" className="btn-primary">
              Back to Home
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout
      title={`${profile.displayName || 'Artisan'} | Artisan Profile`}
      description={`Discover handcrafted products by ${profile.displayName || 'Artisan'} from ${profile.location || 'India'}`}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Artisan Profile Header */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
            <div className="p-6">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="h-32 w-32 rounded-full overflow-hidden bg-gray-100">
                  {profile.profileImageUrl ? (
                    <img
                      src={profile.profileImageUrl}
                      alt={profile.displayName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gray-200">
                      <svg
                        className="h-16 w-16 text-gray-400"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-2xl font-bold text-gray-900">{profile.displayName}</h1>
                  {profile.location && (
                    <p className="text-gray-600 mt-1">
                      <span className="inline-flex items-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        {profile.location}
                      </span>
                    </p>
                  )}
                  <div className="mt-2 space-y-1">
                    {profile.specialization && (
                      <p className="text-gray-600">
                        <span className="font-medium">Specialization:</span>{' '}
                        {profile.specialization}
                      </p>
                    )}
                    {profile.experience && (
                      <p className="text-gray-600">
                        <span className="font-medium">Experience:</span>{' '}
                        {profile.experience}
                      </p>
                    )}
                  </div>
                  {profile.website && (
                    <p className="mt-3">
                      <a
                        href={profile.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 inline-flex items-center"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-1"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                          />
                        </svg>
                        Visit Website
                      </a>
                    </p>
                  )}
                </div>
              </div>

              {profile.bio && (
                <div className="mt-6">
                  <h2 className="text-lg font-semibold text-gray-800 mb-2">About the Artisan</h2>
                  <p className="text-gray-700">{profile.bio}</p>
                </div>
              )}
            </div>
          </div>

          {/* Products Section */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Handcrafted Products</h2>

            {!products || products.length === 0 ? (
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
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No products yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  This artisan hasn't added any products yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
                  <div
                    key={product.id}
                    className="bg-white rounded-lg shadow overflow-hidden hover:shadow-lg transition-shadow duration-300"
                  >
                    {product.imageUrls && product.imageUrls.length > 0 ? (
                      <div className="h-48 overflow-hidden">
                        <img
                          src={product.imageUrls[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-48 bg-gray-200 flex items-center justify-center">
                        <svg
                          className="h-12 w-12 text-gray-400"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}
                    <div className="p-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-1">{product.name}</h3>
                      <p className="text-gray-500 text-sm mb-2">{product.category}</p>
                      <p className="text-primary-600 font-medium mb-3">
                        ₹{product.price.toLocaleString()}
                      </p>
                      <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                        {product.description}
                      </p>
                      <button className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                        Contact Artisan
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}