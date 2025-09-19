import { useState } from 'react';
import { useRouter } from 'next/router';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { useAuth } from '@/utils/auth';
import { profileService } from '@/utils/api';
import Layout from '@/components/layout/Layout';
import { toast } from 'react-toastify';
import { useForm } from 'react-hook-form';

export default function Profile() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  // Redirect if not authenticated
  if (!loading && !user) {
    typeof window !== 'undefined' && router.push('/login');
    return null;
  }

  // Fetch profile data
  const { data: profile, isLoading } = useQuery(
    ['profile', user?.uid],
    () => profileService.getPublicProfile(user.uid),
    {
      enabled: !!user,
      onSuccess: (data) => {
        // Pre-fill form with existing data
        reset({
          displayName: data.displayName || user?.displayName || '',
          bio: data.bio || '',
          location: data.location || '',
          specialization: data.specialization || '',
          experience: data.experience || '',
          website: data.website || '',
        });
        if (data.profileImageUrl) {
          setProfileImagePreview(data.profileImageUrl);
        }
      },
      onError: () => {
        toast.error('Failed to load profile data');
      },
    }
  );

  // Update profile mutation
  const updateProfileMutation = useMutation(
    (formData) => profileService.updatePublicProfile(formData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['profile', user?.uid]);
        toast.success('Profile updated successfully');
        setIsEditing(false);
        setProfileImage(null);
      },
      onError: (error) => {
        console.error('Error updating profile:', error);
        toast.error('Failed to update profile');
      },
    }
  );

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data) => {
    const formData = new FormData();
    
    // Add profile image if selected
    if (profileImage) {
      formData.append('profileImage', profileImage);
    }
    
    // Add other form fields
    Object.keys(data).forEach((key) => {
      if (data[key]) {
        formData.append(key, data[key]);
      }
    });
    
    updateProfileMutation.mutate(formData);
  };

  if (loading || isLoading) {
    return (
      <Layout title="Profile">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="flex items-center space-x-4">
                <div className="rounded-full bg-gray-200 h-20 w-20"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Artisan Profile">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Artisan Profile</h1>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="btn-primary"
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              {isEditing ? (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6 mb-6">
                    <div className="relative">
                      <div className="h-32 w-32 rounded-full overflow-hidden bg-gray-100">
                        {profileImagePreview ? (
                          <img
                            src={profileImagePreview}
                            alt="Profile"
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
                      <label
                        htmlFor="profile-image"
                        className="absolute bottom-0 right-0 bg-primary-600 text-white rounded-full p-2 cursor-pointer hover:bg-primary-700 transition-colors"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-5 w-5"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </label>
                      <input
                        id="profile-image"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleProfileImageChange}
                      />
                    </div>
                    <div className="flex-1 space-y-4">
                      <div>
                        <label htmlFor="displayName" className="form-label">
                          Display Name
                        </label>
                        <input
                          id="displayName"
                          type="text"
                          className={`form-input ${errors.displayName ? 'border-red-500' : ''}`}
                          {...register('displayName', { required: 'Display name is required' })}
                        />
                        {errors.displayName && (
                          <p className="form-error">{errors.displayName.message}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="location" className="form-label">
                          Location
                        </label>
                        <input
                          id="location"
                          type="text"
                          className="form-input"
                          {...register('location')}
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="bio" className="form-label">
                      Bio
                    </label>
                    <textarea
                      id="bio"
                      rows="4"
                      className="form-input"
                      {...register('bio')}
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="specialization" className="form-label">
                        Specialization
                      </label>
                      <input
                        id="specialization"
                        type="text"
                        className="form-input"
                        placeholder="e.g., Handloom Weaving, Pottery"
                        {...register('specialization')}
                      />
                    </div>
                    <div>
                      <label htmlFor="experience" className="form-label">
                        Years of Experience
                      </label>
                      <input
                        id="experience"
                        type="text"
                        className="form-input"
                        placeholder="e.g., 10+ years"
                        {...register('experience')}
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="website" className="form-label">
                      Website or Social Media
                    </label>
                    <input
                      id="website"
                      type="text"
                      className="form-input"
                      placeholder="e.g., https://instagram.com/yourusername"
                      {...register('website')}
                    />
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        setProfileImage(null);
                        setProfileImagePreview(profile?.profileImageUrl || null);
                      }}
                      className="btn-secondary"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-primary"
                      disabled={updateProfileMutation.isLoading}
                    >
                      {updateProfileMutation.isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-6">
                  <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
                    <div className="h-32 w-32 rounded-full overflow-hidden bg-gray-100">
                      {profile?.profileImageUrl ? (
                        <img
                          src={profile.profileImageUrl}
                          alt={profile.displayName || user?.displayName}
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
                    <div className="flex-1">
                      <h2 className="text-xl font-bold text-gray-900">
                        {profile?.displayName || user?.displayName || 'Artisan'}
                      </h2>
                      {profile?.location && (
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
                      {profile?.specialization && (
                        <p className="text-gray-600 mt-1">
                          <span className="font-medium">Specialization:</span>{' '}
                          {profile.specialization}
                        </p>
                      )}
                      {profile?.experience && (
                        <p className="text-gray-600 mt-1">
                          <span className="font-medium">Experience:</span>{' '}
                          {profile.experience}
                        </p>
                      )}
                      {profile?.website && (
                        <p className="text-gray-600 mt-1">
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
                            Website
                          </a>
                        </p>
                      )}
                    </div>
                  </div>

                  {profile?.bio && (
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">About</h3>
                      <p className="text-gray-700">{profile.bio}</p>
                    </div>
                  )}

                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">My Products</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="border border-dashed border-gray-300 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-12 w-12 text-gray-400 mb-2"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                          />
                        </svg>
                        <p className="text-gray-600 font-medium">Add New Product</p>
                        <p className="text-gray-500 text-sm mt-1">
                          Showcase your handcrafted items
                        </p>
                      </div>
                    </div>
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