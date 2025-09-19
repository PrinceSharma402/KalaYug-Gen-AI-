import React, { useState } from 'react';
import { useForm } from 'react-hook-form';

export default function StoryForm({ onSubmit, isGenerating }) {
  const [inputType, setInputType] = useState('text');
  const [audioFile, setAudioFile] = useState(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const handleFormSubmit = (data) => {
    const formData = new FormData();
    
    if (inputType === 'text') {
      formData.append('text', data.storyText);
      formData.append('inputType', 'text');
    } else {
      formData.append('audio', audioFile);
      formData.append('inputType', 'audio');
    }
    
    formData.append('craftType', data.craftType);
    formData.append('region', data.region);
    formData.append('platforms', JSON.stringify(data.platforms || ['instagram', 'facebook']));
    
    onSubmit(formData);
    reset();
    setAudioFile(null);
  };

  const handleAudioChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAudioFile(e.target.files[0]);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div>
        <div className="flex items-center space-x-4 mb-4">
          <div className="flex items-center">
            <input
              id="text-input"
              name="inputType"
              type="radio"
              checked={inputType === 'text'}
              onChange={() => setInputType('text')}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
            />
            <label htmlFor="text-input" className="ml-2 block text-sm text-gray-700">
              Text Input
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="audio-input"
              name="inputType"
              type="radio"
              checked={inputType === 'audio'}
              onChange={() => setInputType('audio')}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
            />
            <label htmlFor="audio-input" className="ml-2 block text-sm text-gray-700">
              Audio Input
            </label>
          </div>
        </div>

        {inputType === 'text' ? (
          <div>
            <label htmlFor="storyText" className="form-label">
              Tell us about your craft and product
            </label>
            <div className="mt-1">
              <textarea
                id="storyText"
                rows={5}
                className="form-input"
                placeholder="Describe your craft, its history, materials used, techniques, and what makes it special..."
                {...register('storyText', {
                  required: 'Please provide some text about your craft',
                  minLength: {
                    value: 50,
                    message: 'Please provide at least 50 characters',
                  },
                })}
              />
              {errors.storyText && <p className="form-error">{errors.storyText.message}</p>}
            </div>
          </div>
        ) : (
          <div>
            <label htmlFor="audioFile" className="form-label">
              Upload an audio recording about your craft
            </label>
            <div className="mt-1">
              <input
                id="audioFile"
                type="file"
                accept="audio/*"
                onChange={handleAudioChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-medium
                  file:bg-primary-50 file:text-primary-700
                  hover:file:bg-primary-100"
                required={inputType === 'audio'}
              />
              <p className="mt-1 text-sm text-gray-500">
                Record yourself talking about your craft, its history, and what makes it special (max 5 minutes)
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="craftType" className="form-label">
            Type of Craft
          </label>
          <div className="mt-1">
            <select
              id="craftType"
              className="form-input"
              {...register('craftType', {
                required: 'Please select a craft type',
              })}
            >
              <option value="">Select a craft type</option>
              <option value="textile">Textile (Weaving, Embroidery, etc.)</option>
              <option value="pottery">Pottery & Ceramics</option>
              <option value="woodwork">Woodwork</option>
              <option value="metalwork">Metalwork</option>
              <option value="painting">Painting & Art</option>
              <option value="jewelry">Jewelry Making</option>
              <option value="leatherwork">Leatherwork</option>
              <option value="other">Other</option>
            </select>
            {errors.craftType && <p className="form-error">{errors.craftType.message}</p>}
          </div>
        </div>

        <div>
          <label htmlFor="region" className="form-label">
            Region/State
          </label>
          <div className="mt-1">
            <select
              id="region"
              className="form-input"
              {...register('region', {
                required: 'Please select a region',
              })}
            >
              <option value="">Select a region</option>
              <option value="Andhra Pradesh">Andhra Pradesh</option>
              <option value="Assam">Assam</option>
              <option value="Bihar">Bihar</option>
              <option value="Gujarat">Gujarat</option>
              <option value="Karnataka">Karnataka</option>
              <option value="Kashmir">Kashmir</option>
              <option value="Kerala">Kerala</option>
              <option value="Madhya Pradesh">Madhya Pradesh</option>
              <option value="Maharashtra">Maharashtra</option>
              <option value="Odisha">Odisha</option>
              <option value="Punjab">Punjab</option>
              <option value="Rajasthan">Rajasthan</option>
              <option value="Tamil Nadu">Tamil Nadu</option>
              <option value="Uttar Pradesh">Uttar Pradesh</option>
              <option value="West Bengal">West Bengal</option>
              <option value="Other">Other</option>
            </select>
            {errors.region && <p className="form-error">{errors.region.message}</p>}
          </div>
        </div>
      </div>

      <div>
        <label className="form-label">Social Media Platforms</label>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <div className="flex items-center">
            <input
              id="instagram"
              type="checkbox"
              value="instagram"
              defaultChecked
              {...register('platforms')}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="instagram" className="ml-2 block text-sm text-gray-700">
              Instagram
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="facebook"
              type="checkbox"
              value="facebook"
              defaultChecked
              {...register('platforms')}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="facebook" className="ml-2 block text-sm text-gray-700">
              Facebook
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="twitter"
              type="checkbox"
              value="twitter"
              {...register('platforms')}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="twitter" className="ml-2 block text-sm text-gray-700">
              Twitter
            </label>
          </div>
          <div className="flex items-center">
            <input
              id="pinterest"
              type="checkbox"
              value="pinterest"
              {...register('platforms')}
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label htmlFor="pinterest" className="ml-2 block text-sm text-gray-700">
              Pinterest
            </label>
          </div>
        </div>
      </div>

      <div>
        <button
          type="submit"
          className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          disabled={isGenerating}
        >
          {isGenerating ? (
            <>
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Generating Story...
            </>
          ) : (
            'Generate Story'
          )}
        </button>
      </div>
    </form>
  );
}