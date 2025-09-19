import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery } from 'react-query';
import { toast } from 'react-toastify';
import Layout from '../../components/layout/Layout';
import { useAuth } from '../../utils/auth';
import { storyService } from '../../utils/api';
import StoryForm from '../../components/story/StoryForm';
import StoryList from '../../components/story/StoryList';

export default function StoryGenerator() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch user's stories
  const { data: stories, isLoading, refetch } = useQuery(
    'stories',
    () => storyService.getStories().then((res) => res.data),
    {
      enabled: !!user,
      onError: (error) => {
        console.error('Error fetching stories:', error);
        toast.error('Failed to load stories. Please try again.');
      },
    }
  );

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/story');
    }
  }, [user, loading, router]);

  const handleGenerateStory = async (formData) => {
    setIsGenerating(true);
    try {
      await storyService.generateStory(formData);
      toast.success('Story generated successfully!');
      refetch(); // Refresh the stories list
    } catch (error) {
      console.error('Error generating story:', error);
      toast.error(error.response?.data?.message || 'Failed to generate story. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  if (loading) {
    return (
      <Layout title="AI Storyteller - Kalā-Yug">
        <div className="flex justify-center items-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="AI Storyteller - Kalā-Yug">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            AI Storyteller
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-xl text-gray-500 sm:mt-4">
            Create compelling product stories and social media content
          </p>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg leading-6 font-medium text-gray-900 mb-4">
              Create a New Story
            </h2>
            <StoryForm onSubmit={handleGenerateStory} isGenerating={isGenerating} />
          </div>
        </div>

        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Stories</h2>
          <StoryList stories={stories || []} isLoading={isLoading} />
        </div>
      </div>
    </Layout>
  );
}