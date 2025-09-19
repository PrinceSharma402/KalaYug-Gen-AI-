import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useDropzone } from 'react-dropzone';

export default function ProductForm({ product, onSubmit, isSubmitting }) {
  const [productImages, setProductImages] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [removedImageUrls, setRemovedImageUrls] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: product?.name || '',
      description: product?.description || '',
      price: product?.price || '',
      category: product?.category || '',
      materials: product?.materials || '',
      dimensions: product?.dimensions || '',
      weight: product?.weight || '',
      careInstructions: product?.careInstructions || '',
    },
  });

  useEffect(() => {
    // Initialize existing product images if editing
    if (product?.imageUrls && product.imageUrls.length > 0) {
      setProductImages(product.imageUrls);
      setPreviewUrls(product.imageUrls);
    }
  }, [product]);

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
    onDrop: (acceptedFiles) => {
      const newFiles = acceptedFiles.map((file) =>
        Object.assign(file, {
          preview: URL.createObjectURL(file),
        })
      );

      setImageFiles((prevFiles) => [...prevFiles, ...newFiles]);
      setPreviewUrls((prevUrls) => [
        ...prevUrls,
        ...newFiles.map((file) => file.preview),
      ]);
    },
  });

  const removeImage = (index) => {
    // If it's an existing image URL
    if (index < productImages.length) {
      const removedUrl = productImages[index];
      setRemovedImageUrls((prev) => [...prev, removedUrl]);
      setProductImages((prev) => prev.filter((_, i) => i !== index));
    } 
    // If it's a new image file
    else {
      const fileIndex = index - productImages.length;
      setImageFiles((prev) => prev.filter((_, i) => i !== fileIndex));
    }

    setPreviewUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const onFormSubmit = (data) => {
    onSubmit(data, imageFiles, removedImageUrls);
  };

  return (
    <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="name" className="form-label">
            Product Name *
          </label>
          <input
            id="name"
            type="text"
            className={`form-input ${errors.name ? 'border-red-500' : ''}`}
            {...register('name', { required: 'Product name is required' })}
          />
          {errors.name && <p className="form-error">{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="category" className="form-label">
            Category *
          </label>
          <select
            id="category"
            className={`form-input ${errors.category ? 'border-red-500' : ''}`}
            {...register('category', { required: 'Category is required' })}
          >
            <option value="">Select a category</option>
            <option value="Textiles">Textiles</option>
            <option value="Pottery">Pottery</option>
            <option value="Jewelry">Jewelry</option>
            <option value="Woodwork">Woodwork</option>
            <option value="Metalwork">Metalwork</option>
            <option value="Painting">Painting</option>
            <option value="Sculpture">Sculpture</option>
            <option value="Clothing">Clothing</option>
            <option value="Home Decor">Home Decor</option>
            <option value="Other">Other</option>
          </select>
          {errors.category && <p className="form-error">{errors.category.message}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="description" className="form-label">
          Description *
        </label>
        <textarea
          id="description"
          rows="4"
          className={`form-input ${errors.description ? 'border-red-500' : ''}`}
          {...register('description', { required: 'Description is required' })}
        ></textarea>
        {errors.description && <p className="form-error">{errors.description.message}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="price" className="form-label">
            Price (₹) *
          </label>
          <input
            id="price"
            type="number"
            min="0"
            step="0.01"
            className={`form-input ${errors.price ? 'border-red-500' : ''}`}
            {...register('price', {
              required: 'Price is required',
              min: { value: 0, message: 'Price must be positive' },
            })}
          />
          {errors.price && <p className="form-error">{errors.price.message}</p>}
        </div>

        <div>
          <label htmlFor="materials" className="form-label">
            Materials
          </label>
          <input
            id="materials"
            type="text"
            className="form-input"
            placeholder="e.g., Cotton, Silk, Wood"
            {...register('materials')}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label htmlFor="dimensions" className="form-label">
            Dimensions
          </label>
          <input
            id="dimensions"
            type="text"
            className="form-input"
            placeholder="e.g., 10 x 15 cm"
            {...register('dimensions')}
          />
        </div>

        <div>
          <label htmlFor="weight" className="form-label">
            Weight
          </label>
          <input
            id="weight"
            type="text"
            className="form-input"
            placeholder="e.g., 500g"
            {...register('weight')}
          />
        </div>
      </div>

      <div>
        <label htmlFor="careInstructions" className="form-label">
          Care Instructions
        </label>
        <textarea
          id="careInstructions"
          rows="3"
          className="form-input"
          placeholder="e.g., Hand wash only, dry clean"
          {...register('careInstructions')}
        ></textarea>
      </div>

      <div>
        <label className="form-label">Product Images *</label>
        <div className="mt-1">
          <div
            {...getRootProps()}
            className="border-2 border-dashed border-gray-300 rounded-md p-6 flex justify-center items-center hover:bg-gray-50 transition-colors cursor-pointer"
          >
            <input {...getInputProps()} />
            <div className="text-center">
              <svg
                className="mx-auto h-12 w-12 text-gray-400"
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
              <p className="mt-1 text-sm text-gray-600">
                Drag and drop images here, or click to select files
              </p>
              <p className="mt-1 text-xs text-gray-500">
                PNG, JPG, JPEG up to 5MB
              </p>
            </div>
          </div>

          {previewUrls.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-md bg-gray-200">
                    <img
                      src={url}
                      alt={`Product image ${index + 1}`}
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
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
              ))}
            </div>
          )}

          {previewUrls.length === 0 && (
            <p className="mt-2 text-sm text-red-600">
              At least one product image is required
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="submit"
          className="btn-primary"
          disabled={isSubmitting || previewUrls.length === 0}
        >
          {isSubmitting ? 'Saving...' : product ? 'Update Product' : 'Add Product'}
        </button>
      </div>
    </form>
  );
}