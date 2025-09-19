import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import { useAuth } from '@/utils/auth';
import { designService, storyService, profileService } from '@/utils/api';
import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import ActivityCard from '@/components/dashboard/ActivityCard';
import RecentItemsCard from '@/components/dashboard/RecentItemsCard';
import WelcomeMessage from '@/components/dashboard/WelcomeMessage';

export default function Dashboard() {
  const router = useRouter();
  const { user, loading } = useAuth();

  // Redirect if not authenticated
  if (!loading && !user) {
    typeof window !== 'undefined' && router.push('/login');
    return null;
  }

  // Fetch user's designs
  const { data: designs, isLoading: designsLoading } = useQuery(
    ['designs', user?.uid],
    () => designService.getDesigns(),
    {
      enabled: !!user,
      staleTime: 60000, // 1 minute
    }
  );

  // Fetch user's stories
  const { data: stories, isLoading: storiesLoading } = useQuery(
    ['stories', user?.uid],
    () => storyService.getStories(),
    {
      enabled: !!user,
      staleTime: 60000, // 1 minute
    }
  );

  // Fetch user's products
  const { data: products, isLoading: productsLoading } = useQuery(
    ['products', user?.uid],
    () => profileService.getProducts(user.uid),
    {
      enabled: !!user,
      staleTime: 60000, // 1 minute
    }
  );

  const isLoading = loading || designsLoading || storiesLoading || productsLoading;

  return (
    <Layout title="Dashboard">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {!isLoading && user && <WelcomeMessage user={user} />}

          {isLoading ? (
            <div className="animate-pulse space-y-8">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md p-6">
                  <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[...Array(3)].map((_, idx) => (
                      <div key={idx} className="h-32 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <ActivityCard 
                  title="Total Designs"
                  count={designs?.length || 0}
                  bgColor="bg-primary-100"
                  textColor="text-primary-800"
                  linkText="Create Design"
                  linkHref="/design"
                  icon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
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
                  }
                />

                <ActivityCard 
                  title="Total Stories"
                  count={stories?.length || 0}
                  bgColor="bg-indigo-100"
                  textColor="text-indigo-800"
                  linkText="Create Story"
                  linkHref="/story"
                  icon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                  }
                />

                <ActivityCard 
                  title="Total Products"
                  count={products?.length || 0}
                  bgColor="bg-green-100"
                  textColor="text-green-800"
                  linkText="Manage Products"
                  linkHref="/profile/products"
                  icon={
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                      />
                    </svg>
                  }
                />
              </div>

              {/* Recent Designs */}
              <RecentItemsCard
                title="Recent Designs"
                items={designs}
                viewAllLink="/design"
                emptyMessage="No designs created yet"
                createLink="/design"
                gridLayout="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                renderItem={(design) => (
                  <Link
                    key={design.id}
                    href={`/design/${design.id}`}
                    className="block group"
                  >
                    <div className="bg-gray-100 rounded-lg overflow-hidden aspect-w-1 aspect-h-1">
                      {design.generatedImageUrls && design.generatedImageUrls.length > 0 ? (
                        <img
                          src={design.generatedImageUrls[0]}
                          alt={`Generated ${design.productType} design`}
                          className="w-full h-full object-cover group-hover:opacity-90 transition-opacity"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
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
                    </div>
                    <p className="mt-2 text-sm font-medium text-gray-900 truncate">
                      {design.productType} Design
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(design.createdAt).toLocaleDateString()}
                    </p>
                  </Link>
                )}
              />

              {/* Recent Stories */}
              <RecentItemsCard
                title="Recent Stories"
                items={stories}
                viewAllLink="/story"
                emptyMessage="No stories created yet"
                createLink="/story"
                renderItem={(story) => (
                  <Link
                    key={story.id}
                    href={`/story/${story.id}`}
                    className="block bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-md font-medium text-gray-900">
                          {story.craftType} from {story.region}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Created on {new Date(story.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <span className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                        View
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">
                      {story.description}
                    </p>
                  </Link>
                )}
              />

              {/* Recent Products */}
              <RecentItemsCard
                title="Recent Products"
                items={products}
                viewAllLink="/profile/products"
                emptyMessage="No products added yet"
                createLink="/profile/products"
                gridLayout="grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                renderItem={(product) => (
                  <div
                    key={product.id}
                    className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                  >
                    {product.imageUrls && product.imageUrls.length > 0 ? (
                      <div className="h-40 overflow-hidden">
                        <img
                          src={product.imageUrls[0]}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="h-40 bg-gray-200 flex items-center justify-center">
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
                      <h3 className="text-md font-medium text-gray-900 mb-1">
                        {product.name}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">{product.category}</p>
                      <p className="text-primary-600 font-medium">
                        ₹{product.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                )}
              />
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}