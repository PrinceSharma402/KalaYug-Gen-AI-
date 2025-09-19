import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import { toast } from 'react-toastify';
import Layout from '../../components/layout/Layout';
import { useAuth } from '../../utils/auth';
import { designService } from '../../utils/api';
import DesignUploader from '../../components/design/DesignUploader';
import DesignGallery from '../../components/design/DesignGallery';
import ProductTypeSelector from '../../components/design/ProductTypeSelector';

export default function DesignAssistant() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadedImageId, setUploadedImageId] = useState(null);
  const [selectedProductType, setSelectedProductType] = useState('');

  // Fetch user's designs
  const { data: designs, isLoading, refetch } = useQuery(
    'designs',
    () => designService.getDesigns().then((res) => res.data),
    {
      enabled: !!user,
      onError: (error) => {
        console.error('Error fetching designs:', error);
        toast.error('Failed to load designs. Please try again.');
      },
    }
  );

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/design');
    }
  }, [user, loading, router]);

  const handleImageUpload = async (imageId) => {
    setUploadedImageId(imageId);
    toast.success('Image uploaded successfully! Now select a product type to generate designs.');
  };

  const handleProductTypeSelect = (productType) => {
    setSelectedProductType(productType);
  };

  const handleGenerateDesigns = async () => {
    if (!uploadedImageId) {
      toast.error('Please upload an image first.');
      return;
    }

    if (!selectedProductType) {
      toast.error('Please select a product type.');
      return;
    }

    setIsGenerating(true);
    try {
      await designService.generateDesigns(uploadedImageId, selectedProductType);
      toast.success('Designs generated successfully!');
      refetch(); // Refresh the designs list
      setUploadedImageId(null);
      setSelectedProductType('');
    } catch (error) {
      console.error('Error generating designs:', error);
      toast.error(error.response?.data?.message || 'Failed to generate designs. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Design Assistant - Kalā-Yug">
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Design Assistant - Kalā-Yug">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Generative Design Assistant
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Transform your traditional designs into modern product mockups
          </p>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Step 1: Upload your design or motif
            </h2>
            <DesignUploader onUploadSuccess={handleImageUpload} />

            <h2 className="text-lg leading-6 font-medium text-gray-900 mt-8 mb-4">
              Step 2: Select product type
            </h2>
            <ProductTypeSelector 
              selectedType={selectedProductType} 
              onSelect={handleProductTypeSelect} 
              disabled={!uploadedImageId}
            />

            <div className="mt-8">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                onClick={handleGenerateDesigns}
                disabled={!uploadedImageId || !selectedProductType || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating Designs...
                  </>
                ) : (
                  'Generate Designs'
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Designs</h2>
          <DesignGallery designs={designs || []} isLoading={isLoading} />
        </div>
      </div>
    </Layout>
  );
}