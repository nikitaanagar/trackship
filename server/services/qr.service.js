const qr = require('qrcode');
const { uploadToCloudinary, isMock } = require('../config/cloudinary');

const generateQRCode = async (trackingId) => {
  try {
    if (isMock) {
      console.log(`[QR Service Mock] Returning public API QR code for: ${trackingId}`);
      // Return a free API-based QR code image that represents the trackingId!
      return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(trackingId)}`;
    }

    // Generate QR code as Buffer
    const buffer = await qr.toBuffer(trackingId);

    // Upload buffer to Cloudinary
    const result = await uploadToCloudinary(buffer, 'trackship_qrcodes');
    return result.secure_url;
  } catch (error) {
    console.error(`Error generating/uploading QR code: ${error.message}`);
    // Safe fallback URL
    return `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(trackingId)}`;
  }
};

module.exports = { generateQRCode };
