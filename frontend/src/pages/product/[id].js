import { useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import { profileService } from '@/utils/api';
import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import { toast } from 'react-toastify';

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Fetch product data
  const { data: product, isLoading: productLoading } = useQuery(
    ['product', id],
    async () => {
      // In a real app, you would have a dedicated API endpoint for fetching a product by ID
      // For now, we'll simulate this by fetching all products from the artisan and finding the one we want
      const artisanId = router.query.artisanId;
      if (!artisanId) {
        // If we don't have an artisanId in the query params, we need to find it first
        // This would typically be handled by a dedicated API endpoint
        throw new Error('Artisan ID is required');
      }
      
      const products = await profileService.getProducts(artisanId);
      const product = products.find(p => p.id === id);
      
      if (!product) {
        throw new Error('Product not found');
      }
      
      return product;
    },
    {
      enabled: !!id && !!router.query.artisanId,
      onError: (error) => {
        console.error('Error fetching product:', error);
        toast.error('Failed to load product details');
      },
    }
  );

  // Fetch artisan profile
  const { data: artisan, isLoading: artisanLoading } = useQuery(
    ['artisan', router.query.artisanId],
    () => profileService.getPublicProfile(router.query.artisanId),
    {
      enabled: !!router.query.artisanId,
      onError: () => {
        toast.error('Failed to load artisan details');
      },
    }
  );

  const isLoading = productLoading || artisanLoading;

  if (isLoading) {
    return (
      <Layout title="Loading Product...">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse">
              <div className="flex flex-col lg:flex-row gap-8">
                <div className="lg:w-1/2">
                  <div className="bg-gray-200 rounded-lg h-96 w-full"></div>
                  <div className="mt-4 grid grid-cols-4 gap-2">
                    {[...Array(4)].map((_, index) => (
                      <div key={index} className="bg-gray-200 rounded-lg h-24"></div>
                    ))}
                  </div>
                </div>
                <div className="lg:w-1/2 space-y-6">
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-6 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-10 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!product || !artisan) {
    return (
      <Layout title="Product Not Found">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">Product Not Found</h1>
            <p className="mb-6">The product you're looking for doesn't exist or has been removed.</p>
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
      title={`${product.name} | ${artisan.displayName}`}
      description={product.description}
    >
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <Link
              href={`/artisan/${router.query.artisanId}`}
              className="text-primary-600 hover:text-primary-700 flex items-center"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 mr-1"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              Back to {artisan.displayName}'s Profile
            </Link>
          </div>

          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Product Images */}
                <div className="lg:w-1/2">
                  {product.imageUrls && product.imageUrls.length > 0 ? (
                    <>
                      <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200 mb-4">
                        <img
                          src={product.imageUrls[currentImageIndex]}
                          alt={product.name}
                          className="h-full w-full object-cover object-center"
                        />
                      </div>
                      {product.imageUrls.length > 1 && (
                        <div className="grid grid-cols-4 gap-2">
                          {product.imageUrls.map((url, index) => (
                            <div
                              key={index}
                              className={`aspect-w-1 aspect-h-1 overflow-hidden rounded-lg cursor-pointer ${index === currentImageIndex ? 'ring-2 ring-primary-500' : 'opacity-70 hover:opacity-100'}`}
                              onClick={() => setCurrentImageIndex(index)}
                            >
                              <img
                                src={url}
                                alt={`${product.name} - Image ${index + 1}`}
                                className="h-full w-full object-cover object-center"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200 flex items-center justify-center">
                      <svg
                        className="h-24 w-24 text-gray-400"
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
                </div>

                {/* Product Details */}
                <div className="lg:w-1/2">
                  <h1 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h1>
                  <p className="text-gray-500 text-sm mb-4">{product.category}</p>
                  <p className="text-2xl font-bold text-primary-600 mb-6">
                    ₹{product.price.toLocaleString()}
                  </p>

                  <div className="prose max-w-none mb-6">
                    <p className="text-gray-700">{product.description}</p>
                  </div>

                  <div className="space-y-4 mb-8">
                    {product.materials && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Materials</h3>
                        <p className="text-gray-600">{product.materials}</p>
                      </div>
                    )}

                    {product.dimensions && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Dimensions</h3>
                        <p className="text-gray-600">{product.dimensions}</p>
                      </div>
                    )}

                    {product.weight && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Weight</h3>
                        <p className="text-gray-600">{product.weight}</p>
                      </div>
                    )}

                    {product.careInstructions && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">Care Instructions</h3>
                        <p className="text-gray-600">{product.careInstructions}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col space-y-4">
                    <button className="btn-primary py-3 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                      Contact Artisan
                    </button>
                    <button className="btn-secondary py-3 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                          clipRule="evenodd"
                        />
                      </svg>
                      Save to Favorites
                    </button>
                  </div>
                </div>
              </div>

              {/* Artisan Information */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">About the Artisan</h2>
                <div className="flex items-center">
                  <div className="h-16 w-16 rounded-full overflow-hidden bg-gray-100 mr-4">
                    {artisan.profileImageUrl ? (
                      <img
                        src={artisan.profileImageUrl}
                        alt={artisan.displayName}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center bg-gray-200">
                        <svg
                          className="h-8 w-8 text-gray-400"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-md font-medium text-gray-900">{artisan.displayName}</h3>
                    {artisan.location && <p className="text-gray-600 text-sm">{artisan.location}</p>}
                    <Link
                      href={`/artisan/${router.query.artisanId}`}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium inline-flex items-center mt-1"
                    >
                      View Profile
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 ml-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L12.586 11H5a1 1 0 110-2h7.586l-2.293-2.293a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}