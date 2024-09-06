import { v2 as cloudinary } from "cloudinary";

// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Function to delete an image from Cloudinary
const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return null;

    // Delete the file from Cloudinary
    const response = await cloudinary.uploader.destroy(publicId);

    console.log("Response from Cloudinary:", response);

    return response;
  } catch (error) {
    console.error("Error while deleting the image from Cloudinary:", error);
    return null;
  }
};

export { deleteFromCloudinary };
