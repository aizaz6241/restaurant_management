/**
 * Utility to optimize remote image loading by utilizing wsrv.nl resizing proxy.
 * This converts large images on-the-fly to compressed WebP format and caches them on Cloudflare CDN.
 * 
 * @param {string} url - The original image URL
 * @param {number} width - The desired width in pixels
 * @returns {string} - The optimized image URL
 */
export const getOptimizedImageUrl = (url, width = 300) => {
  if (!url) return '';
  
  // Return relative paths, data URLs, and blobs as-is
  if (url.startsWith('/') || url.startsWith('data:') || url.startsWith('blob:')) {
    return url;
  }
  
  // Optimize external URLs (UploadThing, Unsplash, etc.)
  if (url.startsWith('http')) {
    return `https://wsrv.nl/?url=${encodeURIComponent(url)}&w=${width}&output=webp&q=75`;
  }
  
  return url;
};

/**
 * Compresses an image File object client-side using Canvas to WebP.
 * 
 * @param {File} file - The file to compress
 * @returns {Promise<File>} - Promise resolving to the compressed File
 */
export const compressImageFile = (file) => {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      return resolve(file);
    }

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob((blob) => {
          if (!blob) {
            return resolve(file);
          }
          
          // Create a new File from blob with webp extension
          const newName = file.name.replace(/\.[^/.]+$/, "") + ".webp";
          const compressedFile = new File([blob], newName, {
            type: 'image/webp',
            lastModified: Date.now()
          });
          resolve(compressedFile);
        }, 'image/webp', 0.8); // 80% quality WebP
      };
      img.onerror = () => resolve(file);
    };
    reader.onerror = () => resolve(file);
  });
};
