const cloudinary = require('cloudinary').v2;

const isMock = !process.env.CLOUDINARY_CLOUD_NAME || 
                 process.env.CLOUDINARY_CLOUD_NAME.startsWith('mock') ||
                 !process.env.CLOUDINARY_API_KEY ||
                 process.env.CLOUDINARY_API_KEY.startsWith('mock');

if (!isMock) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

// Custom wrapper helper to support mock mode gracefully
const uploadToCloudinary = async (fileBuffer, folder = 'trackship') => {
  if (isMock) {
    console.log(`[Cloudinary Mock] Mock upload for folder: ${folder}`);
    // Return a dummy image URL from picsum
    return {
      secure_url: `https://picsum.photos/seed/${Math.random().toString(36).substring(7)}/400/300`
    };
  }

  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    ).end(fileBuffer);
  });
};

module.exports = {
  cloudinary,
  isMock,
  uploadToCloudinary
};
