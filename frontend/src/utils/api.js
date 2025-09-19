import axios from 'axios';
import { auth } from './firebase';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to requests
api.interceptors.request.use(
  async (config) => {
    const user = auth.currentUser;
    
    if (user) {
      const token = await user.getIdToken();
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Design API services
export const designService = {
  uploadImage: (formData) => {
    return api.post('/design/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  generateDesigns: (imageId, productType) => {
    return api.post('/design/generate', { imageId, productType });
  },
  getDesigns: () => {
    return api.get('/design');
  },
  getDesignById: (id) => {
    return api.get(`/design/${id}`);
  },
};

// Story API services
export const storyService = {
  generateStory: (formData) => {
    return api.post('/story/generate', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  generateCaptions: (storyId, platforms) => {
    return api.post('/story/captions', { storyId, platforms });
  },
  getStories: () => {
    return api.get('/story');
  },
  getStoryById: (id) => {
    return api.get(`/story/${id}`);
  },
};

// Profile API services
export const profileService = {
  getPublicProfile: (userId) => {
    return api.get(`/profile/${userId}`);
  },
  updatePublicProfile: (formData) => {
    return api.put('/profile', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  getProducts: (userId) => {
    return api.get(`/profile/${userId}/products`);
  },
  addProduct: (formData) => {
    return api.post('/profile/products', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  updateProduct: (productId, formData) => {
    return api.put(`/profile/products/${productId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  deleteProduct: (productId) => {
    return api.delete(`/profile/products/${productId}`);
  },
};

// Auth API services
export const authService = {
  getProfile: () => {
    return api.get('/auth/profile');
  },
  updateProfile: (data) => {
    return api.put('/auth/profile', data);
  },
};

export default api;