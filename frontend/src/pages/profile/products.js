import { useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '@/utils/auth';
import { profileService } from '@/utils/api';
import Layout from '@/components/layout/Layout';
import Link from 'next/link';
import { toast } from 'react-toastify';
import ProductForm from '@/components/profile/ProductForm';

export default function Products() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();
  const [isAddingProduct, setIsAddingProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Redirect if not authenticated
  if (!loading && !user) {
    typeof window !== 'undefined' && router.push('/login');
    return null;
  }

  // Fetch products
  const { data: products, isLoading } = useQuery(
    ['products', user?.uid],
    () => profileService.getProducts(user.uid),
    {
      enabled: !!user,
      onError: () => {
        toast.error('Failed to load products');
      },
    }
  );

  // Add product mutation
  const addProductMutation = useMutation(
    (formData) => profileService.addProduct(formData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['products', user?.uid]);
        toast.success('Product added successfully');
        setIsAddingProduct(false);
      },
      onError: (error) => {
        console.error('Error adding product:', error);
        toast.error('Failed to add product');
      },
    }
  );

  // Update product mutation
  const updateProductMutation = useMutation(
    ({ productId, formData }) => profileService.updateProduct(productId, formData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['products', user?.uid]);
        toast.success('Product updated successfully');
        setEditingProduct(null);
      },
      onError: (error) => {
        console.error('Error updating product:', error);
        toast.error('Failed to update product');
      },
    }
  );

  // Delete product mutation
  const deleteProductMutation = useMutation(
    (productId) => profileService.deleteProduct(productId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['products', user?.uid]);
        toast.success('Product deleted successfully');
      },
      onError: (error) => {
        console.error('Error deleting product:', error);
        toast.error('Failed to delete product');
      },
    }
  );

  const handleAddProduct = (data, images) => {
    const formData = new FormData();
    
    // Add form fields
    Object.keys(data).forEach((key) => {
      if (data[key]) {
        formData.append(key, data[key]);
      }
    });
    
    // Add images
    if (images && images.length > 0) {
      images.forEach((image) => {
        formData.append('productImages', image);
      });
    }
    
    addProductMutation.mutate(formData);
  };

  const handleUpdateProduct = (productId, data, newImages, removedImageUrls) => {
    const formData = new FormData();
    
    // Add form fields
    Object.keys(data).forEach((key) => {
      if (data[key]) {
        formData.append(key, data[key]);
      }
    });
    
    // Add new images
    if (newImages && newImages.length > 0) {
      newImages.forEach((image) => {
        formData.append('productImages', image);
      });
    }
    
    // Add removed image URLs
    if (removedImageUrls && removedImageUrls.length > 0) {
      formData.append('removedImageUrls', JSON.stringify(removedImageUrls));
    }
    
    updateProductMutation.mutate({ productId, formData });
  };

  const handleDeleteProduct = (productId) => {
    if (window.confirm('Are you sure you want to delete this product?')) {
      deleteProductMutation.mutate(productId);
    }
  };

  if (loading || isLoading) {
    return (
      <Layout title="My Products">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/4"></div>
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

  return (
    <Layout title="My Products">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">My Products</h1>
              <p className="text-gray-600">Manage your handcrafted products</p>
            </div>
            <div className="flex space-x-4">
              <Link href="/profile" className="btn-secondary">
                Back to Profile
              </Link>
              {!isAddingProduct && !editingProduct && (
                <button
                  onClick={() => setIsAddingProduct(true)}
                  className="btn-primary"
                >
                  Add New Product
                </button>
              )}
            </div>
          </div>

          {isAddingProduct && (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Add New Product</h2>
                  <button
                    onClick={() => setIsAddingProduct(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <ProductForm
                  onSubmit={handleAddProduct}
                  isSubmitting={addProductMutation.isLoading}
                />
              </div>
            </div>
          )}

          {editingProduct && (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden mb-8">
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">Edit Product</h2>
                  <button
                    onClick={() => setEditingProduct(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <ProductForm
                  product={editingProduct}
                  onSubmit={(data, newImages, removedImageUrls) =>
                    handleUpdateProduct(editingProduct.id, data, newImages, removedImageUrls)
                  }
                  isSubmitting={updateProductMutation.isLoading}
                />
              </div>
            </div>
          )}

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
              <h3 className="mt-2 text-sm font-medium text-gray-900">No products</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by adding your first product.
              </p>
              {!isAddingProduct && (
                <div className="mt-6">
                  <button
                    onClick={() => setIsAddingProduct(true)}
                    className="btn-primary"
                  >
                    Add New Product
                  </button>
                </div>
              )}
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
                    <div className="flex justify-between">
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteProduct(product.id)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium"
                        disabled={deleteProductMutation.isLoading}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}